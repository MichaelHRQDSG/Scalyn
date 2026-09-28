from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Any

from openai import AsyncOpenAI
from pydantic import ValidationError

from scalyn.config import Settings
from scalyn.model_limits import resolve_max_context_tokens
from scalyn.models import AnalysisRequest, FullAnalysisReport, ModelUsageMeta
from scalyn.prompts import SYSTEM_PROMPT, build_repair_prompt, build_user_prompt


class QwenAnalysisError(RuntimeError):
    """千问调用或返回结果校验失败。"""


@dataclass
class GenerateResult:
    report: FullAnalysisReport
    usage: ModelUsageMeta


@dataclass
class _UsageAccumulator:
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    actual_token_consumption: int = 0
    response_time_ms: float = 0.0
    api_calls: int = 0
    last_input_tokens: int = 0
    last_output_tokens: int = 0
    last_total_tokens: int = 0
    last_response_time_ms: float = 0.0

    def record(self, usage: Any, elapsed_ms: float) -> None:
        prompt = int(getattr(usage, "prompt_tokens", 0) or 0) if usage else 0
        completion = int(getattr(usage, "completion_tokens", 0) or 0) if usage else 0
        total = int(getattr(usage, "total_tokens", 0) or 0) if usage else 0
        if total <= 0:
            total = prompt + completion
        self.api_calls += 1
        self.actual_token_consumption += total
        self.last_input_tokens = prompt
        self.last_output_tokens = completion
        self.last_total_tokens = total
        self.last_response_time_ms = elapsed_ms
        self.input_tokens = prompt
        self.output_tokens = completion
        self.total_tokens = total
        self.response_time_ms = elapsed_ms

    def to_meta(self, model: str, max_context_override: int | None) -> ModelUsageMeta:
        return ModelUsageMeta(
            max_context_tokens=resolve_max_context_tokens(model, max_context_override),
            input_tokens=self.last_input_tokens,
            output_tokens=self.last_output_tokens,
            total_tokens=self.last_total_tokens,
            actual_token_consumption=self.actual_token_consumption,
            response_time_ms=round(self.last_response_time_ms, 2),
            api_calls=self.api_calls,
        )


class QwenReportClient:
    def __init__(self, settings: Settings, client: AsyncOpenAI | None = None) -> None:
        self.settings = settings
        self.client = client

    def _client(self) -> AsyncOpenAI:
        if self.client is None:
            self.client = AsyncOpenAI(
                api_key=self.settings.qwen_api_key,
                base_url=self.settings.qwen_base_url,
                timeout=self.settings.qwen_timeout_seconds,
            )
        return self.client

    def _response_format(self) -> dict[str, Any]:
        if self.settings.qwen_response_format == "json_schema":
            return {
                "type": "json_schema",
                "json_schema": {
                    "name": "full_analysis_report",
                    "description": "多量表综合分析报告",
                    "strict": True,
                    "schema": FullAnalysisReport.model_json_schema(),
                },
            }
        return {"type": "json_object"}

    async def generate(self, request: AnalysisRequest) -> GenerateResult:
        if not self.settings.qwen_configured:
            raise QwenAnalysisError("未配置 QWEN_API_KEY，请先创建 .env 文件")

        messages: list[dict[str, str]] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(request)},
        ]
        last_error: Exception | None = None
        attempts = self.settings.qwen_max_retries + 1
        usage_acc = _UsageAccumulator()

        for attempt_index in range(attempts):
            try:
                started = time.perf_counter()
                response = await self._client().chat.completions.create(
                    model=self.settings.qwen_model,
                    messages=messages,
                    response_format=self._response_format(),
                    temperature=self.settings.qwen_temperature,
                    max_tokens=self.settings.qwen_max_tokens,
                )
                elapsed_ms = (time.perf_counter() - started) * 1000
                usage_acc.record(getattr(response, "usage", None), elapsed_ms)

                content = response.choices[0].message.content
                if not content:
                    raise QwenAnalysisError("千问返回了空内容")
                try:
                    report = FullAnalysisReport.model_validate(json.loads(content))
                    return GenerateResult(
                        report=report,
                        usage=usage_acc.to_meta(
                            self.settings.qwen_model,
                            self.settings.qwen_max_context_tokens,
                        ),
                    )
                except (json.JSONDecodeError, ValidationError) as exc:
                    last_error = QwenAnalysisError(
                        f"千问返回内容未通过报告结构校验：{exc}"
                    )
                    if attempt_index >= attempts - 1:
                        raise last_error from exc
                    messages = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": build_repair_prompt(request, content, str(exc)),
                        },
                    ]
            except QwenAnalysisError:
                raise
            except Exception as exc:
                last_error = exc
                if attempt_index >= attempts - 1:
                    break

        raise QwenAnalysisError(f"生成报告失败：{last_error}") from last_error