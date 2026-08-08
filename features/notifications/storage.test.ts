import { describe, expect, it } from "vitest";
import {
  NOTIFICATIONS_HIDDEN_KEY,
  clearNotificationsHidden,
  hideAllNotifications,
  readNotificationsHidden,
  showAllNotifications,
} from "./storage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

describe("notification visibility storage", () => {
  it("persists and clears hide all", () => {
    const storage = memoryStorage();

    expect(readNotificationsHidden(storage)).toBe(false);
    hideAllNotifications(storage);
    expect(storage.getItem(NOTIFICATIONS_HIDDEN_KEY)).toBe("true");
    expect(readNotificationsHidden(storage)).toBe(true);
    showAllNotifications(storage);
    expect(readNotificationsHidden(storage)).toBe(false);

    hideAllNotifications(storage);
    clearNotificationsHidden(storage);
    expect(readNotificationsHidden(storage)).toBe(false);
  });

  it("falls back safely when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    expect(readNotificationsHidden(blocked)).toBe(false);
    expect(() => hideAllNotifications(blocked)).not.toThrow();
    expect(() => showAllNotifications(blocked)).not.toThrow();
    expect(() => clearNotificationsHidden(blocked)).not.toThrow();
  });
});
