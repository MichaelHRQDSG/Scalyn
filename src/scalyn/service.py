from __future__ import annotations

from datetime import datetime, timezone
from typing import Protocol
from uuid import uuid4

from scalyn.config import Settings
from scalyn.models import AnalysisRequest, AnalysisResponse, FullAnalysisReport, ReportMeta


class ReportGenerator(Protocol):
    async def generate(self, request: AnalysisRequest) -> FullAnalysisReport: ...


class AnalysisService:
    def __init__(self, generator: ReportGenerator, settings: Settings) -> None:
        self.generator = generator
        self.settings = settings

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        report = await self.generator.generate(request)
        return AnalysisResponse(
            meta=ReportMeta(
                report_id=f"rpt_{uuid4().hex}",
                generated_at=datetime.now(timezone.utc),
                model=self.settings.qwen_model,
                assessment_count=len(request.assessments),
            ),
            report=report,
        )
