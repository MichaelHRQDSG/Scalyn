"""模型上下文窗口上限。可通过环境变量覆盖。"""

from __future__ import annotations

# 常见千问/兼容模型的公开上下文上限（tokens）。未知模型回退到默认值。
KNOWN_MODEL_CONTEXT_WINDOWS: dict[str, int] = {
    "qwen-turbo": 131072,
    "qwen-plus": 131072,
    "qwen-plus-latest": 131072,
    "qwen-max": 32768,
    "qwen-max-latest": 32768,
    "qwen-long": 1000000,
    "qwen2.5-72b-instruct": 131072,
    "qwen2.5-32b-instruct": 131072,
    "qwen2.5-14b-instruct": 131072,
    "qwen2.5-7b-instruct": 131072,
    "qwen3-max": 262144,
    "qwen3-plus": 131072,
}


def resolve_max_context_tokens(model: str, override: int | None = None) -> int:
    if override and override > 0:
        return override
    name = (model or "").strip().lower()
    if name in KNOWN_MODEL_CONTEXT_WINDOWS:
        return KNOWN_MODEL_CONTEXT_WINDOWS[name]
    for key, value in KNOWN_MODEL_CONTEXT_WINDOWS.items():
        if name.startswith(key) or key in name:
            return value
    return 131072