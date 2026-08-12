"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OtpInput, type OtpInputHandle } from "@/components/login/OtpInput";
import { BottomSheet } from "@/components/onboarding/OnboardingModals";
import { distributeOtpPaste, isOtpComplete, verifyOtp } from "@/features/auth/otp";

export function MobileOtpSheet({
  open,
  mobile,
  onClose,
  onVerified,
}: {
  open: boolean;
  mobile: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(59);
  const otpRef = useRef<OtpInputHandle>(null);

  const sendOtp = useCallback(() => {
    setDigits(["", "", "", "", "", ""]);
    setError(null);
    setRemaining(59);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => otpRef.current?.focus(0));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(
      () => setRemaining((current) => Math.max(0, current - 1)),
      1_000,
    );
    return () => window.clearTimeout(timer);
  }, [remaining]);

  function handleVerifyOtp() {
    if (!isOtpComplete(digits)) return;
    const result = verifyOtp(digits.join(""));
    if (!result.ok) {
      setError(result.message);
      setDigits(["", "", "", "", "", ""]);
      otpRef.current?.focus(0);
      return;
    }
    onVerified();
  }

  return (
    <BottomSheet
      open={open}
      title="Verify mobile OTP to continue"
      description={
        <>
          Enter the verification code sent to your mobile number{" "}
          <strong className="text-ink">{mobile}</strong>
        </>
      }
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn-primary"
          disabled={!isOtpComplete(digits)}
          onClick={handleVerifyOtp}
        >
          Verify OTP
        </button>
      }
    >
      <OtpInput
        ref={otpRef}
        digits={digits}
        invalid={Boolean(error)}
        disabled={false}
        labelId="bank-transfer-otp-label"
        describedById="bank-transfer-otp-error"
        onDigitChange={(index, value) => {
          setError(null);
          const digit = value.replace(/\D/g, "").slice(-1);
          setDigits((current) => {
            const next = [...current];
            next[index] = digit;
            return next;
          });
        }}
        onFill={(index, text) => {
          setError(null);
          setDigits((current) => distributeOtpPaste(current, index, text));
        }}
        onSubmit={handleVerifyOtp}
      />
      <span id="bank-transfer-otp-label" className="sr-only">
        Mobile OTP
      </span>
      <div className="mt-3 flex items-center justify-between text-caption">
        <span className="font-bold text-ink-secondary">
          {remaining > 0 ? `00:${String(remaining).padStart(2, "0")}` : "00:00"}
        </span>
        <button
          type="button"
          className="font-bold text-pine-primary disabled:text-muted"
          disabled={remaining > 0}
          onClick={sendOtp}
        >
          Resend OTP
        </button>
      </div>
      {error ? (
        <p id="bank-transfer-otp-error" className="mt-2 text-caption text-danger">
          {error}
        </p>
      ) : (
        <span id="bank-transfer-otp-error" className="sr-only" />
      )}
    </BottomSheet>
  );
}
