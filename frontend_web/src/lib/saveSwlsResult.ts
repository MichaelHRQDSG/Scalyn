import {
  SWLS_LIKERT_OPTIONS,
  SWLS_QUESTIONS,
  interpretSwlsScore,
  type SwlsAnswer,
} from "../data/swls";

export interface SwlsResultPayload {
  id: string;
  scaleId: "swls";
  scaleName: string;
  abbr: string;
  completedAt: string;
  answers: Array<{
    questionId: string;
    order: number;
    text: string;
    value: number;
    label: string;
  }>;
  totalScore: number;
  interpretation: string;
  scoreRange: {
    min: number;
    max: number;
  };
}

export function buildSwlsResultPayload(answers: SwlsAnswer[]): SwlsResultPayload {
  if (answers.some((value) => value == null)) {
    throw new Error("题目未全部完成，无法生成结果文件");
  }

  const mapped = answers.map((value, index) => {
    const question = SWLS_QUESTIONS[index];
    const score = value as number;
    const label =
      SWLS_LIKERT_OPTIONS.find((option) => option.value === score)?.label ?? String(score);
    return {
      questionId: question.id,
      order: question.order,
      text: question.text,
      value: score,
      label,
    };
  });

  const totalScore = mapped.reduce((sum, item) => sum + item.value, 0);
  const completedAt = new Date().toISOString();
  const stamp = completedAt.replace(/[:.]/g, "-");

  return {
    id: `swls-${stamp}`,
    scaleId: "swls",
    scaleName: "生活满意度量表",
    abbr: "SWLS",
    completedAt,
    answers: mapped,
    totalScore,
    interpretation: interpretSwlsScore(totalScore),
    scoreRange: { min: 5, max: 35 },
  };
}

export async function saveSwlsResultFile(
  answers: SwlsAnswer[],
): Promise<{ ok: boolean; file?: string; error?: string }> {
  const payload = buildSwlsResultPayload(answers);
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
