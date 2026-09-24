from scalyn.config import Settings
from scalyn.models import AnalysisRequest, FullAnalysisReport
from scalyn.service import AnalysisService


class FakeGenerator:
    async def generate(self, request: AnalysisRequest) -> FullAnalysisReport:
        return FullAnalysisReport(
            report_title="综合报告",
            overall_summary="根据一份量表生成的测试报告。",
            key_strengths=["愿意了解自身状态"],
            key_concerns=[],
            dimensions=[],
            cross_scale_insights=[],
            risks=[],
            recommendations=[
                {
                    "priority": "short_term",
                    "title": "持续观察",
                    "rationale": "当前信息有限",
                    "actions": ["一周后复测"],
                }
            ],
            follow_up_questions=[],
            limitations=["仅包含一份量表"],
            disclaimer="本报告不构成医学诊断。",
        )


async def test_service_adds_report_metadata() -> None:
    request = AnalysisRequest.model_validate(
        {
            "assessments": [
                {
                    "scale_id": "demo",
                    "scale_name": "示例量表",
                    "total_score": 10,
                }
            ]
        }
    )
    settings = Settings(qwen_api_key="test", qwen_model="qwen-test")

    result = await AnalysisService(FakeGenerator(), settings).analyze(request)

    assert result.meta.report_id.startswith("rpt_")
    assert result.meta.model == "qwen-test"
    assert result.meta.assessment_count == 1
    assert result.report.report_title == "综合报告"
