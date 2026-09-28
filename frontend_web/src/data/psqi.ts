export const PSQI_STORAGE_KEY = "scalyn.psqi.progress";

export const PSQI_INSTRUCTION =
  "下面一些问题是关于您最近1个月的睡眠状况，请选择或填写最符合您近1个月实际情况的答案。请回答下列问题！";

export type PsqiStepKind = "time" | "number" | "choice" | "choice_with_note";

export interface PsqiChoiceOption {
  value: number;
  label: string;
}

export const PSQI_FREQ_OPTIONS: PsqiChoiceOption[] = [
  { value: 0, label: "无" },
  { value: 1, label: "<1次／周" },
  { value: 2, label: "1–2次／周" },
  { value: 3, label: "≥3次／周" },
];

export const PSQI_QUALITY_OPTIONS: PsqiChoiceOption[] = [
  { value: 0, label: "很好" },
  { value: 1, label: "较好" },
  { value: 2, label: "较差" },
  { value: 3, label: "很差" },
];

export const PSQI_ENERGY_OPTIONS: PsqiChoiceOption[] = [
  { value: 0, label: "没有" },
  { value: 1, label: "偶尔有" },
  { value: 2, label: "有时有" },
  { value: 3, label: "经常有" },
];

export interface PsqiStep {
  id: string;
  order: number;
  code: string;
  title: string;
  kind: PsqiStepKind;
  options?: PsqiChoiceOption[];
  unitHint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const PSQI_STEPS: PsqiStep[] = [
  {
    id: "psqi-1",
    order: 1,
    code: "Q1",
    title: "近1个月，晚上上床睡觉通常是几点钟？",
    kind: "time",
    unitHint: "请按24小时制填写上床时间",
  },
  {
    id: "psqi-2",
    order: 2,
    code: "Q2",
    title: "近1个月，从上床到入睡通常需要多少分钟？",
    kind: "number",
    unitHint: "单位：分钟",
    placeholder: "例如 20",
    min: 0,
    max: 300,
    step: 1,
  },
  {
    id: "psqi-3",
    order: 3,
    code: "Q3",
    title: "近1个月，通常早上几点起床？",
    kind: "time",
    unitHint: "请按24小时制填写起床时间",
  },
  {
    id: "psqi-4",
    order: 4,
    code: "Q4",
    title: "近1个月，每夜通常实际睡眠多少小时？（不等于卧床时间）",
    kind: "number",
    unitHint: "单位：小时，可填小数，如 6.5",
    placeholder: "例如 6.5",
    min: 0,
    max: 24,
    step: 0.1,
  },
  {
    id: "psqi-5a",
    order: 5,
    code: "Q5a",
    title: "近1个月，因入睡困难（30分钟内不能入睡）影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5b",
    order: 6,
    code: "Q5b",
    title: "近1个月，因夜间易醒或早醒影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5c",
    order: 7,
    code: "Q5c",
    title: "近1个月，因夜间去厕所影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5d",
    order: 8,
    code: "Q5d",
    title: "近1个月，因呼吸不畅影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5e",
    order: 9,
    code: "Q5e",
    title: "近1个月，因咳嗽或鼾声高影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5f",
    order: 10,
    code: "Q5f",
    title: "近1个月，因感觉冷影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5g",
    order: 11,
    code: "Q5g",
    title: "近1个月，因感觉热影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5h",
    order: 12,
    code: "Q5h",
    title: "近1个月，因做恶梦影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5i",
    order: 13,
    code: "Q5i",
    title: "近1个月，因疼痛不适影响睡眠而烦恼",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-5j",
    order: 14,
    code: "Q5j",
    title: "近1个月，因其他影响睡眠的事情而烦恼",
    kind: "choice_with_note",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-6",
    order: 15,
    code: "Q6",
    title: "近1个月，总的来说，您认为自己的睡眠质量",
    kind: "choice",
    options: PSQI_QUALITY_OPTIONS,
  },
  {
    id: "psqi-7",
    order: 16,
    code: "Q7",
    title: "近1个月，您用药物催眠的情况",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-8",
    order: 17,
    code: "Q8",
    title: "近1个月，您常感到困倦吗",
    kind: "choice",
    options: PSQI_FREQ_OPTIONS,
  },
  {
    id: "psqi-9",
    order: 18,
    code: "Q9",
    title: "近1个月，您做事情的精力不足吗",
    kind: "choice",
    options: PSQI_ENERGY_OPTIONS,
  },
];

export interface PsqiAnswer {
  value: string | number | null;
  note?: string;
}

export interface PsqiProgress {
  answers: Array<PsqiAnswer | null>;
  currentIndex: number;
  updatedAt: string;
  completed: boolean;
}

export interface PsqiComponentScore {
  key: string;
  label: string;
  score: number;
}

export interface PsqiScoreSummary {
  components: PsqiComponentScore[];
  total: number;
  interpretation: string;
  sleepEfficiencyPercent: number | null;
}

export function createEmptyPsqiProgress(): PsqiProgress {
  return {
    answers: Array.from({ length: PSQI_STEPS.length }, () => null),
    currentIndex: 0,
    updatedAt: new Date().toISOString(),
    completed: false,
  };
}

export function isPsqiAnswerComplete(
  step: PsqiStep,
  answer: PsqiAnswer | null,
): boolean {
  if (!answer || answer.value == null || answer.value === "") {
    return false;
  }
  if (step.kind === "choice_with_note") {
    const freq = Number(answer.value);
    if (Number.isNaN(freq)) {
      return false;
    }
    if (freq > 0 && !(answer.note && answer.note.trim())) {
      return false;
    }
  }
  if (step.kind === "number") {
    const num = Number(answer.value);
    if (Number.isNaN(num)) {
      return false;
    }
    if (step.min != null && num < step.min) {
      return false;
    }
    if (step.max != null && num > step.max) {
      return false;
    }
  }
  if (step.kind === "time") {
    return /^\d{2}:\d{2}$/.test(String(answer.value));
  }
  return true;
}

export function countAnsweredPsqi(answers: Array<PsqiAnswer | null>): number {
  return answers.reduce((count, answer, index) => {
    return count + (isPsqiAnswerComplete(PSQI_STEPS[index], answer) ? 1 : 0);
  }, 0);
}

function answerByCode(
  answers: Array<PsqiAnswer | null>,
  code: string,
): PsqiAnswer | null {
  const index = PSQI_STEPS.findIndex((step) => step.code === code);
  return index >= 0 ? answers[index] : null;
}

function numByCode(answers: Array<PsqiAnswer | null>, code: string): number | null {
  const answer = answerByCode(answers, code);
  if (!answer || answer.value == null || answer.value === "") {
    return null;
  }
  const num = Number(answer.value);
  return Number.isNaN(num) ? null : num;
}

function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function bedTimeMinutes(answers: Array<PsqiAnswer | null>): number | null {
  const bedtime = answerByCode(answers, "Q1")?.value;
  const wake = answerByCode(answers, "Q3")?.value;
  if (typeof bedtime !== "string" || typeof wake !== "string") {
    return null;
  }
  const start = timeToMinutes(bedtime);
  const end = timeToMinutes(wake);
  if (start == null || end == null) {
    return null;
  }
  let diff = end - start;
  if (diff <= 0) {
    diff += 24 * 60;
  }
  return diff;
}

function scoreLatencyMinutes(minutes: number): number {
  if (minutes <= 15) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  return 3;
}

function scoreDurationHours(hours: number): number {
  if (hours > 7) return 0;
  if (hours >= 6) return 1;
  if (hours >= 5) return 2;
  return 3;
}

function scoreEfficiency(percent: number): number {
  if (percent >= 85) return 0;
  if (percent >= 75) return 1;
  if (percent >= 65) return 2;
  return 3;
}

function mapSumToComponent(sum: number): number {
  if (sum === 0) return 0;
  if (sum <= 2) return 1;
  if (sum <= 4) return 2;
  return 3;
}

function mapDisturbanceSum(sum: number): number {
  if (sum === 0) return 0;
  if (sum <= 9) return 1;
  if (sum <= 18) return 2;
  return 3;
}

export function interpretPsqiTotal(total: number): string {
  if (total <= 5) {
    return "睡眠质量较好";
  }
  if (total <= 10) {
    return "睡眠质量一般，存在一定睡眠问题";
  }
  return "睡眠质量较差，建议关注睡眠卫生并必要时寻求专业帮助";
}

export function summarizePsqiScores(
  answers: Array<PsqiAnswer | null>,
): PsqiScoreSummary | null {
  if (!PSQI_STEPS.every((step, index) => isPsqiAnswerComplete(step, answers[index]))) {
    return null;
  }

  const q2 = numByCode(answers, "Q2") ?? 0;
  const q4 = numByCode(answers, "Q4") ?? 0;
  const q5a = numByCode(answers, "Q5a") ?? 0;
  const q6 = numByCode(answers, "Q6") ?? 0;
  const q7 = numByCode(answers, "Q7") ?? 0;
  const q8 = numByCode(answers, "Q8") ?? 0;
  const q9 = numByCode(answers, "Q9") ?? 0;

  const latencySum = scoreLatencyMinutes(q2) + q5a;
  const component2 = mapSumToComponent(latencySum);

  const bedMinutes = bedTimeMinutes(answers);
  let efficiencyPercent: number | null = null;
  let component4 = 0;
  if (bedMinutes && bedMinutes > 0) {
    efficiencyPercent = (q4 * 60) / bedMinutes * 100;
    component4 = scoreEfficiency(efficiencyPercent);
  }

  const disturbanceCodes = ["Q5b", "Q5c", "Q5d", "Q5e", "Q5f", "Q5g", "Q5h", "Q5i", "Q5j"];
  const disturbanceSum = disturbanceCodes.reduce(
    (sum, code) => sum + (numByCode(answers, code) ?? 0),
    0,
  );
  const component5 = mapDisturbanceSum(disturbanceSum);
  const component7 = mapSumToComponent(q8 + q9);

  const components: PsqiComponentScore[] = [
    { key: "C1", label: "主观睡眠质量", score: q6 },
    { key: "C2", label: "入睡时间", score: component2 },
    { key: "C3", label: "睡眠时间", score: scoreDurationHours(q4) },
    { key: "C4", label: "睡眠效率", score: component4 },
    { key: "C5", label: "睡眠障碍", score: component5 },
    { key: "C6", label: "催眠药物", score: q7 },
    { key: "C7", label: "日间功能障碍", score: component7 },
  ];

  const total = components.reduce((sum, item) => sum + item.score, 0);

  return {
    components,
    total,
    interpretation: interpretPsqiTotal(total),
    sleepEfficiencyPercent:
      efficiencyPercent == null ? null : Math.round(efficiencyPercent * 10) / 10,
  };
}
