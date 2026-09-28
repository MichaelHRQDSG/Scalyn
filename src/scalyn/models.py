from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


JsonValue = Union[dict[str, Any], list[Any]]


class AnalysisRequest(StrictModel):
    """综合分析请求：三块 JSON 输入。"""

    answer_results: JsonValue = Field(
        ...,
        description="量表答题结果信息（JSON 对象或数组）",
    )
    analysis_info: JsonValue = Field(
        ...,
        description="答题后的分析信息（JSON 对象或数组）",
    )
    other_info: JsonValue = Field(
        default_factory=dict,
        description="其他信息（JSON 对象或数组），默认为空对象 {}",
    )

    @field_validator("answer_results", "analysis_info", mode="before")
    @classmethod
    def require_json_object_or_array(cls, value: Any) -> Any:
        if not isinstance(value, (dict, list)):
            raise ValueError("必须是 JSON 对象或数组")
        return value

    @field_validator("other_info", mode="before")
    @classmethod
    def normalize_other_info(cls, value: Any) -> Any:
        if value is None:
            return {}
        if not isinstance(value, (dict, list)):
            raise ValueError("必须是 JSON 对象或数组")
        return value

    def count_answer_items(self) -> int:
        if isinstance(self.answer_results, list):
            return len(self.answer_results)
        if isinstance(self.answer_results, dict):
            nested = self.answer_results.get("assessments")
            if isinstance(nested, list):
                return len(nested)
            return 1 if self.answer_results else 0
        return 0


class EvidenceItem(StrictModel):
    assessment: str
    evidence: str


class DimensionAnalysis(StrictModel):
    dimension: str
    score: float = Field(ge=0, le=100, description="综合归一化强度，仅用于报告展示")
    level: Literal["low", "moderate", "high", "unknown"]
    summary: str
    evidence: list[EvidenceItem]
    confidence: Literal["low", "medium", "high"]


class CrossScaleInsight(StrictModel):
    title: str
    finding: str
    supporting_scales: list[str]
    possible_explanations: list[str]


class RiskItem(StrictModel):
    category: str
    level: Literal["none", "low", "medium", "high", "urgent"]
    evidence: list[str]
    action: str


class Recommendation(StrictModel):
    priority: Literal["immediate", "short_term", "long_term"]
    title: str
    rationale: str
    actions: list[str]


class FullAnalysisReport(StrictModel):
    report_title: str
    overall_summary: str
    key_strengths: list[str]
    key_concerns: list[str]
    dimensions: list[DimensionAnalysis]
    cross_scale_insights: list[CrossScaleInsight]
    risks: list[RiskItem]
    recommendations: list[Recommendation]
    follow_up_questions: list[str]
    limitations: list[str]
    disclaimer: str


class ReportMeta(StrictModel):
    report_id: str
    generated_at: datetime
    model: str
    assessment_count: int


class AnalysisResponse(StrictModel):
    meta: ReportMeta
    report: FullAnalysisReport