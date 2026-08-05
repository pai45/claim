"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { clearAuthSession } from "@/features/auth/session";
import {
  appendMpinDigit,
  attemptsLeft,
  digestMpin,
  emptyMpin,
  initialMpinLock,
  isLockedOut,
  isMpinComplete,
  lockoutSecondsLeft,
  MPIN_INCORRECT_MESSAGE,
  mpinValue,
  registerFailedAttempt,
  removeLastMpinDigit,
  type MpinLock,
} from "@/features/auth/mpin";
import {
  clearMpin,
  clearMpinLock,
  loadMpin,
  loadMpinLock,
  saveMpinLock,
} from "@/features/auth/mpinStorage";
import { MpinEntryStep } from "./MpinEntryStep";

/** Lets the fourth dot land before the screen reacts. */
const VERIFY_DELAY_MS = 200;

type MpinLockScreenProps = {
  onUnlock: () => void;
};

/**
 * `HomeEntry` renders this only after hydration, so there is no server pass to
 * mismatch — the lock can be read straight into the initial state.
 */
function readLock(): MpinLock {
  if (typeof window === "undefined") return initialMpinLock;
  return loadMpinLock();
}

export function MpinLockScreen({ onUnlock }: MpinLockScreenProps) {
  const [digits, setDigits] = useState(emptyMpin);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [checking, setChecking] = useState(false);
  const [lock, setLock] = useState<MpinLock>(readLock);
  const [now, setNow] = useState(() => Date.now());

  const lockedOut = isLockedOut(lock, now);
  const timerRef = useRef<number | undefined>(undefined);

  // Only ticks while a cooldown is running; when the deadline passes `lockedOut`
  // flips on its own, so nothing needs resetting.
  useEffect(() => {
    if (!lockedOut) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [lockedOut]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function verify(value: string) {
    const record = loadMpin();
    // No record means this gate has nothing to check against; let them through
    // and leave `HomeEntry` to route them back into setup.
    if (!record) {
      onUnlock();
      return;
    }

    const digest = await digestMpin(value, record.salt);
    if (digest === record.digest) {
      clearMpinLock();
      onUnlock();
      return;
    }

    const next = registerFailedAttempt(lock, Date.now());
    saveMpinLock(next);
    setLock(next);
    setNow(Date.now());
    setDigits(emptyMpin());
    setShakeKey((key) => key + 1);
    setChecking(false);
    // The lockout message is derived from `lock`, so only the countable case
    // needs a stored string — otherwise it would linger past the cooldown.
    setError(
      next.lockedUntil > 0
        ? null
        : `${MPIN_INCORRECT_MESSAGE} ${attemptsLeft(next)} ${
            attemptsLeft(next) === 1 ? "attempt" : "attempts"
          } left.`,
    );
  }

  /**
   * Verification is kicked off from the keypress that completes the PIN rather
   * than from an effect watching the digits: the press is the intent, and an
   * effect would have to re-derive it from state it just caused.
   */
  function startVerify(value: string) {
    setChecking(true);
    timerRef.current = window.setTimeout(() => {
      void verify(value);
    }, VERIFY_DELAY_MS);
  }

  function handleDigit(value: string) {
    if (lockedOut || checking) return;
    const next = appendMpinDigit(digits, value);
    setDigits(next);
    setError(null);
    if (isMpinComplete(next)) startVerify(mpinValue(next));
  }

  function handleForgot() {
    // Re-verifying by OTP is the recovery path, so drop both the PIN and the
    // session: `HomeEntry` falls back to login and, after OTP, to setup.
    clearMpin();
    clearMpinLock();
    clearAuthSession();
  }

  const secondsLeft = lockoutSecondsLeft(lock, now);
  const message = lockedOut ? "Too many attempts." : error;

  return (
    <AppShell className="overflow-hidden">
      <MpinEntryStep
        title="Enter MPIN"
        subtitle="Enter your 4-digit PIN to continue"
        fieldLabel="Type your MPIN"
        digits={digits}
        onDigit={handleDigit}
        onBackspace={() => {
          if (checking) return;
          setError(null);
          setDigits(removeLastMpinDigit(digits));
        }}
        onSubmit={() => {
          if (checking || !isMpinComplete(digits)) return;
          startVerify(mpinValue(digits));
        }}
        canSubmit={isMpinComplete(digits) && !checking}
        submitLabel="Unlock"
        error={message}
        shakeKey={shakeKey}
        locked={lockedOut}
        footnote={
          <div className="mt-1">
            {lockedOut ? (
              <p
                role="status"
                aria-live="polite"
                className="text-caption text-danger"
              >
                Try again in {secondsLeft}s
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleForgot}
              className="mt-3 text-body-sm font-bold text-pine-primary underline underline-offset-2"
            >
              Forgot MPIN?
            </button>
          </div>
        }
      />
    </AppShell>
  );
}
