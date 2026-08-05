import { beforeEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "@/features/auth/session";
import { BANNER_STAGE_KEY } from "@/features/chat/bannerRotation";
import { PENDING_INTENT_KEY } from "@/features/chat/pendingIntent";
import { CHAT_STORAGE_KEY } from "@/features/chat/persistence";
import { WIDGET_POSITION_KEY } from "@/features/chat/widgetPosition";
import { MANAGE_LIMIT_STORAGE_KEY } from "@/features/manage-limit/constants";
import { ONBOARDING_STORAGE_KEY } from "@/features/onboarding/constants";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicle/registration";
import { NUDGE_SNOOZE_KEY } from "@/lib/pwa/installNudge";
import { UPI_CREATED_STORAGE_KEY, resetDemoJourney } from "./reset";

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
  VEHICLE_STORAGE_KEY,
  MANAGE_LIMIT_STORAGE_KEY,
  BANNER_STAGE_KEY,
  WIDGET_POSITION_KEY,
  NUDGE_SNOOZE_KEY,
  UPI_CREATED_STORAGE_KEY,
];

describe("resetDemoJourney", () => {
  let local: ReturnType<typeof memoryStorage>;
  let session: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    local = memoryStorage();
    session = memoryStorage();
    LOCAL_KEYS.forEach((key) => local.setItem(key, "seeded"));
    session.setItem(PENDING_INTENT_KEY, "seeded");
  });

  it("clears every key the demo writes", () => {
    resetDemoJourney(local, session);

    expect([...local.map.keys()]).toEqual([]);
    expect(session.getItem(PENDING_INTENT_KEY)).toBeNull();
  });

  it("leaves the UPI setup flag unset so the embedded app starts fresh", () => {
    resetDemoJourney(local, session);

    expect(local.getItem(UPI_CREATED_STORAGE_KEY)).toBeNull();
  });

  it("is safe when nothing was stored", () => {
    const empty = memoryStorage();
    expect(() => resetDemoJourney(empty, empty)).not.toThrow();
  });
});
