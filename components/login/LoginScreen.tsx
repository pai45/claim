"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { saveAuthSession } from "@/features/auth/session";
import {
  canSubmitMobile,
  canSubmitOtp,
  initialLoginState,
  loginReducer,
  otpValue,
} from "@/features/auth/loginMachine";
import { verifyOtp } from "@/features/auth/otp";
import { OtpStep } from "./OtpStep";
import { PhoneStep } from "./PhoneStep";
import { PlusPayWordmark } from "./PlusPayWordmark";
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
  // Cooldown is derived from a deadline set in the handlers that start it, so
  // no effect has to reset it on the way in.
  const [resendDeadline, setResendDeadline] = useState(0);
  const [now, setNow] = useState(0);

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<OtpInputHandle>(null);

  const verifying = state.status === "verifying";
  const resendIn = Math.max(0, Math.ceil((resendDeadline - now) / 1000));

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

  return (
    <AppShell variant="login" className="relative overflow-hidden">
      {/* Top-anchored at the art's own 394x396 ratio. Stretching this to cover
          the full viewport would crop away the coins, card and float icons. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[394/396]">
        <LoginBackground />
      </div>

      <div className="relative z-10 flex justify-center pt-6">
        <PlusPayWordmark />
      </div>

      <section className="animate-sheet-rise absolute inset-x-0 bottom-0 z-10 max-h-[85dvh] overflow-y-auto rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-6 shadow-drawer">
        {state.step === "phone" ? (
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
