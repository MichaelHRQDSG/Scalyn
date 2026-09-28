import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type HistoryRecord = {
  id: string;
  createdAt: string;
  inputText: string;
  analysisGoal: string;
  status: "success" | "error";
  error?: string;
  request?: unknown;
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

export function buildAnalyzeRequest(inputText: string, analysisGoal?: string) {
  const text = inputText.trim();
  const preview = text.length > 280 ? `${text.slice(0, 280)}...` : text;
  return {
    analysis_goal: (analysisGoal || "基于用户输入文本进行综合分析与建议").trim(),
    context: text.slice(0, 5000),
    language: "zh-CN",
    assessments: [
      {
        scale_id: "free-text-input",
        scale_name: "自由文本输入",
        description: "前端用户直接粘贴的分析材料",
        interpretation: text.slice(0, 8000),
        answers: [
          {
            question_id: "user-text",
            question_text: "用户提供的待分析文本",
            selected: {
              option_id: "full-text",
              option_text: preview,
              value: text.length,
            },
          },
        ],
      },
    ],
  };
}
