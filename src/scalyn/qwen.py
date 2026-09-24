from __future__ import annotations

import json
from typing import Any

from openai import AsyncOpenAI
from pydantic import ValidationError

from scalyn.config import Settings
from scalyn.models import AnalysisRequest, FullAnalysisReport
from scalyn.prompts import SYSTEM_PROMPT, build_repair_prompt, build_user_prompt


class QwenAnalysisError(RuntimeError):
    """千问调用或返回结果校验失败。"""


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

    async def generate(self, request: AnalysisRequest) -> FullAnalysisReport:
        if not self.settings.qwen_configured:
            raise QwenAnalysisError("未配置 QWEN_API_KEY，请先创建 .env 文件")

        messages: list[dict[str, str]] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(request)},
        ]
        last_error: Exception | None = None
        attempts = self.settings.qwen_max_retries + 1

        for attempt_index in range(attempts):
            try:
                response = await self._client().chat.completions.create(
                    model=self.settings.qwen_model,
                    messages=messages,
                    response_format=self._response_format(),
                    temperature=self.settings.qwen_temperature,
                    max_tokens=self.settings.qwen_max_tokens,
                )
                content = response.choices[0].message.content
                if not content:
                    raise QwenAnalysisError("千问返回了空内容")
                try:
                    return FullAnalysisReport.model_validate(json.loads(content))
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
