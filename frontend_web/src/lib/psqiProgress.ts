import {
  PSQI_STORAGE_KEY,
  createEmptyPsqiProgress,
  type PsqiProgress,
} from "../data/psqi";

export function loadPsqiProgress(): PsqiProgress | null {
  try {
    const raw = localStorage.getItem(PSQI_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PsqiProgress;
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 18) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePsqiProgress(progress: PsqiProgress): void {
  const payload: PsqiProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PSQI_STORAGE_KEY, JSON.stringify(payload));
}

export function clearPsqiProgress(): void {
  localStorage.removeItem(PSQI_STORAGE_KEY);
}

export function hasIncompletePsqiProgress(): boolean {
  const progress = loadPsqiProgress();
  if (!progress || progress.completed) {
    return false;
  }
  return progress.answers.some((value) => value != null);
}

export function startFreshPsqiProgress(): PsqiProgress {
  const progress = createEmptyPsqiProgress();
  savePsqiProgress(progress);
  return progress;
}
