import {
  LES_CATEGORY_LABEL,
  LES_DURATION_OPTIONS,
  LES_IMPACT_OPTIONS,
  LES_OCCURRENCE_OPTIONS,
  LES_QUESTIONS,
  calcEventStimulus,
  summarizeLesScores,
  type LesAnswer,
} from "../data/les";

export interface LesResultPayload {
  id: string;
  scaleId: "les";
  scaleName: string;
  abbr: string;
  completedAt: string;
  scores: ReturnType<typeof summarizeLesScores>;
  answers: Array<{
    questionId: string;
    order: number;
    category: string;
    text: string;
    customName?: string;
    occurrence: string | null;
    nature: string | null;
    impact: number | null;
    impactLabel: string | null;
    duration: number | null;
    durationLabel: string | null;
    frequency: number;
    stimulus: number;
  }>;
}

function labelOf<T extends string | number>(
  options: Array<{ value: T; label: string }>,
  value: T | null,
): string | null {
  if (value == null) {
    return null;
  }
  return options.find((item) => item.value === value)?.label ?? String(value);
}

export function buildLesResultPayload(answers: Array<LesAnswer | null>): LesResultPayload {
  const scores = summarizeLesScores(answers);
  const completedAt = new Date().toISOString();
  const stamp = completedAt.replace(/[:.]/g, "-");

  return {
    id: `les-${stamp}`,
    scaleId: "les",
    scaleName: "生活事件量表",
    abbr: "LES",
    completedAt,
    scores,
    answers: answers.map((answer, index) => {
      const question = LES_QUESTIONS[index];
      const occurrence = answer?.occurrence ?? null;
      return {
        questionId: question.id,
        order: question.order,
        category: LES_CATEGORY_LABEL[question.category],
        text: question.text,
        customName: answer?.customName?.trim() || undefined,
        occurrence: labelOf(LES_OCCURRENCE_OPTIONS, occurrence),
        nature: answer?.nature === "good" ? "好事" : answer?.nature === "bad" ? "坏事" : null,
        impact: answer?.impact ?? null,
        impactLabel: labelOf(LES_IMPACT_OPTIONS, answer?.impact ?? null),
        duration: answer?.duration ?? null,
        durationLabel: labelOf(LES_DURATION_OPTIONS, answer?.duration ?? null),
        frequency: answer?.frequency ?? 1,
        stimulus: calcEventStimulus(answer),
      };
    }),
  };
}

export async function saveLesResultFile(
  answers: Array<LesAnswer | null>,
): Promise<{ ok: boolean; file?: string; error?: string }> {
  const payload = buildLesResultPayload(answers);
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
