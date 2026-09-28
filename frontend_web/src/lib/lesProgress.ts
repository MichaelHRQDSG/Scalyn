import {
  LES_STORAGE_KEY,
  createEmptyLesProgress,
  type LesProgress,
} from "../data/les";

export function loadLesProgress(): LesProgress | null {
  try {
    const raw = localStorage.getItem(LES_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as LesProgress;
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 50) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLesProgress(progress: LesProgress): void {
  const payload: LesProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LES_STORAGE_KEY, JSON.stringify(payload));
}

export function clearLesProgress(): void {
  localStorage.removeItem(LES_STORAGE_KEY);
}

export function hasIncompleteLesProgress(): boolean {
  const progress = loadLesProgress();
  if (!progress || progress.completed) {
    return false;
  }
  return progress.answers.some((value) => value != null);
}

export function startFreshLesProgress(): LesProgress {
  const progress = createEmptyLesProgress();
  saveLesProgress(progress);
  return progress;
}
