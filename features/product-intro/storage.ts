export const PRODUCT_INTRO_STORAGE_KEY = "eb-claims:product-intro";
export const PRODUCT_INTRO_STORAGE_VERSION = 1;
export const PRODUCT_INTRO_EVENT = "eb-claims:product-intro-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PersistedProductIntro = {
  version: typeof PRODUCT_INTRO_STORAGE_VERSION;
  completed: true;
};

function defaultStorage(): StorageLike {
  if (typeof window !== "undefined") return window.localStorage;
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PRODUCT_INTRO_EVENT));
}

export function isProductIntroComplete(
  storage: StorageLike = defaultStorage(),
): boolean {
  try {
    const raw = storage.getItem(PRODUCT_INTRO_STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw) as Partial<PersistedProductIntro>;
    if (
      parsed.version !== PRODUCT_INTRO_STORAGE_VERSION ||
      parsed.completed !== true
    ) {
      storage.removeItem(PRODUCT_INTRO_STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    try {
      storage.removeItem(PRODUCT_INTRO_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private or managed browser contexts.
    }
    return false;
  }
}

export function completeProductIntro(
  storage: StorageLike = defaultStorage(),
): void {
  const record: PersistedProductIntro = {
    version: PRODUCT_INTRO_STORAGE_VERSION,
    completed: true,
  };

  try {
    storage.setItem(PRODUCT_INTRO_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // The current in-memory journey can still continue when storage is blocked.
    return;
  }

  notify();
}

export function subscribeToProductIntro(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === PRODUCT_INTRO_STORAGE_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(PRODUCT_INTRO_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PRODUCT_INTRO_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
