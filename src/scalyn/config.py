from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Scalyn"
    app_env: str = "development"
    app_log_level: str = "INFO"
    app_cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    qwen_api_key: str = ""
    qwen_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    qwen_model: str = "qwen-plus"
    qwen_response_format: Literal["json_object", "json_schema"] = "json_object"
    qwen_temperature: float = Field(default=0.2, ge=0, le=2)
    qwen_max_tokens: int = Field(default=8000, ge=1000, le=32000)
    qwen_timeout_seconds: float = Field(default=120, gt=0)
    qwen_max_retries: int = Field(default=2, ge=0, le=5)

    @property
    def qwen_configured(self) -> bool:
        return bool(self.qwen_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
