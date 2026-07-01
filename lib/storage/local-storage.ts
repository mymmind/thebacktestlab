import {
  createDefaultPersistedState,
  parsePersistedState,
  serializeState,
  STORAGE_KEY,
  type PersistedState,
} from "@/lib/storage/persistence-types";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadPersistedState(): PersistedState | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return parsePersistedState(raw);
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    serializeState({ ...state, exportedAt: Date.now() }),
  );
}

export function clearPersistedState(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportStateToJson(state: PersistedState): string {
  return serializeState({ ...state, exportedAt: Date.now() });
}

export function importStateFromJson(raw: string): PersistedState {
  return parsePersistedState(raw);
}

export function resetPersistedState(): PersistedState {
  const defaults = createDefaultPersistedState();
  savePersistedState(defaults);
  return defaults;
}

export { STORAGE_KEY, createDefaultPersistedState };
