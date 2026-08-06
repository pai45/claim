import {
  DEFAULT_PERSONA_ID,
  PERSONA_CHANGED_EVENT,
  PERSONA_STORAGE_KEY,
  getPersonaConfig,
  isPersonaId,
} from "./constants";
import type { PersonaConfig, PersonaId } from "./types";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PERSONA_CHANGED_EVENT));
}

export function getActivePersonaId(
  storage: StorageLike = typeof window !== "undefined"
    ? window.localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): PersonaId {
  try {
    const raw = storage.getItem(PERSONA_STORAGE_KEY);
    if (isPersonaId(raw)) return raw;
  } catch {
    // Storage blocked or unavailable
  }
  return DEFAULT_PERSONA_ID;
}

export function setActivePersonaId(
  id: PersonaId,
  storage: StorageLike = typeof window !== "undefined"
    ? window.localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): void {
  try {
    storage.setItem(PERSONA_STORAGE_KEY, id);
  } catch {
    // Storage blocked
  }
  notify();
}

export function getActivePersonaConfig(
  storage?: StorageLike,
): PersonaConfig {
  return getPersonaConfig(getActivePersonaId(storage));
}

export function subscribeToPersona(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === PERSONA_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(PERSONA_CHANGED_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PERSONA_CHANGED_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
