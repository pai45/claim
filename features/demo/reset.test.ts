import { beforeEach, describe, expect, it } from "vitest";
import { MPIN_STORAGE_KEY, MPIN_UNLOCK_STORAGE_KEY } from "@/features/auth/mpinStorage";
import { AUTH_STORAGE_KEY } from "@/features/auth/session";
import { PENDING_INTENT_KEY } from "@/features/chat/pendingIntent";
import { CHAT_STORAGE_KEY } from "@/features/chat/persistence";
import { WIDGET_POSITION_KEY } from "@/features/chat/widgetPosition";
import { MANAGE_LIMIT_STORAGE_KEY } from "@/features/manage-limit/constants";
import { BENEFICIARY_LIMITS_STORAGE_KEY } from "@/features/beneficiary-limits/store";
import { PAYMENT_LIMITS_STORAGE_KEY } from "@/features/payment-limits/store";
import { ONBOARDING_STORAGE_KEY } from "@/features/onboarding/constants";
import { EB_PLUS_ACTIVATION_STORAGE_KEY } from "@/features/onboarding/ebPlusActivation";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicle/registration";
import { DRIVER_STORAGE_KEY } from "@/features/driver/registration";
import { PERSONA_STORAGE_KEY } from "@/features/persona/constants";
import { PRODUCT_INTRO_STORAGE_KEY } from "@/features/product-intro/storage";
import { NUDGE_SNOOZE_KEY } from "@/lib/pwa/installNudge";
import { NOTIFICATIONS_HIDDEN_KEY } from "@/features/notifications/storage";
import { UPI_CREATED_STORAGE_KEY, resetDemoJourney } from "./reset";
import { FINANCIAL_STATE_STORAGE_KEY } from "@/features/transactions/financialState";
import { PLUSPAY_HISTORY_STORAGE_KEY } from "@/features/transactions/plusPayHistory";
import { BANK_TRANSFER_HISTORY_STORAGE_KEY } from "@/features/bank-transfer/history";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const LOCAL_KEYS = [
  AUTH_STORAGE_KEY,
  CHAT_STORAGE_KEY,
  ONBOARDING_STORAGE_KEY,
  EB_PLUS_ACTIVATION_STORAGE_KEY,
  VEHICLE_STORAGE_KEY,
  DRIVER_STORAGE_KEY,
  BENEFICIARY_LIMITS_STORAGE_KEY,
  PAYMENT_LIMITS_STORAGE_KEY,
  MANAGE_LIMIT_STORAGE_KEY,
  WIDGET_POSITION_KEY,
  NUDGE_SNOOZE_KEY,
  NOTIFICATIONS_HIDDEN_KEY,
  UPI_CREATED_STORAGE_KEY,
];

describe("resetDemoJourney", () => {
  let local: ReturnType<typeof memoryStorage>;
  let session: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    local = memoryStorage();
    session = memoryStorage();
    LOCAL_KEYS.forEach((key) => local.setItem(key, "seeded"));
    local.setItem(PRODUCT_INTRO_STORAGE_KEY, "completed-intro");
    session.setItem(PENDING_INTENT_KEY, "seeded");
    session.setItem(MPIN_UNLOCK_STORAGE_KEY, "seeded");
    session.setItem(FINANCIAL_STATE_STORAGE_KEY, "seeded");
    session.setItem(PLUSPAY_HISTORY_STORAGE_KEY, "seeded");
    session.setItem(BANK_TRANSFER_HISTORY_STORAGE_KEY, "seeded");
  });

  it("wipes state cleanly for new_user persona", () => {
    resetDemoJourney("new_user", local, session);

    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe("new_user");
    expect(local.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(local.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
    expect(local.getItem(DRIVER_STORAGE_KEY)).toBeNull();
    expect(local.getItem(BENEFICIARY_LIMITS_STORAGE_KEY)).toBeNull();
    expect(local.getItem(PAYMENT_LIMITS_STORAGE_KEY)).toBeNull();
    expect(local.getItem(MPIN_STORAGE_KEY)).toBeNull();
    expect(local.getItem(UPI_CREATED_STORAGE_KEY)).toBeNull();
    expect(session.getItem(MPIN_UNLOCK_STORAGE_KEY)).toBeNull();
    expect(session.getItem(FINANCIAL_STATE_STORAGE_KEY)).toBeNull();
    expect(session.getItem(PLUSPAY_HISTORY_STORAGE_KEY)).toBeNull();
    expect(session.getItem(BANK_TRANSFER_HISTORY_STORAGE_KEY)).toBeNull();
  });

  it("seeds returning history but resets registration and notifications", () => {
    resetDemoJourney("returning", local, session);

    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe("returning");
    expect(local.getItem(ONBOARDING_STORAGE_KEY)).toBeTruthy();
    expect(local.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
    expect(local.getItem(DRIVER_STORAGE_KEY)).toBeNull();
    expect(local.getItem(BENEFICIARY_LIMITS_STORAGE_KEY)).toBeNull();
    expect(local.getItem(PAYMENT_LIMITS_STORAGE_KEY)).toBeNull();
    expect(local.getItem(NOTIFICATIONS_HIDDEN_KEY)).toBeNull();
    expect(local.getItem(MPIN_STORAGE_KEY)).toBeTruthy();
    expect(local.getItem(UPI_CREATED_STORAGE_KEY)).toBe("true");
    expect(session.getItem(MPIN_UNLOCK_STORAGE_KEY)).toBeNull();
  });

  it("starts Rahul before MPIN and onboarding without making him a new account", () => {
    resetDemoJourney("rahul_onboarding", local, session);

    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe("rahul_onboarding");
    expect(local.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(local.getItem(MPIN_STORAGE_KEY)).toBeNull();
    expect(local.getItem(UPI_CREATED_STORAGE_KEY)).toBeNull();
    expect(session.getItem(MPIN_UNLOCK_STORAGE_KEY)).toBeNull();
  });

  it("is safe when nothing was stored", () => {
    const empty = memoryStorage();
    expect(() => resetDemoJourney("new_user", empty, empty)).not.toThrow();
  });

  it("keeps the first-time product intro complete across persona resets", () => {
    resetDemoJourney("new_user", local, session);

    expect(local.getItem(PRODUCT_INTRO_STORAGE_KEY)).toBe("completed-intro");
  });

  it.each([
    ["ebPlus_only", true],
    ["pluspay_only", true],
    ["ebPlus_no_upi", false],
  ] as const)("seeds ready persona %s with the correct UPI state", (id, hasUpi) => {
    resetDemoJourney(id, local, session);

    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe(id);
    expect(local.getItem(ONBOARDING_STORAGE_KEY)).toBeTruthy();
    expect(local.getItem(MPIN_STORAGE_KEY)).toBeTruthy();
    expect(local.getItem(UPI_CREATED_STORAGE_KEY)).toBe(
      hasUpi ? "true" : null,
    );
  });

  it("clears Rohan's EB+ activation so the demo can be replayed", () => {
    resetDemoJourney("pluspay_only", local, session);

    expect(local.getItem(EB_PLUS_ACTIVATION_STORAGE_KEY)).toBeNull();
  });
});
