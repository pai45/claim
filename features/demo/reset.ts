import {
  clearMpin,
  clearMpinLock,
  clearMpinUnlock,
} from "@/features/auth/mpinStorage";
import { clearAuthSession } from "@/features/auth/session";
import { BANNER_STAGE_KEY } from "@/features/chat/bannerRotation";
import { PENDING_INTENT_KEY } from "@/features/chat/pendingIntent";
import { clearChatSession } from "@/features/chat/persistence";
import { WIDGET_POSITION_KEY } from "@/features/chat/widgetPosition";
import { MANAGE_LIMIT_STORAGE_KEY } from "@/features/manage-limit/constants";
import { clearOnboarding } from "@/features/onboarding/storage";
import {
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
} from "@/features/onboarding/vkycHandoff";
import { clearRegisteredVehicle } from "@/features/vehicle/registration";
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
  UPI_CREATED_STORAGE_KEY,
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
 * Wipes every trace of the current demo run so the next screen is the very
 * first one a new user sees: signed out, onboarding untouched, and no UPI ID
 * created inside the embedded benefits app.
 *
 * Deliberately broader than logout, which only drops the person-specific data.
 */
export function resetDemoJourney(
  local: StorageLike = window.localStorage,
  session: StorageLike = window.sessionStorage,
): void {
  // These own a change event, so route through them rather than the key list.
  clearChatSession(local);
  clearRegisteredVehicle(local);
  clearOnboarding(local);
  clearAuthSession(local);
  clearMpin(local);
  clearMpinLock(local);
  // The only MPIN key that lives in sessionStorage.
  clearMpinUnlock(session);

  LOCAL_KEYS.forEach((key) => remove(local, key));
  SESSION_KEYS.forEach((key) => remove(session, key));
}
