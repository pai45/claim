import { describe, expect, it } from "vitest";
import {
  PENDING_INTENT_KEY,
  setPendingChatIntent,
  takePendingChatIntent,
} from "./pendingIntent";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const INTENT = { intentId: "vehicle_registration", label: "Start registration" };

describe("pending chat intent", () => {
  it("hands an intent through to the next read", () => {
    const storage = fakeStorage();
    setPendingChatIntent(INTENT, storage);

    expect(takePendingChatIntent(storage)).toEqual(INTENT);
  });

  it("fires at most once", () => {
    // What makes the ChatShell effect safe under StrictMode, a remount, or a
    // second tab: the second read finds nothing to send.
    const storage = fakeStorage();
    setPendingChatIntent(INTENT, storage);

    expect(takePendingChatIntent(storage)).toEqual(INTENT);
    expect(takePendingChatIntent(storage)).toBeNull();
  });

  it("returns null when nothing is pending", () => {
    expect(takePendingChatIntent(fakeStorage())).toBeNull();
  });

  it("drops a corrupt value rather than wedging the flow", () => {
    const storage = fakeStorage();
    storage.setItem(PENDING_INTENT_KEY, "{not json");

    expect(takePendingChatIntent(storage)).toBeNull();
    expect(storage.getItem(PENDING_INTENT_KEY)).toBeNull();
  });

  it("drops a value that is JSON but not an intent", () => {
    const storage = fakeStorage();
    storage.setItem(PENDING_INTENT_KEY, JSON.stringify({ intentId: 7 }));

    expect(takePendingChatIntent(storage)).toBeNull();
    expect(storage.getItem(PENDING_INTENT_KEY)).toBeNull();
  });
});
