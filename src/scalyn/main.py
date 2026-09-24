import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scalyn.api import router
from scalyn.config import get_settings

settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.app_log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="使用千问大模型整合多个心理/行为量表并生成多维度分析报告。",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(router)
