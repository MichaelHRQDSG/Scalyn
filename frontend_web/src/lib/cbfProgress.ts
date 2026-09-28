import {
  CBF_STORAGE_KEY,
  createEmptyCbfProgress,
  type CbfProgress,
} from "../data/cbf";

export function loadCbfProgress(): CbfProgress | null {
  try {
    const raw = localStorage.getItem(CBF_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CbfProgress;
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 40) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCbfProgress(progress: CbfProgress): void {
  const payload: CbfProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CBF_STORAGE_KEY, JSON.stringify(payload));
}

export function clearCbfProgress(): void {
  localStorage.removeItem(CBF_STORAGE_KEY);
}

export function hasIncompleteCbfProgress(): boolean {
  const progress = loadCbfProgress();
  if (!progress || progress.completed) {
    return false;
  }
  return progress.answers.some((value) => value != null);
}

export function startFreshCbfProgress(): CbfProgress {
  const progress = createEmptyCbfProgress();
  saveCbfProgress(progress);
  return progress;
}
