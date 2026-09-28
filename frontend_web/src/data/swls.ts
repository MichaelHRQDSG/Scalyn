import swlsJson from "./swls.json";

export interface LikertOption {
  value: number;
  label: string;
}

export interface SwlsQuestion {
  id: string;
  order: number;
  text: string;
}

export interface SwlsScoreBand {
  min: number;
  max: number;
  label: string;
}

export interface SwlsScaleData {
  storageKey: string;
  instruction: string;
  likertOptions: LikertOption[];
  questions: SwlsQuestion[];
  scoreBands: SwlsScoreBand[];
  scoring: {
    method: string;
    minTotal: number;
    maxTotal: number;
    description: string;
  };
}

const data = swlsJson as SwlsScaleData;

export const SWLS_STORAGE_KEY = data.storageKey;
export const SWLS_INSTRUCTION = data.instruction;
export const SWLS_LIKERT_OPTIONS = data.likertOptions;
export const SWLS_QUESTIONS = data.questions;
export const SWLS_SCORE_BANDS = data.scoreBands;
export const SWLS_SCORING = data.scoring;

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