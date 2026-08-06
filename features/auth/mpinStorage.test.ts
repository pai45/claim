import { beforeEach, describe, expect, it } from "vitest";
import { initialMpinLock, MPIN_LOCKOUT_MS } from "./mpin";
import {
  clearMpin,
  clearMpinLock,
  clearMpinUnlock,
  isMpinSet,
  isMpinUnlocked,
  loadMpin,
  loadMpinLock,
  markMpinUnlocked,
  MPIN_LOCK_STORAGE_KEY,
  MPIN_STORAGE_KEY,
  MPIN_UNLOCK_STORAGE_KEY,
  saveMpin,
  saveMpinLock,
} from "./mpinStorage";
import { AUTH_STORAGE_KEY } from "./session";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const record = { salt: "s4lt", digest: "d1gest", createdAt: 1_700_000_000_000 };

describe("mpin storage", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("reports no mpin by default", () => {
    expect(isMpinSet(storage)).toBe(false);
    expect(loadMpin(storage)).toBeNull();
  });

  it("round-trips a saved record", () => {
    saveMpin(record, storage);
    expect(loadMpin(storage)).toEqual({ version: 1, ...record });
    expect(isMpinSet(storage)).toBe(true);
  });

  it("never writes the pin itself", () => {
    saveMpin(record, storage);
    expect(storage.getItem(MPIN_STORAGE_KEY)).not.toContain("1234");
  });

  it("drops a malformed record instead of wedging the lock screen", () => {
    storage.setItem(MPIN_STORAGE_KEY, JSON.stringify({ version: 1 }));
    expect(loadMpin(storage)).toBeNull();
    // Removed too, so the next read does not repeat the work.
    expect(storage.getItem(MPIN_STORAGE_KEY)).toBeNull();
  });

  it("drops an unparseable record", () => {
    storage.setItem(MPIN_STORAGE_KEY, "{not json");
    expect(loadMpin(storage)).toBeNull();
    expect(storage.getItem(MPIN_STORAGE_KEY)).toBeNull();
  });

  it("rejects a record from a future version", () => {
    storage.setItem(
      MPIN_STORAGE_KEY,
      JSON.stringify({ version: 99, ...record }),
    );
    expect(loadMpin(storage)).toBeNull();
  });

  it("clears only its own key", () => {
    storage.setItem(AUTH_STORAGE_KEY, "session");
    saveMpin(record, storage);

    clearMpin(storage);
    expect(loadMpin(storage)).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBe("session");
  });
});

describe("mpin lockout storage", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("defaults to a clean lock", () => {
    expect(loadMpinLock(storage)).toEqual(initialMpinLock);
  });

  it("survives a reload, so the cooldown cannot be refreshed away", () => {
    const lockedUntil = Date.now() + MPIN_LOCKOUT_MS;
    saveMpinLock({ failedAttempts: 0, lockedUntil }, storage);

    // A second read stands in for the next page load.
    expect(loadMpinLock(storage).lockedUntil).toBe(lockedUntil);
  });

  it("falls back to a clean lock on a malformed record", () => {
    storage.setItem(MPIN_LOCK_STORAGE_KEY, JSON.stringify({ version: 1 }));
    expect(loadMpinLock(storage)).toEqual(initialMpinLock);
    expect(storage.getItem(MPIN_LOCK_STORAGE_KEY)).toBeNull();
  });

  it("clears the cooldown without touching the mpin record", () => {
    saveMpin(record, storage);
    saveMpinLock({ failedAttempts: 2, lockedUntil: 0 }, storage);

    clearMpinLock(storage);
    expect(loadMpinLock(storage)).toEqual(initialMpinLock);
    expect(loadMpin(storage)).not.toBeNull();
  });
});

describe("mpin session unlock", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("starts locked", () => {
    expect(isMpinUnlocked(storage)).toBe(false);
  });

  /**
   * The whole point of the key: leaving the home screen for /profile and coming
   * back unmounts the gate, and a second read has to still report unlocked.
   */
  it("survives the gate unmounting and remounting", () => {
    markMpinUnlocked(storage);

    expect(isMpinUnlocked(storage)).toBe(true);
    expect(isMpinUnlocked(storage)).toBe(true);
  });

  it("ignores an unlock granted against another record version", () => {
    storage.setItem(MPIN_UNLOCK_STORAGE_KEY, "99");
    expect(isMpinUnlocked(storage)).toBe(false);
  });

  it("clears without disturbing the mpin record", () => {
    saveMpin(record, storage);
    markMpinUnlocked(storage);

    clearMpinUnlock(storage);
    expect(isMpinUnlocked(storage)).toBe(false);
    expect(loadMpin(storage)).not.toBeNull();
  });
});
