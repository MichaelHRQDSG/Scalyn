"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

type HistoryItem = {
  id: string;
  createdAt: string;
  status: "success" | "error";
  preview: string;
  reportTitle: string | null;
  error: string | null;
};

type HistoryRecord = {
  id: string;
  createdAt: string;
  preview: string;
  status: "success" | "error";
  error?: string;
  request?: {
    answer_results?: unknown;
    analysis_info?: unknown;
    other_info?: unknown;
  };
  response?: {
    meta?: {
      report_id?: string;
      model?: string;
      assessment_count?: number;
      usage?: {
        max_context_tokens?: number;
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
        actual_token_consumption?: number;
        response_time_ms?: number;
        api_calls?: number;
      };
    };
    report?: {
      report_title?: string;
      overall_summary?: string;
      key_strengths?: string[];
      key_concerns?: string[];
      dimensions?: Array<{
        dimension: string;
        score: number;
        level: string;
        summary: string;
      }>;
      recommendations?: Array<{
        priority: string;
        title: string;
        rationale: string;
        actions: string[];
      }>;
      risks?: Array<{
        category: string;
        level: string;
        action: string;
      }>;
      disclaimer?: string;
    };
  };
};

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 18,
  boxShadow: "var(--shadow)",
  padding: 24,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 14,
  resize: "vertical",
  background: "#fbfaf7",
  lineHeight: 1.55,
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: 13,
};

const DEFAULT_ANSWER_RESULTS = `{
  "assessments": [
    {
      "scale_id": "stress-demo",
      "scale_name": "压力感受示例量表",
      "total_score": 18,
      "max_score": 40,
      "severity": "中等"
    }
  ]
}`;

const DEFAULT_ANALYSIS_INFO = `{
  "summary": "压力处于中等水平",
  "dimensions": [
    { "name": "失控感", "score": 10, "max_score": 20, "level": "中等" }
  ]
}`;

const DEFAULT_OTHER_INFO = `{}`;

export default function HomePage() {
  const [answerResultsRaw, setAnswerResultsRaw] = useState(DEFAULT_ANSWER_RESULTS);
  const [analysisInfoRaw, setAnalysisInfoRaw] = useState(DEFAULT_ANALYSIS_INFO);
  const [otherInfoRaw, setOtherInfoRaw] = useState(DEFAULT_OTHER_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryRecord | null>(null);

  const loadHistory = useCallback(async () => {
    const response = await fetch("/api/history");
    const data = await response.json();
    setHistory(data.items || []);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function openHistory(id: string) {
    const response = await fetch(`/api/history/${id}`);
    if (!response.ok) {
      setError("读取历史记录失败");
      return;
    }
    setSelected(await response.json());
  }

  async function onAnalyze() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerResultsRaw,
          analysisInfoRaw,
          otherInfoRaw,
        }),
      });
      const record = (await response.json()) as HistoryRecord & { detail?: string };
      if (!response.ok && !record.id) {
        setError(record.detail || "请求失败");
        return;
      }
      await loadHistory();
      setSelected(record);
      if (record.status === "error") {
        setError(record.error || "分析失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  const report = selected?.response?.report;

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 20px 80px" }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: "var(--accent)", fontWeight: 700 }}>
          SCALYN
        </div>
        <h1 style={{ margin: "8px 0 10px", fontSize: 36, fontWeight: 700 }}>
          量表分析台
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          输入答题结果、答题后分析信息与其他信息（JSON），点击生成报告。每次调用保存为一个 JSON。
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <section style={panelStyle}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            量表答题结果 answer_results（JSON）
          </label>
          <textarea
            value={answerResultsRaw}
            onChange={(event) => setAnswerResultsRaw(event.target.value)}
            rows={10}
            style={textareaStyle}
          />

          <label style={{ display: "block", fontWeight: 600, margin: "16px 0 8px" }}>
            答题后分析信息 analysis_info（JSON）
          </label>
          <textarea
            value={analysisInfoRaw}
            onChange={(event) => setAnalysisInfoRaw(event.target.value)}
            rows={8}
            style={textareaStyle}
          />

          <label style={{ display: "block", fontWeight: 600, margin: "16px 0 8px" }}>
            其他信息 other_info（JSON，可空对象）
          </label>
          <textarea
            value={otherInfoRaw}
            onChange={(event) => setOtherInfoRaw(event.target.value)}
            rows={5}
            style={textareaStyle}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => void onAnalyze()}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "12px 22px",
                background: loading ? "#9bb5a8" : "var(--accent)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {loading ? "分析中..." : "生成分析报告"}
            </button>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              请先确保后端服务已启动在 8000 端口
            </span>
          </div>

          {error ? (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                background: "#f8ece9",
                color: "var(--danger)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          ) : null}

          {selected ? (
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 22 }}>
                  {report?.report_title || "调用结果"}
                </h2>
                <span
                  style={{
                    alignSelf: "start",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background:
                      selected.status === "success" ? "var(--accent-soft)" : "#f8ece9",
                    color: selected.status === "success" ? "var(--ok)" : "var(--danger)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {selected.status === "success" ? "成功" : "失败"}
                </span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                {selected.id} · {new Date(selected.createdAt).toLocaleString()}
                {selected.response?.meta?.model ? ` · 模型 ${selected.response.meta.model}` : ""}
              </p>

              {selected.status === "success" && selected.response?.meta?.usage ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 10,
                    margin: "12px 0 18px",
                  }}
                >
                  {[
                    ["最大上下文", selected.response.meta.usage.max_context_tokens],
                    ["input tokens", selected.response.meta.usage.input_tokens],
                    ["total tokens", selected.response.meta.usage.total_tokens],
                    ["实际消耗", selected.response.meta.usage.actual_token_consumption],
                    ["响应时间(ms)", selected.response.meta.usage.response_time_ms],
                    ["API 次数", selected.response.meta.usage.api_calls],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        background: "#fbfaf7",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
                      <div style={{ marginTop: 4, fontWeight: 700, fontSize: 16 }}>
                        {value ?? "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {selected.status === "error" ? (
                <p style={{ color: "var(--danger)", whiteSpace: "pre-wrap" }}>
                  {selected.error}
                </p>
              ) : (
                <>
                  <p style={{ lineHeight: 1.8 }}>{report?.overall_summary}</p>
                  <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                    <Block title="关键优势" items={report?.key_strengths} />
                    <Block title="关注点" items={report?.key_concerns} />
                    {report?.dimensions?.length ? (
                      <div>
                        <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>维度分析</h3>
                        <div style={{ display: "grid", gap: 10 }}>
                          {report.dimensions.map((item) => (
                            <div
                              key={`${item.dimension}-${item.score}`}
                              style={{
                                border: "1px solid var(--line)",
                                borderRadius: 12,
                                padding: 12,
                                background: "#fbfaf7",
                              }}
                            >
                              <strong>
                                {item.dimension} · {item.score} · {item.level}
                              </strong>
                              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                                {item.summary}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {report?.recommendations?.length ? (
                      <div>
                        <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>建议</h3>
                        <div style={{ display: "grid", gap: 10 }}>
                          {report.recommendations.map((item) => (
                            <div
                              key={`${item.priority}-${item.title}`}
                              style={{
                                border: "1px solid var(--line)",
                                borderRadius: 12,
                                padding: 12,
                                background: "#fbfaf7",
                              }}
                            >
                              <strong>
                                [{item.priority}] {item.title}
                              </strong>
                              <div style={{ marginTop: 6 }}>{item.rationale}</div>
                              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                                {item.actions?.map((action) => (
                                  <li key={action}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {report?.disclaimer ? (
                      <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
                        {report.disclaimer}
                      </p>
                    ) : null}
                  </div>
                </>
              )}

              <details style={{ marginTop: 18 }}>
                <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
                  查看原始 JSON
                </summary>
                <pre
                  style={{
                    marginTop: 10,
                    padding: 14,
                    overflow: "auto",
                    background: "#1f2a24",
                    color: "#f4f1ea",
                    borderRadius: 12,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </details>
            </div>
          ) : null}
        </section>

        <aside style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>历史调用</h2>
            <button
              type="button"
              onClick={() => void loadHistory()}
              style={{
                border: "1px solid var(--line)",
                background: "#fff",
                borderRadius: 999,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              刷新
            </button>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
            每次调用保存在 `playground/data/history/*.json`
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {history.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 14 }}>暂无历史记录</div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openHistory(item.id)}
                  style={{
                    textAlign: "left",
                    border:
                      selected?.id === item.id
                        ? "1px solid var(--accent)"
                        : "1px solid var(--line)",
                    background: selected?.id === item.id ? "var(--accent-soft)" : "#fbfaf7",
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>
                      {item.reportTitle || "分析调用"}
                    </strong>
                    <span
                      style={{
                        color: item.status === "success" ? "var(--ok)" : "var(--danger)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.status === "success" ? "成功" : "失败"}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                    {item.preview}
                    {item.preview.length >= 80 ? "..." : ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Block({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}