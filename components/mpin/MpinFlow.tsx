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

  /**
   * Both steps commit on Continue rather than on the fourth digit. Setting a PIN
   * is not the same act as entering a known one: the last box is where people
   * check what they typed, and a screen that moves on by itself takes that
   * moment away — and, on the confirm step, spends an attempt on it.
   */
  function submitConfirm() {
    if (!ready) return;

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
  }

  return (
    <AppShell
      className={
        state.step === "intro" ? "overflow-hidden bg-black/70" : "overflow-hidden"
      }
    >
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
          onSubmit={submitConfirm}
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
