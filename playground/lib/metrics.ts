export type TokenUsageSource = "api" | "estimated";

export type CallMetrics = {
  model: string;
  maxContextWindow: number | null;
  maxContextWindowNote: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenSource: TokenUsageSource;
  latencyMs: number;
  startedAt: string;
  endedAt: string;
};

/** 常见千问兼容模型的公开上下文窗口（tokens）。未知模型返回 null。 */
const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  "qwen-turbo": 131072,
  "qwen-plus": 131072,
  "qwen-max": 131072,
  "qwen-long": 1000000,
  "qwen2.5-72b-instruct": 131072,
  "qwen2.5-32b-instruct": 131072,
  "qwen2.5-14b-instruct": 131072,
  "qwen2.5-7b-instruct": 131072,
  "qwen3-max": 262144,
  "qwen3-plus": 131072,
  "qwen3-turbo": 131072,
};

export function resolveMaxContextWindow(model: string): {
  maxContextWindow: number | null;
  note: string;
} {
  const key = model.trim().toLowerCase();
  if (!key) {
    return { maxContextWindow: null, note: "未返回模型名，无法匹配上下文窗口" };
  }
  if (MODEL_CONTEXT_WINDOWS[key] != null) {
    return {
      maxContextWindow: MODEL_CONTEXT_WINDOWS[key],
      note: "来自 playground 内置模型目录（公开规格）",
    };
  }
  const matched = Object.entries(MODEL_CONTEXT_WINDOWS).find(([name]) =>
    key.startsWith(name),
  );
  if (matched) {
    return {
      maxContextWindow: matched[1],
      note: `按前缀匹配模型目录：${matched[0]}`,
    };
  }
  return {
    maxContextWindow: null,
    note: `未收录模型「${model}」的上下文窗口，可在 playground/lib/metrics.ts 补充`,
  };
}

/** 粗略估算：中英混合按字符折算，仅在后端未返回 usage 时使用。 */
export function estimateTokensFromText(text: string): number {
  if (!text) return 0;
  let tokens = 0;
  for (const char of text) {
    tokens += /[\u4e00-\u9fff]/.test(char) ? 1.5 : 0.25;
  }
  return Math.max(1, Math.ceil(tokens));
}

function extractUsage(payload: unknown): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
} | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const candidates = [root.usage, (root.meta as Record<string, unknown> | undefined)?.usage];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const usage = candidate as Record<string, unknown>;
    const input =
      numberOrNull(usage.prompt_tokens) ??
      numberOrNull(usage.input_tokens) ??
      numberOrNull(usage.promptTokens) ??
      numberOrNull(usage.inputTokens);
    const output =
      numberOrNull(usage.completion_tokens) ??
      numberOrNull(usage.output_tokens) ??
      numberOrNull(usage.completionTokens) ??
      numberOrNull(usage.outputTokens);
    const total =
      numberOrNull(usage.total_tokens) ??
      numberOrNull(usage.totalTokens) ??
      (input != null && output != null ? input + output : null);
    if (input != null && total != null) {
      return {
        inputTokens: input,
        outputTokens: output ?? Math.max(0, total - input),
        totalTokens: total,
      };
    }
  }
  return null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractModel(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const root = payload as Record<string, unknown>;
  const meta = root.meta as Record<string, unknown> | undefined;
  const model = meta?.model ?? root.model;
  return typeof model === "string" ? model : "";
}

export function buildCallMetrics(input: {
  requestPayload: unknown;
  responsePayload: unknown;
  startedAtMs: number;
  endedAtMs: number;
}): CallMetrics {
  const model = extractModel(input.responsePayload) || "unknown";
  const context = resolveMaxContextWindow(model === "unknown" ? "" : model);
  const apiUsage = extractUsage(input.responsePayload);

  let inputTokens: number;
  let outputTokens: number;
  let totalTokens: number;
  let tokenSource: TokenUsageSource;

  if (apiUsage) {
    inputTokens = apiUsage.inputTokens;
    outputTokens = apiUsage.outputTokens;
    totalTokens = apiUsage.totalTokens;
    tokenSource = "api";
  } else {
    const requestText = JSON.stringify(input.requestPayload ?? {});
    const responseText = JSON.stringify(input.responsePayload ?? {});
    inputTokens = estimateTokensFromText(requestText);
    outputTokens = estimateTokensFromText(responseText);
    totalTokens = inputTokens + outputTokens;
    tokenSource = "estimated";
  }

  return {
    model,
    maxContextWindow: context.maxContextWindow,
    maxContextWindowNote: context.note,
    inputTokens,
    outputTokens,
    totalTokens,
    tokenSource,
    latencyMs: Math.max(0, Math.round(input.endedAtMs - input.startedAtMs)),
    startedAt: new Date(input.startedAtMs).toISOString(),
    endedAt: new Date(input.endedAtMs).toISOString(),
  };
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}