import { getActivePersonaConfig } from "@/features/persona/store";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import type { VehicleLookup, VehicleOwnership } from "@/lib/vehicle/types";

export const VEHICLE_STORAGE_KEY = "eb-claims:registered-vehicle";
export const VEHICLE_STORAGE_VERSION = 2;
/** localStorage's `storage` event never fires in the tab that wrote it. */
export const VEHICLE_REGISTRATION_EVENT = "eb-claims:registered-vehicle-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Only the plate, ownership selection and registration metadata are stored.
 * The vehicle lookup is re-derived on every read.
 *
 * `buildVehicleLookup` is pure, synchronous and offline, so re-deriving costs
 * nothing and makes it impossible for a stored record to drift from the roster
 * or from the derivation logic. A persisted lookup written before chassis and
 * engine numbers existed would be missing them forever; a persisted plate
 * simply re-derives them.
 */
export type PersistedVehicleRegistration = {
  version: typeof VEHICLE_STORAGE_VERSION;
  /** Canonical, punctuation-free form, e.g. "KA05RS1035". */
  regNumber: string;
  ownerName: string;
  ownership: VehicleOwnership;
  registeredAt: number;
  /** How many times this registration has been submitted, resubmissions included. */
  submissions: number;
};

export type RegisteredVehicle = {
  lookup: VehicleLookup;
  ownership: VehicleOwnership;
  registeredAt: number;
  submissions: number;
};

/**
 * Submissions survive a rewrite so the demo can tell a first registration from a
 * resubmission — both rejection rules key off it. Records written before the
 * count existed are read as the one submission that wrote them.
 */
function readSubmissions(raw: Partial<PersistedVehicleRegistration>): number {
  return typeof raw.submissions === "number" && raw.submissions > 0
    ? raw.submissions
    : 1;
}

function countPreviousSubmissions(storage: StorageLike): number {
  try {
    const raw = storage.getItem(VEHICLE_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Partial<PersistedVehicleRegistration>;
    if (parsed.version !== VEHICLE_STORAGE_VERSION) return 0;
    return readSubmissions(parsed);
  } catch {
    return 0;
  }
}

function notify(): void {
  // The store is imported by node-environment tests, where there is no window.
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VEHICLE_REGISTRATION_EVENT));
}

export function saveRegisteredVehicle(
  lookup: VehicleLookup,
  ownership: VehicleOwnership,
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): void {
  const record: PersistedVehicleRegistration = {
    version: VEHICLE_STORAGE_VERSION,
    regNumber: lookup.regNumber.normalized,
    ownerName: lookup.ownerName,
    ownership,
    registeredAt: now,
    submissions: countPreviousSubmissions(storage) + 1,
  };

  try {
    storage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }

  notify();
}

export function loadRegisteredVehicle(
  storage: StorageLike = window.localStorage,
): RegisteredVehicle | null {
  try {
    const raw = storage.getItem(VEHICLE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedVehicleRegistration>;
    if (
      parsed.version !== VEHICLE_STORAGE_VERSION ||
      typeof parsed.regNumber !== "string" ||
      (parsed.ownership !== "self_owned" &&
        parsed.ownership !== "company_leased") ||
      typeof parsed.registeredAt !== "number"
    ) {
      storage.removeItem(VEHICLE_STORAGE_KEY);
      return null;
    }

    const defaultOwner = getActivePersonaConfig(storage).profile.name;
    const result = buildVehicleLookup(
      parsed.regNumber,
      typeof parsed.ownerName === "string" && parsed.ownerName
        ? parsed.ownerName
        : defaultOwner,
    );
    if (!result.ok) {
      storage.removeItem(VEHICLE_STORAGE_KEY);
      return null;
    }

    return {
      lookup: result.lookup,
      ownership: parsed.ownership,
      registeredAt: parsed.registeredAt,
      submissions: readSubmissions(parsed),
    };
  } catch {
    try {
      storage.removeItem(VEHICLE_STORAGE_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return null;
  }
}

export function clearRegisteredVehicle(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(VEHICLE_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

/**
 * Fires on same-tab writes (custom event) and cross-tab writes (`storage`).
 * Returns an unsubscribe.
 */
export function subscribeToRegisteredVehicle(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key means localStorage.clear(), which wipes this key too.
    if (event.key === VEHICLE_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(VEHICLE_REGISTRATION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(VEHICLE_REGISTRATION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
