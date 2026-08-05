export const MPIN_LENGTH = 4;

/** Wrong entries allowed before the keypad goes on cooldown. */
export const MAX_MPIN_ATTEMPTS = 3;

/** How long the keypad stays disabled once the attempts run out. */
export const MPIN_LOCKOUT_MS = 30_000;

export const MPIN_MISMATCH_MESSAGE = "MPIN doesn't match. Please re-enter.";
export const MPIN_INCORRECT_MESSAGE = "Incorrect MPIN.";

export const emptyMpin = (): string[] =>
  Array.from({ length: MPIN_LENGTH }, () => "");

export function isMpinComplete(digits: string[]): boolean {
  return (
    digits.length === MPIN_LENGTH && digits.every((digit) => digit !== "")
  );
}

export function mpinValue(digits: string[]): string {
  return digits.join("");
}

/**
 * Fills the leftmost empty box. Presses past the fourth digit are dropped rather
 * than shifting the row, so a stuck finger cannot quietly rewrite the PIN.
 */
export function appendMpinDigit(digits: string[], value: string): string[] {
  const digit = value.replace(/\D/g, "").slice(-1);
  if (!digit) return digits;

  const index = digits.findIndex((entry) => entry === "");
  if (index === -1) return digits;

  const next = [...digits];
  next[index] = digit;
  return next;
}

export function removeLastMpinDigit(digits: string[]): string[] {
  const filled = digits.filter((entry) => entry !== "").length;
  if (filled === 0) return digits;

  const next = [...digits];
  next[filled - 1] = "";
  return next;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function createMpinSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

/**
 * Hashes the PIN so the digits themselves never reach localStorage.
 *
 * This is obfuscation, not protection: a 4-digit PIN is 10,000 combinations and
 * the salt sits in the same store, so anyone with devtools can recover it in
 * milliseconds. It is enough for a demo whose gate is a journey step rather than
 * a security boundary — a real MPIN has to be verified server-side under a rate
 * limit. Async because `crypto.subtle` is.
 */
export async function digestMpin(pin: string, salt: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${pin}`);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(new Uint8Array(buffer));
}

export type MpinLock = {
  failedAttempts: number;
  /** Epoch ms the cooldown ends; 0 when there is no cooldown running. */
  lockedUntil: number;
};

export const initialMpinLock: MpinLock = { failedAttempts: 0, lockedUntil: 0 };

/**
 * Pure so the countdown can be tested without fake timers, and so a reload
 * recomputes the remaining time from the stored deadline rather than restarting
 * it.
 */
export function remainingLockoutMs(lock: MpinLock, now: number): number {
  return Math.max(0, lock.lockedUntil - now);
}

export function isLockedOut(lock: MpinLock, now: number): boolean {
  return remainingLockoutMs(lock, now) > 0;
}

/** Seconds still to wait, rounded up so the label never shows a premature 0. */
export function lockoutSecondsLeft(lock: MpinLock, now: number): number {
  return Math.ceil(remainingLockoutMs(lock, now) / 1000);
}

export function attemptsLeft(lock: MpinLock): number {
  return Math.max(0, MAX_MPIN_ATTEMPTS - lock.failedAttempts);
}

/**
 * Folds one wrong entry into the lock. The counter resets as the cooldown
 * starts, so serving the 30s buys a fresh set of attempts rather than one more
 * try followed by another lockout.
 */
export function registerFailedAttempt(lock: MpinLock, now: number): MpinLock {
  const failedAttempts = lock.failedAttempts + 1;
  if (failedAttempts >= MAX_MPIN_ATTEMPTS) {
    return { failedAttempts: 0, lockedUntil: now + MPIN_LOCKOUT_MS };
  }
  return { failedAttempts, lockedUntil: 0 };
}
