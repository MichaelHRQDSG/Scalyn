import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type AnalyzePayload = {
  answer_results: unknown;
  analysis_info: unknown;
  other_info?: unknown;
};

export type HistoryRecord = {
  id: string;
  createdAt: string;
  preview: string;
  status: "success" | "error";
  error?: string;
  request?: AnalyzePayload;
  response?: unknown;
};

const HISTORY_DIR = path.join(process.cwd(), "data", "history");

async function ensureDir() {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

function filePath(id: string) {
  return path.join(HISTORY_DIR, `${id}.json`);
}

export async function saveHistory(record: HistoryRecord) {
  await ensureDir();
  await fs.writeFile(filePath(record.id), JSON.stringify(record, null, 2), "utf-8");
  return record;
}

export async function createHistoryId() {
  return `hist_${randomUUID().replace(/-/g, "")}`;
}

export async function listHistory(): Promise<HistoryRecord[]> {
  await ensureDir();
  const files = await fs.readdir(HISTORY_DIR);
  const records: HistoryRecord[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(HISTORY_DIR, file), "utf-8");
      records.push(JSON.parse(raw) as HistoryRecord);
    } catch {
      // skip broken files
    }
  }
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getHistory(id: string): Promise<HistoryRecord | null> {
  try {
    const raw = await fs.readFile(filePath(id), "utf-8");
    return JSON.parse(raw) as HistoryRecord;
  } catch {
    return null;
  }
}

export function parseJsonField(label: string, raw: string, allowEmptyObject = false): unknown {
  const text = raw.trim();
  if (!text) {
    if (allowEmptyObject) return {};
    throw new Error(`${label} 不能为空`);
  }
  try {
    const value = JSON.parse(text) as unknown;
    if (value === null || (typeof value !== "object" && !Array.isArray(value))) {
      throw new Error(`${label} 必须是 JSON 对象或数组`);
    }
    return value;
  } catch (error) {
    if (error instanceof Error && error.message.includes(label)) throw error;
    throw new Error(`${label} 不是合法 JSON`);
  }
}

export function buildAnalyzeRequest(input: {
  answerResultsRaw: string;
  analysisInfoRaw: string;
  otherInfoRaw: string;
}): AnalyzePayload {
  return {
    answer_results: parseJsonField("量表答题结果", input.answerResultsRaw),
    analysis_info: parseJsonField("答题后分析信息", input.analysisInfoRaw),
    other_info: parseJsonField("其他信息", input.otherInfoRaw, true),
  };
}

export function buildPreview(payload: AnalyzePayload): string {
  return JSON.stringify(payload.answer_results).slice(0, 80);
}