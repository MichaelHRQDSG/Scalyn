from __future__ import annotations

from datetime import datetime, timezone
from typing import Protocol
from uuid import uuid4

from scalyn.config import Settings
from scalyn.models import (
    AnalysisRequest,
    AnalysisResponse,
    ReportMeta,
)
from scalyn.qwen import GenerateResult


class ReportGenerator(Protocol):
    async def generate(self, request: AnalysisRequest) -> GenerateResult: ...


class AnalysisService:
    def __init__(self, generator: ReportGenerator, settings: Settings) -> None:
        self.generator = generator
        self.settings = settings

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        result = await self.generator.generate(request)
        return AnalysisResponse(
            meta=ReportMeta(
                report_id=f"rpt_{uuid4().hex}",
                generated_at=datetime.now(timezone.utc),
                model=self.settings.qwen_model,
                assessment_count=request.count_answer_items(),
                usage=result.usage,
            ),
            report=result.report,
        )