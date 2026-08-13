import { useSyncExternalStore } from "react";

export const FALLBACK_CONTROL_STORAGE_KEY =
  "employee-benefits:fallback-control:v1";
export const FALLBACK_CONTROL_VERSION = 2;
export const FALLBACK_CONTROL_EVENT = "eb-claims:fallback-control-updated";

export type FallbackWalletId = "meal" | "fuel";
export type FallbackControlState = Record<FallbackWalletId, boolean>;

type PersistedFallbackControl = {
  version: typeof FALLBACK_CONTROL_VERSION;
  wallets: FallbackControlState;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DEFAULT_FALLBACK_CONTROL_STATE: FallbackControlState = {
  meal: true,
  fuel: true,
};

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readFallbackControlState(
  storage: StorageLike | null = defaultStorage(),
): FallbackControlState {
  if (!storage) return { ...DEFAULT_FALLBACK_CONTROL_STATE };
  try {
    const raw = storage.getItem(FALLBACK_CONTROL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FALLBACK_CONTROL_STATE };
    const parsed = JSON.parse(raw) as
      | Partial<PersistedFallbackControl>
      | Partial<FallbackControlState>;

    if (
      "version" in parsed &&
      parsed.version === FALLBACK_CONTROL_VERSION &&
      "wallets" in parsed &&
      parsed.wallets
    ) {
      return normalizeFallbackWallets(parsed.wallets);
    }

    // Legacy v1 stored `{ meal, fuel }` without a version. Preserve explicit
    // choices while moving future writes to the versioned Fallback Control contract.
    return normalizeFallbackWallets(parsed as Partial<FallbackControlState>);
  } catch {
    return { ...DEFAULT_FALLBACK_CONTROL_STATE };
  }
}

export function writeFallbackControlState(
  state: FallbackControlState,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  const payload: PersistedFallbackControl = {
    version: FALLBACK_CONTROL_VERSION,
    wallets: normalizeFallbackWallets(state),
  };
  try {
    storage.setItem(FALLBACK_CONTROL_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
  if (typeof window !== "undefined" && storage === window.localStorage) {
    window.dispatchEvent(new Event(FALLBACK_CONTROL_EVENT));
  }
}

export function useFallbackControlState(): FallbackControlState {
  const snapshot = useSyncExternalStore(
    subscribeToFallbackControl,
    getFallbackSnapshot,
    () => "",
  );
  void snapshot;
  return readFallbackControlState();
}

export function subscribeToFallbackControl(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === FALLBACK_CONTROL_STORAGE_KEY ||
      event.key === null
    ) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(FALLBACK_CONTROL_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FALLBACK_CONTROL_EVENT, listener);
  };
}

function getFallbackSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(FALLBACK_CONTROL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function normalizeFallbackWallets(
  value: Partial<FallbackControlState>,
): FallbackControlState {
  return {
    meal:
      typeof value.meal === "boolean"
        ? value.meal
        : DEFAULT_FALLBACK_CONTROL_STATE.meal,
    fuel:
      typeof value.fuel === "boolean"
        ? value.fuel
        : DEFAULT_FALLBACK_CONTROL_STATE.fuel,
  };
}
