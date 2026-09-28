import { NextRequest, NextResponse } from "next/server";

import {
  buildAnalyzeRequest,
  createHistoryId,
  saveHistory,
} from "@/lib/history";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    text?: string;
    analysisGoal?: string;
  };
  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ detail: "请输入要分析的文本" }, { status: 400 });
  }

  const id = await createHistoryId();
  const createdAt = new Date().toISOString();
  const analyzeRequest = buildAnalyzeRequest(text, body.analysisGoal);
  const apiBase = (
    process.env.SCALYN_API_BASE_URL || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiBase}/api/v1/reports/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analyzeRequest),
    });
    const payload = await response.json();
    if (!response.ok) {
      const detail =
        typeof payload?.detail === "string"
          ? payload.detail
          : JSON.stringify(payload);
      const record = await saveHistory({
        id,
        createdAt,
        inputText: text,
        analysisGoal: analyzeRequest.analysis_goal,
        status: "error",
        error: detail,
        request: analyzeRequest,
      });
      return NextResponse.json(record, { status: 502 });
    }

    const record = await saveHistory({
      id,
      createdAt,
      inputText: text,
      analysisGoal: analyzeRequest.analysis_goal,
      status: "success",
      request: analyzeRequest,
      response: payload,
    });
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "调用分析服务失败";
    const record = await saveHistory({
      id,
      createdAt,
      inputText: text,
      analysisGoal: analyzeRequest.analysis_goal,
      status: "error",
      error: message,
      request: analyzeRequest,
    });
    return NextResponse.json(record, { status: 502 });
  }
}
