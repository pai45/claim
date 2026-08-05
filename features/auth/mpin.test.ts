import { describe, expect, it } from "vitest";
import {
  appendMpinDigit,
  attemptsLeft,
  createMpinSalt,
  digestMpin,
  emptyMpin,
  isLockedOut,
  isMpinComplete,
  initialMpinLock,
  lockoutSecondsLeft,
  MAX_MPIN_ATTEMPTS,
  MPIN_LOCKOUT_MS,
  mpinValue,
  registerFailedAttempt,
  remainingLockoutMs,
  removeLastMpinDigit,
} from "./mpin";

describe("mpin digits", () => {
  it("is incomplete until every box is filled", () => {
    expect(isMpinComplete(emptyMpin())).toBe(false);
    expect(isMpinComplete(["1", "2", "3", ""])).toBe(false);
    expect(isMpinComplete(["1", "2", "3", "4"])).toBe(true);
  });

  it("fills left to right and ignores presses once full", () => {
    let digits = emptyMpin();
    digits = appendMpinDigit(digits, "1");
    digits = appendMpinDigit(digits, "2");
    digits = appendMpinDigit(digits, "3");
    digits = appendMpinDigit(digits, "4");
    expect(mpinValue(digits)).toBe("1234");

    // A fifth press must not shift the row — the PIN the user sees is the PIN
    // that gets hashed.
    expect(mpinValue(appendMpinDigit(digits, "9"))).toBe("1234");
  });

  it("drops non-numeric presses", () => {
    expect(mpinValue(appendMpinDigit(emptyMpin(), "."))).toBe("");
  });

  it("deletes from the right and no-ops when empty", () => {
    const digits = ["1", "2", "", ""];
    expect(mpinValue(removeLastMpinDigit(digits))).toBe("1");
    expect(removeLastMpinDigit(emptyMpin())).toEqual(emptyMpin());
  });
});

describe("digestMpin", () => {
  it("is stable for the same pin and salt", async () => {
    const salt = "abc123";
    expect(await digestMpin("1234", salt)).toBe(await digestMpin("1234", salt));
  });

  it("differs across salts, so two users with the same pin do not collide", async () => {
    expect(await digestMpin("1234", "salt-a")).not.toBe(
      await digestMpin("1234", "salt-b"),
    );
  });

  it("differs across pins", async () => {
    const salt = createMpinSalt();
    expect(await digestMpin("1234", salt)).not.toBe(
      await digestMpin("4321", salt),
    );
  });

  it("generates a distinct salt each time", () => {
    expect(createMpinSalt()).not.toBe(createMpinSalt());
  });
});

describe("mpin lockout", () => {
  it("starts with the full set of attempts and no cooldown", () => {
    expect(attemptsLeft(initialMpinLock)).toBe(MAX_MPIN_ATTEMPTS);
    expect(isLockedOut(initialMpinLock, Date.now())).toBe(false);
  });

  it("counts down attempts before locking", () => {
    const now = 1_000;
    let lock = registerFailedAttempt(initialMpinLock, now);
    expect(attemptsLeft(lock)).toBe(2);
    expect(isLockedOut(lock, now)).toBe(false);

    lock = registerFailedAttempt(lock, now);
    expect(attemptsLeft(lock)).toBe(1);
    expect(isLockedOut(lock, now)).toBe(false);

    lock = registerFailedAttempt(lock, now);
    expect(isLockedOut(lock, now)).toBe(true);
    expect(lock.lockedUntil).toBe(now + MPIN_LOCKOUT_MS);
  });

  it("hands back a full set of attempts once the cooldown is served", () => {
    const now = 1_000;
    let lock = registerFailedAttempt(initialMpinLock, now);
    lock = registerFailedAttempt(lock, now);
    lock = registerFailedAttempt(lock, now);

    // Serving the wait buys three fresh tries, not one more try followed by
    // another 30 seconds.
    expect(attemptsLeft(lock)).toBe(MAX_MPIN_ATTEMPTS);
    expect(isLockedOut(lock, now + MPIN_LOCKOUT_MS)).toBe(false);
  });

  it("clamps a past deadline at zero rather than going negative", () => {
    const lock = { failedAttempts: 0, lockedUntil: 500 };
    expect(remainingLockoutMs(lock, 900)).toBe(0);
    expect(remainingLockoutMs(lock, 200)).toBe(300);
  });

  it("rounds the countdown up so the label never shows a premature zero", () => {
    const lock = { failedAttempts: 0, lockedUntil: 1_200 };
    expect(lockoutSecondsLeft(lock, 1_000)).toBe(1);
  });
});
