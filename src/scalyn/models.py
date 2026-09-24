from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class UserProfile(StrictModel):
    user_id: Optional[str] = Field(default=None, description="业务侧匿名用户 ID")
    age: Optional[int] = Field(default=None, ge=6, le=120)
    gender: Optional[str] = None
    occupation: Optional[str] = None
    organization: Optional[str] = None
    additional_info: dict[str, Any] = Field(default_factory=dict)


class AnswerOption(StrictModel):
    option_id: Optional[str] = None
    option_text: str
    value: Optional[Union[float, str, bool]] = None


class ScaleAnswer(StrictModel):
    question_id: str
    question_text: str
    selected: AnswerOption
    dimension: Optional[str] = None
    reverse_scored: bool = False


class DimensionScore(StrictModel):
    name: str
    score: float
    max_score: Optional[float] = Field(default=None, gt=0)
    percentile: Optional[float] = Field(default=None, ge=0, le=100)
    level: Optional[str] = None
    reference: Optional[str] = None


class AssessmentResult(StrictModel):
    scale_id: str
    scale_name: str
    scale_version: Optional[str] = None
    description: Optional[str] = None
    completed_at: Optional[datetime] = None
    total_score: Optional[float] = None
    max_score: Optional[float] = Field(default=None, gt=0)
    severity: Optional[str] = None
    interpretation: Optional[str] = None
    dimensions: list[DimensionScore] = Field(default_factory=list)
    answers: list[ScaleAnswer] = Field(default_factory=list)

    @model_validator(mode="after")
    def require_analyzable_data(self) -> AssessmentResult:
        if self.total_score is None and not self.dimensions and not self.answers:
            raise ValueError("每个量表至少需要总分、维度得分或逐题回答中的一种数据")
        return self


class AnalysisRequest(StrictModel):
    user: UserProfile = Field(default_factory=UserProfile)
    assessments: list[AssessmentResult] = Field(min_length=1, max_length=30)
    analysis_goal: str = "综合分析用户当前心理特征、优势、风险与可执行建议"
    context: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="可选业务背景，不应包含不必要的直接身份信息",
    )
    language: Literal["zh-CN", "en-US"] = "zh-CN"


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
