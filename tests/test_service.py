from scalyn.config import Settings
from scalyn.models import AnalysisRequest, FullAnalysisReport
from scalyn.service import AnalysisService


class FakeGenerator:
    async def generate(self, request: AnalysisRequest) -> FullAnalysisReport:
        return FullAnalysisReport(
            report_title="综合报告",
            overall_summary="根据答题结果与分析信息生成的测试报告。",
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
            limitations=["示例数据"],
            disclaimer="本报告不构成医学诊断。",
        )


async def test_service_adds_report_metadata() -> None:
    request = AnalysisRequest.model_validate(
        {
            "answer_results": {
                "assessments": [
                    {"scale_id": "demo", "total_score": 10},
                    {"scale_id": "demo-2", "total_score": 8},
                ]
            },
            "analysis_info": {"summary": "中等压力"},
            "other_info": {},
        }
    )
    settings = Settings(qwen_api_key="test", qwen_model="qwen-test")

    result = await AnalysisService(FakeGenerator(), settings).analyze(request)

    assert result.meta.report_id.startswith("rpt_")
    assert result.meta.model == "qwen-test"
    assert result.meta.assessment_count == 2
    assert result.report.report_title == "综合报告"