import pytest
from pydantic import ValidationError

from scalyn.models import AnalysisRequest


def test_other_info_defaults_to_empty_object() -> None:
    request = AnalysisRequest.model_validate(
        {
            "answer_results": {"scale_id": "a", "total_score": 10},
            "analysis_info": {"level": "moderate"},
        }
    )
    assert request.other_info == {}


def test_other_info_null_becomes_empty_object() -> None:
    request = AnalysisRequest.model_validate(
        {
            "answer_results": [{"scale_id": "a"}],
            "analysis_info": {"ok": True},
            "other_info": None,
        }
    )
    assert request.other_info == {}


def test_rejects_non_json_payload() -> None:
    with pytest.raises(ValidationError, match="JSON 对象或数组"):
        AnalysisRequest.model_validate(
            {
                "answer_results": "not-json-object",
                "analysis_info": {},
            }
        )


def test_count_answer_items_from_list_and_nested() -> None:
    listed = AnalysisRequest.model_validate(
        {
            "answer_results": [{"id": 1}, {"id": 2}],
            "analysis_info": {},
        }
    )
    nested = AnalysisRequest.model_validate(
        {
            "answer_results": {"assessments": [{"id": 1}, {"id": 2}, {"id": 3}]},
            "analysis_info": {"summary": "ok"},
            "other_info": {"note": "x"},
        }
    )
    assert listed.count_answer_items() == 2
    assert nested.count_answer_items() == 3