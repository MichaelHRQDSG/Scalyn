from __future__ import annotations

import json
from typing import Any

from openai import AsyncOpenAI
from pydantic import ValidationError
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

from scalyn.config import Settings
from scalyn.models import AnalysisRequest, FullAnalysisReport
from scalyn.prompts import SYSTEM_PROMPT, build_user_prompt


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

        last_error: Exception | None = None
        retrying = AsyncRetrying(
            stop=stop_after_attempt(self.settings.qwen_max_retries + 1),
            wait=wait_exponential(multiplier=1, min=1, max=8),
            retry=retry_if_exception_type(Exception),
            reraise=True,
        )
        try:
            async for attempt in retrying:
                with attempt:
                    response = await self._client().chat.completions.create(
                        model=self.settings.qwen_model,
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": build_user_prompt(request)},
                        ],
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
                        last_error = exc
                        raise QwenAnalysisError(f"千问返回内容未通过报告结构校验：{exc}") from exc
        except Exception as exc:
            last_error = exc

        raise QwenAnalysisError(f"生成报告失败：{last_error}") from last_error
