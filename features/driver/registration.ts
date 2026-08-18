import type { DriverSalaryPayload } from "@/features/chat/types";

export const DRIVER_STORAGE_KEY = "eb-claims:registered-driver";
export const DRIVER_STORAGE_VERSION = 1;
/** localStorage's `storage` event never fires in the tab that wrote it. */
export const DRIVER_REGISTRATION_EVENT = "eb-claims:registered-driver-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersistedDriverRegistration = {
  version: typeof DRIVER_STORAGE_VERSION;
  driverName: string;
  dlNumber?: string;
  dlValidity?: string;
  salary?: string;
  startDate?: string;
  registeredAt: number;
};

export type RegisteredDriver = {
  driverName: string;
  dlNumber?: string;
  dlValidity?: string;
  salary?: string;
  startDate?: string;
  registeredAt: number;
};

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DRIVER_REGISTRATION_EVENT));
}

export function saveRegisteredDriver(
  payload: DriverSalaryPayload,
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): void {
  const driverName = payload.driverName?.trim() || "Driver";
  const record: PersistedDriverRegistration = {
    version: DRIVER_STORAGE_VERSION,
    driverName,
    dlNumber: payload.dlNumber?.trim() || undefined,
    dlValidity: payload.dlValidity?.trim() || undefined,
    salary: payload.salary?.trim() || undefined,
    startDate: payload.startDate?.trim() || undefined,
    registeredAt: now,
  };

  try {
    storage.setItem(DRIVER_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }

  notify();
}

export function loadRegisteredDriver(
  storage: StorageLike = window.localStorage,
): RegisteredDriver | null {
  try {
    const raw = storage.getItem(DRIVER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedDriverRegistration>;
    if (
      parsed.version !== DRIVER_STORAGE_VERSION ||
      typeof parsed.driverName !== "string" ||
      !parsed.driverName.trim() ||
      typeof parsed.registeredAt !== "number"
    ) {
      storage.removeItem(DRIVER_STORAGE_KEY);
      return null;
    }

    return {
      driverName: parsed.driverName,
      dlNumber: typeof parsed.dlNumber === "string" ? parsed.dlNumber : undefined,
      dlValidity:
        typeof parsed.dlValidity === "string" ? parsed.dlValidity : undefined,
      salary: typeof parsed.salary === "string" ? parsed.salary : undefined,
      startDate: typeof parsed.startDate === "string" ? parsed.startDate : undefined,
      registeredAt: parsed.registeredAt,
    };
  } catch {
    try {
      storage.removeItem(DRIVER_STORAGE_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return null;
  }
}

export function clearRegisteredDriver(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(DRIVER_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

/**
 * Fires on same-tab writes (custom event) and cross-tab writes (`storage`).
 * Returns an unsubscribe.
 */
export function subscribeToRegisteredDriver(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DRIVER_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(DRIVER_REGISTRATION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DRIVER_REGISTRATION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
