import {
  CBF_DIMENSION_LABEL,
  CBF_LIKERT_OPTIONS,
  CBF_QUESTIONS,
  scoredCbfValue,
  summarizeCbfScores,
  type CbfAnswer,
} from "../data/cbf";

export interface CbfResultPayload {
  id: string;
  scaleId: "cbf-pi-b";
  scaleName: string;
  abbr: string;
  completedAt: string;
  scores: NonNullable<ReturnType<typeof summarizeCbfScores>>;
  answers: Array<{
    questionId: string;
    order: number;
    text: string;
    dimension: string;
    reverse: boolean;
    rawValue: number;
    scoredValue: number;
    label: string;
  }>;
}

export function buildCbfResultPayload(answers: CbfAnswer[]): CbfResultPayload {
  const scores = summarizeCbfScores(answers);
  if (!scores) {
    throw new Error("题目未全部完成，无法生成结果文件");
  }

  const completedAt = new Date().toISOString();
  const stamp = completedAt.replace(/[:.]/g, "-");

  return {
    id: `cbf-${stamp}`,
    scaleId: "cbf-pi-b",
    scaleName: "中国大五人格问卷",
    abbr: "CBF-PI-B",
    completedAt,
    scores,
    answers: answers.map((raw, index) => {
      const question = CBF_QUESTIONS[index];
      const value = raw as number;
      return {
        questionId: question.id,
        order: question.order,
        text: question.text,
        dimension: CBF_DIMENSION_LABEL[question.dimension],
        reverse: question.reverse,
        rawValue: value,
        scoredValue: scoredCbfValue(question, value),
        label:
          CBF_LIKERT_OPTIONS.find((option) => option.value === value)?.label ??
          String(value),
      };
    }),
  };
}

export async function saveCbfResultFile(
  answers: CbfAnswer[],
): Promise<{ ok: boolean; file?: string; error?: string }> {
  const payload = buildCbfResultPayload(answers);
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
