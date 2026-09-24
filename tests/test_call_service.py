"""手动调用 Scalyn 分析服务的脚本。

在项目根目录执行：

    conda activate scalyn
    python tests/test_call_service.py

可选参数：

    python tests/test_call_service.py --http
    python tests/test_call_service.py --request examples/analysis-request.json
    python tests/test_call_service.py --base-url http://127.0.0.1:8000
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "src") not in sys.path:
    sys.path.insert(0, str(ROOT / "src"))

DEFAULT_REQUEST = ROOT / "examples" / "analysis-request.json"


def load_request(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"请求文件不存在：{path}")
    return json.loads(path.read_text(encoding="utf-8"))


def print_report(payload: dict) -> None:
    meta = payload.get("meta", {})
    report = payload.get("report", {})
    print("=" * 60)
    print("报告 ID :", meta.get("report_id", "-"))
    print("模型    :", meta.get("model", "-"))
    print("量表数  :", meta.get("assessment_count", "-"))
    print("生成时间:", meta.get("generated_at", "-"))
    print("-" * 60)
    print("标题    :", report.get("report_title", "-"))
    print("总览    :", report.get("overall_summary", "-"))
    print("优势    :", "；".join(report.get("key_strengths") or []) or "-")
    print("关注点  :", "；".join(report.get("key_concerns") or []) or "-")
    print("-" * 60)
    print(json.dumps(payload, ensure_ascii=False, indent=2))


async def call_service(request_path: Path) -> dict:
    from scalyn.config import get_settings
    from scalyn.models import AnalysisRequest
    from scalyn.qwen import QwenReportClient
    from scalyn.service import AnalysisService

    settings = get_settings()
    if not settings.qwen_configured:
        raise RuntimeError("未配置 QWEN_API_KEY，请先在 .env 中填写后重试")

    request = AnalysisRequest.model_validate(load_request(request_path))
    service = AnalysisService(QwenReportClient(settings), settings)
    print(f"正在调用千问模型：{settings.qwen_model}")
    print(f"请求文件：{request_path}")
    response = await service.analyze(request)
    return response.model_dump(mode="json")


def call_http(request_path: Path, base_url: str) -> dict:
    import httpx

    url = f"{base_url.rstrip('/')}/api/v1/reports/analyze"
    body = load_request(request_path)
    print(f"正在请求 HTTP 接口：{url}")
    print(f"请求文件：{request_path}")
    with httpx.Client(timeout=180.0) as client:
        response = client.post(url, json=body)
    if response.status_code >= 400:
        raise RuntimeError(f"HTTP {response.status_code}: {response.text}")
    return response.json()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scalyn 服务调用测试脚本")
    parser.add_argument(
        "--request",
        type=Path,
        default=DEFAULT_REQUEST,
        help="分析请求 JSON 路径",
    )
    parser.add_argument(
        "--http",
        action="store_true",
        help="通过已启动的 FastAPI 服务调用，而不是直接调用 AnalysisService",
    )
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8000",
        help="HTTP 模式下的服务地址",
    )
    parser.add_argument(
        "--save",
        type=Path,
        default=None,
        help="可选：把完整响应保存到指定 JSON 文件",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.http:
            payload = call_http(args.request, args.base_url)
        else:
            payload = asyncio.run(call_service(args.request))
    except Exception as exc:
        print(f"调用失败：{exc}", file=sys.stderr)
        return 1

    print_report(payload)
    if args.save:
        args.save.parent.mkdir(parents=True, exist_ok=True)
        args.save.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"\n已保存完整响应到：{args.save}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
