import {
  PSQI_STEPS,
  summarizePsqiScores,
  type PsqiAnswer,
} from "../data/psqi";

export interface PsqiResultPayload {
  id: string;
  scaleId: "psqi";
  scaleName: string;
  abbr: string;
  completedAt: string;
  scores: NonNullable<ReturnType<typeof summarizePsqiScores>>;
  answers: Array<{
    stepId: string;
    code: string;
    title: string;
    value: string | number | null;
    note?: string;
  }>;
}

export function buildPsqiResultPayload(
  answers: Array<PsqiAnswer | null>,
): PsqiResultPayload {
  const scores = summarizePsqiScores(answers);
  if (!scores) {
    throw new Error("题目未全部完成，无法生成结果文件");
  }

  const completedAt = new Date().toISOString();
  const stamp = completedAt.replace(/[:.]/g, "-");

  return {
    id: `psqi-${stamp}`,
    scaleId: "psqi",
    scaleName: "匹兹堡睡眠质量指数",
    abbr: "PSQI",
    completedAt,
    scores,
    answers: answers.map((answer, index) => {
      const step = PSQI_STEPS[index];
      return {
        stepId: step.id,
        code: step.code,
        title: step.title,
        value: answer?.value ?? null,
        note: answer?.note?.trim() || undefined,
      };
    }),
  };
}

export async function savePsqiResultFile(
  answers: Array<PsqiAnswer | null>,
): Promise<{ ok: boolean; file?: string; error?: string }> {
  const payload = buildPsqiResultPayload(answers);
  const response = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { ok: boolean; file?: string; error?: string };
  if (!response.ok || !data.ok) {
    return { ok: false, error: data.error ?? "保存结果失败" };
  }
  return { ok: true, file: data.file };
}
