import pytest
from pydantic import ValidationError

from scalyn.models import AnalysisRequest


def test_assessment_requires_analyzable_data() -> None:
    with pytest.raises(ValidationError, match="至少需要总分"):
        AnalysisRequest.model_validate(
            {
                "assessments": [
                    {
                        "scale_id": "empty",
                        "scale_name": "空量表",
                    }
                ]
            }
        )


def test_request_accepts_multiple_assessment_formats() -> None:
    request = AnalysisRequest.model_validate(
        {
            "assessments": [
                {
                    "scale_id": "scored",
                    "scale_name": "计分量表",
                    "total_score": 12,
                    "max_score": 20,
                },
                {
                    "scale_id": "answered",
                    "scale_name": "逐题量表",
                    "answers": [
                        {
                            "question_id": "q1",
                            "question_text": "示例题",
                            "selected": {"option_text": "符合", "value": 1},
                        }
                    ],
                },
            ]
        }
    )

    assert len(request.assessments) == 2
