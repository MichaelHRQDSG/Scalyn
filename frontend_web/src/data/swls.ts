export const SWLS_STORAGE_KEY = "scalyn.swls.progress";

export const SWLS_INSTRUCTION =
  "以下是五项您可能同意或不同意的陈述。通过点击相应的框来表明您对每一项的同意程度，从非常同意到非常不同意。请在回答时保持开放和诚实。";

export interface LikertOption {
  value: number;
  label: string;
}

export const SWLS_LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: "非常不同意" },
  { value: 2, label: "不同意" },
  { value: 3, label: "有点不同意" },
  { value: 4, label: "不同意也不反对" },
  { value: 5, label: "稍微同意" },
  { value: 6, label: "同意" },
  { value: 7, label: "非常同意" },
];

export interface SwlsQuestion {
  id: string;
  order: number;
  text: string;
}

export const SWLS_QUESTIONS: SwlsQuestion[] = [
  {
    id: "swls-1",
    order: 1,
    text: "从很多方面来说，我的生活在很多方面都接近我的理想。",
  },
  {
    id: "swls-2",
    order: 2,
    text: "我的生活条件非常好。",
  },
  {
    id: "swls-3",
    order: 3,
    text: "我对我的生活很满意。",
  },
  {
    id: "swls-4",
    order: 4,
    text: "到目前为止我已经得到了我生活中想要的重要的东西。",
  },
  {
    id: "swls-5",
    order: 5,
    text: "如果我的人生可以重来，我几乎不会改变任何事情。",
  },
];

export interface SwlsScoreBand {
  min: number;
  max: number;
  label: string;
}

export const SWLS_SCORE_BANDS: SwlsScoreBand[] = [
  { min: 31, max: 35, label: "非常满意您的生活" },
  { min: 26, max: 30, label: "很满意" },
  { min: 21, max: 25, label: "有一点满意" },
  { min: 20, max: 20, label: "普通满意" },
  { min: 15, max: 19, label: "有一点不满意" },
  { min: 10, max: 14, label: "不满意" },
  { min: 5, max: 9, label: "非常不满意" },
];

export type SwlsAnswer = number | null;

export interface SwlsProgress {
  answers: SwlsAnswer[];
  currentIndex: number;
  updatedAt: string;
  completed: boolean;
}

export function createEmptySwlsProgress(): SwlsProgress {
  return {
    answers: Array.from({ length: SWLS_QUESTIONS.length }, () => null),
    currentIndex: 0,
    updatedAt: new Date().toISOString(),
    completed: false,
  };
}

export function interpretSwlsScore(total: number): string {
  const band = SWLS_SCORE_BANDS.find((item) => total >= item.min && total <= item.max);
  return band?.label ?? "暂无对应解读";
}

export function sumSwlsAnswers(answers: SwlsAnswer[]): number | null {
  if (answers.some((value) => value == null)) {
    return null;
  }
  return answers.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

export function countAnswered(answers: SwlsAnswer[]): number {
  return answers.filter((value) => value != null).length;
}
