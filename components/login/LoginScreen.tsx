"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useRef, useState } from "react";
import { ProductIntroScreen } from "@/components/product-intro/ProductIntroScreen";
import { AppShell } from "@/components/shared/AppShell";
import { saveAuthSession } from "@/features/auth/session";
import { resetDemoJourney } from "@/features/demo/reset";
import {
  getPersonaConfig,
  hasReturningAccountState,
} from "@/features/persona/constants";
import type { PersonaId } from "@/features/persona/types";
import { shouldShowProductIntro } from "@/features/product-intro/controller";
import { useProductIntroProgress } from "@/features/product-intro/useProductIntroProgress";
import {
  canSubmitMobile,
  canSubmitOtp,
  initialLoginState,
  loginReducer,
  otpValue,
} from "@/features/auth/loginMachine";
import { verifyOtp } from "@/features/auth/otp";
import { useViewportHeight } from "@/features/auth/useViewportHeight";
import { OtpStep } from "./OtpStep";
import { PhoneStep } from "./PhoneStep";
import { ProductWordmark } from "./ProductWordmark";
import { PlusPayWordmark } from "./PlusPayWordmark";
import { PersonaSelectionStep } from "./PersonaSelectionStep";
import type { OtpInputHandle } from "./OtpInput";

// Same pattern as ColorBends in ChatShell: lottie touches `document` at module
// scope, and the chunk is only worth fetching when someone is actually here.
const LoginBackground = dynamic(() => import("./LoginBackground"), {
  ssr: false,
});

/** Long enough for the pending state to register as work happening. */
const VERIFY_DELAY_MS = 700;
const RESEND_COOLDOWN_SECONDS = 30;

export function LoginScreen() {
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const {
    completed: productIntroCompleted,
    isHydrated: productIntroHydrated,
    complete: completeProductIntro,
  } = useProductIntroProgress();
  // Cooldown is derived from a deadline set in the handlers that start it, so
  // no effect has to reset it on the way in.
  const [resendDeadline, setResendDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId | null>(
    null,
  );
  const [productIntroDismissed, setProductIntroDismissed] = useState(false);

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<OtpInputHandle>(null);

  const verifying = state.status === "verifying";
  const resendIn = Math.max(0, Math.ceil((resendDeadline - now) / 1000));

  useViewportHeight();

  function startResendCooldown() {
    const startedAt = Date.now();
    setNow(startedAt);
    setResendDeadline(startedAt + RESEND_COOLDOWN_SECONDS * 1000);
  }

  // Success is the exit, not a render state: saving the session makes
  // HomeEntry unmount this screen.
  useEffect(() => {
    if (!verifying) return;

    const code = otpValue(state);
    const timer = window.setTimeout(() => {
      const result = verifyOtp(code);
      if (result.ok) saveAuthSession(state.mobile);
      else dispatch({ type: "verify-failed", message: result.message });
    }, VERIFY_DELAY_MS);

    return () => window.clearTimeout(timer);
    // `state` is read once when verification starts; re-running on every
    // keystroke would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifying]);

  // Directed focus on step changes — no focus trap, because the sheet is the
  // whole page here and there is nothing else mounted to trap against.
  useEffect(() => {
    if (state.step === "otp") otpRef.current?.focus(0);
  }, [state.step]);

  useEffect(() => {
    if (state.status === "error") otpRef.current?.focus(0);
  }, [state.status]);

  // setState lives in the timer callback, not the effect body.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), 500);
    return () => window.clearTimeout(timer);
  }, [resendIn, now]);

  function handleSubmitMobile() {
    if (canSubmitMobile(state)) startResendCooldown();
    dispatch({ type: "submit-mobile" });
  }

  function handleResend() {
    startResendCooldown();
    dispatch({ type: "resend" });
  }

  function handleChangeNumber() {
    dispatch({ type: "change-number" });
    window.requestAnimationFrame(() => {
      const input = phoneRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function handleSelectPersona(personaId: PersonaId) {
    resetDemoJourney(personaId);
    dispatch({ type: "change-number" });

    // Aarav is the demo's new-user persona, so surface his registered mobile
    // number as soon as the sign-in form opens.
    if (personaId === "new_user") {
      dispatch({
        type: "set-mobile",
        value: getPersonaConfig(personaId).profile.mobile,
      });
    }

    if (hasReturningAccountState(personaId)) {
      continueWithMpin(personaId);
      return;
    }

    setProductIntroDismissed(false);
    setSelectedPersonaId(personaId);
  }

  function continueWithMpin(personaId: PersonaId | null) {
    if (!personaId || !hasReturningAccountState(personaId)) return;
    saveAuthSession(getPersonaConfig(personaId).profile.mobile);
  }

  const personaSelected = selectedPersonaId !== null;

  if (personaSelected && !productIntroHydrated) {
    return (
      <AppShell
        variant="login"
        className="login-viewport overflow-hidden"
      >
        <div className="min-h-0 flex-1" aria-hidden="true" />
      </AppShell>
    );
  }

  if (
    shouldShowProductIntro(
      selectedPersonaId,
      productIntroCompleted,
      productIntroDismissed,
    )
  ) {
    return (
      <ProductIntroScreen
        onComplete={() => {
          completeProductIntro();
          setProductIntroDismissed(true);
          continueWithMpin(selectedPersonaId);
        }}
      />
    );
  }

  return (
    <AppShell variant="login" className="login-viewport overflow-hidden">
      <header className="flex flex-col shrink-0 items-center justify-center px-page pb-2 pt-6 gap-2">
        {personaSelected ? (
          selectedPersonaId === "new_user" ? (
            <PlusPayWordmark />
          ) : (
            <ProductWordmark />
          )
        ) : (
          <span className="font-display text-title font-semibold tracking-tight text-pine-dark">
            EB+ & PlusPay
          </span>
        )}
      </header>

      {/* The only flexible row, so the on-screen keyboard squeezes the
          animation and never the form. `slice` keeps the art filling whatever
          height is left instead of letterboxing. */}
      <div className="pointer-events-none relative min-h-0 flex-1 overflow-hidden">
        <LoginBackground />
      </div>

      {/* Shrinkable rather than `shrink-0`: the animation band collapses first
          (flex basis 0), and only once it is gone does the sheet give way and
          scroll its own content — instead of being clipped by the shell. */}
      <section className="animate-sheet-rise z-10 min-h-0 overflow-y-auto rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-6 shadow-drawer">
        {!personaSelected ? (
          <PersonaSelectionStep onSelect={handleSelectPersona} />
        ) : state.step === "phone" ? (
          <PhoneStep
            ref={phoneRef}
            mobile={state.mobile}
            canSubmit={canSubmitMobile(state)}
            onChange={(value) => dispatch({ type: "set-mobile", value })}
            onSubmit={handleSubmitMobile}
          />
        ) : (
          <OtpStep
            ref={otpRef}
            mobile={state.mobile}
            digits={state.otp}
            error={state.error}
            verifying={verifying}
            canSubmit={canSubmitOtp(state)}
            resendIn={resendIn}
            onDigitChange={(index, value) =>
              dispatch({ type: "set-otp-digit", index, value })
            }
            onFill={(index, text) => dispatch({ type: "fill-otp", index, text })}
            onSubmit={() => dispatch({ type: "submit-otp" })}
            onChangeNumber={handleChangeNumber}
            onResend={handleResend}
          />
        )}
      </section>
    </AppShell>
  );
}
