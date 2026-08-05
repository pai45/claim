"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { createMpinSalt, digestMpin, mpinValue } from "@/features/auth/mpin";
import {
  activeDigits,
  canAdvance,
  initialMpinSetupState,
  mpinMatches,
  mpinSetupReducer,
} from "@/features/auth/mpinMachine";
import { clearMpinLock, saveMpin } from "@/features/auth/mpinStorage";
import { MpinEntryStep } from "./MpinEntryStep";
import { MpinIntroStep } from "./MpinIntroStep";
import { MpinSuccessStep } from "./MpinSuccessStep";

/** Long enough for the fourth dot to register before the screen changes. */
const AUTO_ADVANCE_MS = 250;

type MpinFlowProps = {
  onDone: () => void;
};

export function MpinFlow({ onDone }: MpinFlowProps) {
  const [state, dispatch] = useReducer(mpinSetupReducer, initialMpinSetupState);
  const [shakeKey, setShakeKey] = useState(0);
  /**
   * Held in memory until the success screen is acknowledged.
   *
   * Writing on match instead would fire the storage subscription mid-flow, and
   * `HomeEntry` — seeing an MPIN that exists on a load that has not unlocked —
   * would swap this component for the lock screen before the success screen
   * ever rendered. Committing on Continue keeps the gate deterministic.
   */
  const [pending, setPending] = useState<{
    salt: string;
    digest: string;
  } | null>(null);
  const digits = activeDigits(state);
  const ready = canAdvance(state);

  // Guards the async hash against a component that unmounted mid-flight.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // The fourth digit is the whole intent, so waiting for a Continue tap is a
  // step the user has already expressed. Continue stays enabled as the fallback.
  useEffect(() => {
    if (state.step !== "set" || !ready) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "advance" }),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.step, ready]);

  useEffect(() => {
    if (state.step !== "confirm" || !ready) return;

    const timer = window.setTimeout(() => {
      if (!mpinMatches(state)) {
        setShakeKey((key) => key + 1);
        dispatch({ type: "mismatch" });
        return;
      }

      dispatch({ type: "saving" });
      const salt = createMpinSalt();
      void digestMpin(mpinValue(state.pin), salt).then((digest) => {
        if (!aliveRef.current) return;
        setPending({ salt, digest });
        dispatch({ type: "saved" });
      });
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [state, ready]);

  return (
    <AppShell className="overflow-hidden">
      {state.step === "intro" ? (
        <MpinIntroStep onStart={() => dispatch({ type: "start" })} />
      ) : null}

      {state.step === "set" ? (
        <MpinEntryStep
          title="Set MPIN"
          subtitle="Create a 4-digit PIN for secure access"
          fieldLabel="Type your MPIN"
          digits={digits}
          onDigit={(value) => dispatch({ type: "press-digit", value })}
          onBackspace={() => dispatch({ type: "press-backspace" })}
          onSubmit={() => dispatch({ type: "advance" })}
          canSubmit={ready}
          onBack={() => dispatch({ type: "go-back" })}
        />
      ) : null}

      {state.step === "confirm" ? (
        <MpinEntryStep
          title="Confirm MPIN"
          subtitle="Create a 4-digit PIN for secure access"
          fieldLabel="Type your MPIN"
          digits={digits}
          onDigit={(value) => dispatch({ type: "press-digit", value })}
          onBackspace={() => dispatch({ type: "press-backspace" })}
          onSubmit={() => dispatch({ type: "saving" })}
          canSubmit={ready}
          error={state.error}
          shakeKey={shakeKey}
          onBack={() => dispatch({ type: "go-back" })}
        />
      ) : null}

      {state.step === "success" ? (
        <MpinSuccessStep
          onContinue={() => {
            if (pending) {
              saveMpin({ ...pending, createdAt: Date.now() });
              // A brand-new MPIN starts clean; a cooldown left over from a
              // previous PIN would lock the user out of the one just chosen.
              clearMpinLock();
            }
            onDone();
          }}
        />
      ) : null}
    </AppShell>
  );
}
