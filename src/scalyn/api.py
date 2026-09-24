from __future__ import annotations

from functools import lru_cache
from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status

from scalyn.config import Settings, get_settings
from scalyn.models import AnalysisRequest, AnalysisResponse
from scalyn.qwen import QwenAnalysisError, QwenReportClient
from scalyn.service import AnalysisService

router = APIRouter()


@lru_cache
def get_analysis_service() -> AnalysisService:
    settings = get_settings()
    return AnalysisService(QwenReportClient(settings), settings)


@router.get("/health", tags=["system"])
async def health(settings: Settings = Depends(get_settings)) -> dict[str, Union[str, bool]]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
        "qwenConfigured": settings.qwen_configured,
    }


@router.post(
    "/api/v1/reports/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["reports"],
    summary="综合分析多个 AI 量表并生成完整报告",
)
async def analyze_assessments(
    body: AnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisResponse:
    try:
        return await service.analyze(body)
    except QwenAnalysisError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
