import json

from scalyn.models import AnalysisRequest, FullAnalysisReport

SYSTEM_PROMPT = """你是一名谨慎、循证的心理量表综合分析助手。你的任务是把多个量表的结果和逐题回答整合为结构化报告。

必须遵守：
1. 只依据输入证据分析，不虚构常模、诊断、病史、量表结论或因果关系。
2. 区分“量表提示”“可能解释”和“确定事实”；信息不足时明确说明。
3. 多量表结论冲突时展示冲突，不强行合并；分析可能来自测量维度、时间或情境差异。
4. 不作医学或精神障碍诊断，不替代医生、心理治疗师或紧急援助。
5. 发现自伤、自杀、伤人、虐待或严重功能损害线索时，将风险标为 high/urgent，并给出立即联系当地急救、危机干预热线及可信任人员的建议。
6. 建议必须具体、分优先级、可执行，且与输入证据对应。
7. 不输出用户输入中不存在的个人身份信息。
8. 所有维度 score 统一为 0-100 的报告展示强度；若无法合理换算，使用 50 并将 confidence 标为 low，说明不可与原始量表分数等同。
9. 输出必须是合法 JSON 对象，且只能使用下面指定的字段名；禁止自创字段，不要输出 Markdown 或额外文字。
"""


REPORT_FIELD_HINT = """
顶层必须且只能包含这些字段：
- report_title: string
- overall_summary: string
- key_strengths: string[]
- key_concerns: string[]
- dimensions: object[]，每项含 dimension, score(0-100), level(low|moderate|high|unknown), summary, evidence[{assessment, evidence}], confidence(low|medium|high)
- cross_scale_insights: object[]，每项含 title, finding, supporting_scales, possible_explanations
- risks: object[]，每项含 category, level(none|low|medium|high|urgent), evidence, action
- recommendations: object[]，每项含 priority(immediate|short_term|long_term), title, rationale, actions
- follow_up_questions: string[]
- limitations: string[]
- disclaimer: string

禁止输出 report_metadata、stress_analysis、emotional_state_inference、personal_strengths_analysis、improvement_directions、integrated_summary 等自定义字段。
""".strip()


def build_user_prompt(request: AnalysisRequest) -> str:
    payload = request.model_dump(mode="json", exclude_none=True)
    schema = FullAnalysisReport.model_json_schema()
    return (
        "请生成多维度完整版综合分析报告，并以 JSON 格式输出。分析目标："
        f"{request.analysis_goal}\n\n"
        f"{REPORT_FIELD_HINT}\n\n"
        "完整 JSON Schema 如下，必须严格遵守：\n"
        f"{json.dumps(schema, ensure_ascii=False, indent=2)}\n\n"
        "输入数据如下（JSON）：\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def build_repair_prompt(request: AnalysisRequest, previous_content: str, validation_error: str) -> str:
    return (
        "你上一次返回的 JSON 未通过结构校验。请只输出修正后的合法 JSON，"
        "不要解释，不要 Markdown。\n\n"
        f"{REPORT_FIELD_HINT}\n\n"
        "校验错误：\n"
        f"{validation_error}\n\n"
        "你上一次的输出：\n"
        f"{previous_content}\n\n"
        "原始分析请求：\n"
        f"{json.dumps(request.model_dump(mode='json', exclude_none=True), ensure_ascii=False, indent=2)}"
    )
