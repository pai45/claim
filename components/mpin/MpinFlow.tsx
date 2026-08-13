"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { createMpinSalt, digestMpin, mpinValue } from "@/features/auth/mpin";
import {
  canAdvance,
  initialMpinSetupState,
  mpinMatches,
  mpinSetupReducer,
} from "@/features/auth/mpinMachine";
import { clearMpinLock, saveMpin } from "@/features/auth/mpinStorage";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import { MpinCreateStep } from "./MpinCreateStep";
import { MpinIntroStep } from "./MpinIntroStep";
import { MpinSuccessStep } from "./MpinSuccessStep";

type MpinFlowProps = {
  onDone: () => void;
  overlay?: boolean;
  onRequestClose?: () => void;
};

export function MpinFlow({
  onDone,
  overlay = false,
  onRequestClose = () => {},
}: MpinFlowProps) {
  const [state, dispatch] = useReducer(mpinSetupReducer, initialMpinSetupState);
  const [shakeKey, setShakeKey] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
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
  const ready = canAdvance(state);
  useModalFocus(overlayRef, overlay, onRequestClose);

  // Guards the async hash against a component that unmounted mid-flight.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  /**
   * Creation commits only when both rows are complete and Continue is pressed.
   * The fourth digit selects confirmation, but never saves by itself.
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

  const content = (
    <>
      {state.step === "intro" ? (
        <MpinIntroStep onStart={() => dispatch({ type: "start" })} />
      ) : null}

      {state.step === "create" ? (
        <MpinCreateStep
          pin={state.pin}
          confirm={state.confirm}
          activeField={state.activeField}
          onSelectField={(field) => dispatch({ type: "select-field", field })}
          onDigit={(value) => dispatch({ type: "press-digit", value })}
          onBackspace={() => dispatch({ type: "press-backspace" })}
          onSubmit={submitConfirm}
          canSubmit={ready}
          error={state.error}
          shakeKey={shakeKey}
          onBack={() => dispatch({ type: "go-back" })}
          saving={state.status === "saving"}
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
    </>
  );

  if (overlay) {
    return (
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[80] mx-auto flex max-w-phone flex-col overflow-hidden ${
          state.step === "intro" ? "bg-transparent" : "bg-surface"
        }`}
      >
        {state.step === "intro" ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close MPIN setup"
            onClick={onRequestClose}
            className="absolute inset-0 bg-pine-dark/40"
          />
        ) : null}
        {content}
      </div>
    );
  }

  return (
    <AppShell
      className={
        state.step === "intro"
          ? "overflow-hidden bg-pine-dark/40"
          : "overflow-hidden"
      }
    >
      {content}
    </AppShell>
  );
}
