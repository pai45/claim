import {
  clearMpin,
  clearMpinLock,
  clearMpinUnlock,
  saveMpin,
} from "@/features/auth/mpinStorage";
import { clearAuthSession } from "@/features/auth/session";
import { BENEFITS_NUDGE_SHOWN_KEY } from "@/features/benefits-nudge/nudge";
import { PENDING_INTENT_KEY } from "@/features/chat/pendingIntent";
import { clearChatSession } from "@/features/chat/persistence";
import {
  BILL_DRAFT_DELETE_HINT_KEY,
  clearBillDraftsBestEffort,
} from "@/features/chat/drafts";
import { WIDGET_POSITION_KEY } from "@/features/chat/widgetPosition";
import { MANAGE_LIMIT_STORAGE_KEY } from "@/features/manage-limit/constants";
import { BENEFICIARY_LIMITS_STORAGE_KEY } from "@/features/beneficiary-limits/store";
import { PAYMENT_LIMITS_STORAGE_KEY } from "@/features/payment-limits/store";
import {
  clearOnboarding,
  createCompletedOnboardingState,
  saveOnboardingState,
} from "@/features/onboarding/storage";
import { clearEbPlusActivation } from "@/features/onboarding/ebPlusActivation";
import {
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
} from "@/features/onboarding/vkycHandoff";
import { clearRegisteredVehicle } from "@/features/vehicle/registration";
import { clearRegisteredDriver } from "@/features/driver/registration";
import { clearNotificationsHidden } from "@/features/notifications/storage";
import { clearWalkthroughState } from "@/features/walkthrough/storage";
import { setActivePersonaId } from "@/features/persona/store";
import { getPersonaConfig } from "@/features/persona/constants";
import type { PersonaId } from "@/features/persona/types";
import { NUDGE_SNOOZE_KEY } from "@/lib/pwa/installNudge";
import { FINANCIAL_STATE_STORAGE_KEY } from "@/features/transactions/financialState";
import { PLUSPAY_HISTORY_STORAGE_KEY } from "@/features/transactions/plusPayHistory";
import { BANK_TRANSFER_HISTORY_STORAGE_KEY } from "@/features/bank-transfer/history";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * The embedded Employee Benefits app is a plain script under `public/`, so its
 * key cannot be imported. Kept in sync with `UPI_CREATED_STORAGE_KEY` in
 * `public/employee-benefits/app.js`.
 */
export const UPI_CREATED_STORAGE_KEY = "employee-benefits:upi-created:v1";

/** Clears the retired promo-carousel rotation state during demo resets. */
const LEGACY_BANNER_STAGE_KEY = "eb-claims:banner-stage";

/** Keys with no owning module that exposes a clear helper. */
const LOCAL_KEYS = [
  BENEFICIARY_LIMITS_STORAGE_KEY,
  PAYMENT_LIMITS_STORAGE_KEY,
  MANAGE_LIMIT_STORAGE_KEY,
  LEGACY_BANNER_STAGE_KEY,
  WIDGET_POSITION_KEY,
  NUDGE_SNOOZE_KEY,
  BILL_DRAFT_DELETE_HINT_KEY,
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
];

const SESSION_KEYS = [
  BENEFITS_NUDGE_SHOWN_KEY,
  PENDING_INTENT_KEY,
  FINANCIAL_STATE_STORAGE_KEY,
  PLUSPAY_HISTORY_STORAGE_KEY,
  BANK_TRANSFER_HISTORY_STORAGE_KEY,
];

function remove(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
}

/**
 * Resets the demo journey for a specific persona. Fresh personas start before
 * onboarding; ready personas receive completed onboarding, MPIN 1234, and the
 * product state declared by their access configuration.
 */
export function resetDemoJourney(
  targetPersona: PersonaId = "new_user",
  local: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  session: StorageLike = typeof window !== "undefined" ? window.sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): void {
  // Always clear session-bound keys and transcript
  clearChatSession(local);
  clearBillDraftsBestEffort();
  clearAuthSession(local);
  clearMpinUnlock(session);

  LOCAL_KEYS.forEach((key) => remove(local, key));
  SESSION_KEYS.forEach((key) => remove(session, key));
  clearRegisteredVehicle(local);
  clearRegisteredDriver(local);
  clearNotificationsHidden(local);
  clearEbPlusActivation(local);
  // Picking a persona on the login screen is the presenter's reset, so it is
  // also what makes the walkthroughs auto-play again.
  clearWalkthroughState(local, session);

  const persona = getPersonaConfig(targetPersona);
  setActivePersonaId(targetPersona, local);

  if (!persona.hasCompletedOnboarding) {
    clearOnboarding(local);
    clearMpin(local);
    clearMpinLock(local);
    remove(local, UPI_CREATED_STORAGE_KEY);
  } else {
    saveOnboardingState(createCompletedOnboardingState(targetPersona), local);
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
    if (persona.access.upiEnabled && persona.hasBenefitsUpiId) {
      try {
        local.setItem(UPI_CREATED_STORAGE_KEY, "true");
      } catch {
        // Storage blocked
      }
    } else {
      remove(local, UPI_CREATED_STORAGE_KEY);
    }
  }
}
