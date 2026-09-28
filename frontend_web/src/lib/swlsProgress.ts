import {
  SWLS_STORAGE_KEY,
  createEmptySwlsProgress,
  type SwlsProgress,
} from "../data/swls";

export function loadSwlsProgress(): SwlsProgress | null {
  try {
    const raw = localStorage.getItem(SWLS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SwlsProgress;
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 5) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSwlsProgress(progress: SwlsProgress): void {
  const payload: SwlsProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(SWLS_STORAGE_KEY, JSON.stringify(payload));
}

export function clearSwlsProgress(): void {
  localStorage.removeItem(SWLS_STORAGE_KEY);
}

export function hasIncompleteSwlsProgress(): boolean {
  const progress = loadSwlsProgress();
  if (!progress || progress.completed) {
    return false;
  }
  return progress.answers.some((value) => value != null);
}

export function startFreshSwlsProgress(): SwlsProgress {
  const progress = createEmptySwlsProgress();
  saveSwlsProgress(progress);
  return progress;
}
