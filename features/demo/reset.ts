import {
  clearMpin,
  clearMpinLock,
  clearMpinUnlock,
  saveMpin,
} from "@/features/auth/mpinStorage";
import { clearAuthSession } from "@/features/auth/session";
import { BANNER_STAGE_KEY } from "@/features/chat/bannerRotation";
import { PENDING_INTENT_KEY } from "@/features/chat/pendingIntent";
import { clearChatSession } from "@/features/chat/persistence";
import { WIDGET_POSITION_KEY } from "@/features/chat/widgetPosition";
import { MANAGE_LIMIT_STORAGE_KEY } from "@/features/manage-limit/constants";
import {
  clearOnboarding,
  createCompletedOnboardingState,
  saveOnboardingState,
} from "@/features/onboarding/storage";
import {
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
} from "@/features/onboarding/vkycHandoff";
import {
  clearRegisteredVehicle,
  saveRegisteredVehicle,
} from "@/features/vehicle/registration";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import { setActivePersonaId } from "@/features/persona/store";
import type { PersonaId } from "@/features/persona/types";
import { NUDGE_SNOOZE_KEY } from "@/lib/pwa/installNudge";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * The embedded Employee Benefits app is a plain script under `public/`, so its
 * key cannot be imported. Kept in sync with `UPI_CREATED_STORAGE_KEY` in
 * `public/employee-benefits/app.js`.
 */
export const UPI_CREATED_STORAGE_KEY = "employee-benefits:upi-created:v1";

/** Keys with no owning module that exposes a clear helper. */
const LOCAL_KEYS = [
  MANAGE_LIMIT_STORAGE_KEY,
  BANNER_STAGE_KEY,
  WIDGET_POSITION_KEY,
  NUDGE_SNOOZE_KEY,
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
];

const SESSION_KEYS = [PENDING_INTENT_KEY];

function remove(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
}

/**
 * Resets the demo journey for a specific persona:
 * - "new_user": Wipes every trace so the next screen is the very first one
 *   a new user sees: signed out, onboarding untouched, 0 claims, 0 txns,
 *   full wallet balances.
 * - "returning": Pre-populates completed onboarding, MPIN (1234), registered
 *   vehicle, and full history, returning to the login gate for seamless sign-in.
 */
export function resetDemoJourney(
  targetPersona: PersonaId = "new_user",
  local: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  session: StorageLike = typeof window !== "undefined" ? window.sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): void {
  // Always clear session-bound keys and transcript
  clearChatSession(local);
  clearAuthSession(local);
  clearMpinUnlock(session);

  LOCAL_KEYS.forEach((key) => remove(local, key));
  SESSION_KEYS.forEach((key) => remove(session, key));

  if (targetPersona === "new_user") {
    setActivePersonaId("new_user", local);
    clearRegisteredVehicle(local);
    clearOnboarding(local);
    clearMpin(local);
    clearMpinLock(local);
    remove(local, UPI_CREATED_STORAGE_KEY);
  } else {
    setActivePersonaId("returning", local);
    saveOnboardingState(createCompletedOnboardingState("returning"), local);
    const vehicleLookup = buildVehicleLookup("MH 12 AB 1234", "Vishal Sharma");
    if (vehicleLookup.ok) {
      saveRegisteredVehicle(vehicleLookup.lookup, local);
    }
    // SHA-256 for demo_salt:1234
    saveMpin(
      {
        salt: "demo_salt",
        digest: "c2a4bc0e9a27050b15787e5509c9e179f7a2ace1821a350fcf6c0177cb3e9617",
        createdAt: 1700000000000,
      },
      local,
    );
    clearMpinLock(local);
    try {
      local.setItem(UPI_CREATED_STORAGE_KEY, "true");
    } catch {
      // Storage blocked
    }
  }
}
