"use client";

import { forwardRef, type FormEvent } from "react";
import { OTP_LENGTH } from "@/features/auth/otp";
import { maskMobile } from "@/features/auth/phoneNumber";
import { LegalLine } from "./LegalLine";
import { OtpInput, type OtpInputHandle } from "./OtpInput";

type OtpStepProps = {
  mobile: string;
  digits: string[];
  error: string | null;
  verifying: boolean;
  canSubmit: boolean;
  resendIn: number;
  onDigitChange: (index: number, value: string) => void;
  onFill: (index: number, text: string) => void;
  onSubmit: () => void;
  onChangeNumber: () => void;
  onResend: () => void;
};

export const OtpStep = forwardRef<OtpInputHandle, OtpStepProps>(
  function OtpStep(
    {
      mobile,
      digits,
      error,
      verifying,
      canSubmit,
      resendIn,
      onDigitChange,
      onFill,
      onSubmit,
      onChangeNumber,
      onResend,
    },
    ref,
  ) {
    function handleSubmit(event: FormEvent) {
      event.preventDefault();
      onSubmit();
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="type-screen-title">Verify my number</h1>
          <p className="type-body-secondary">
            Check your phone for the {OTP_LENGTH}-digit OTP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="type-body font-bold text-pine">
            {maskMobile(mobile)}
          </span>
          <button
            type="button"
            onClick={onChangeNumber}
            className="min-h-11 text-body-sm font-bold text-pine-primary underline underline-offset-2"
          >
            Change
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span id="login-otp-label" className="type-field-label">
            Enter one time password (OTP)
          </span>

          <OtpInput
            ref={ref}
            digits={digits}
            invalid={Boolean(error)}
            disabled={verifying}
            labelId="login-otp-label"
            describedById="login-otp-error"
            onDigitChange={onDigitChange}
            onFill={onFill}
            onSubmit={onSubmit}
          />

          {/* Rendered unconditionally: a live region must exist in the DOM
              before its content changes, or the first error is never spoken. */}
          <p
            id="login-otp-error"
            role="status"
            aria-live="polite"
            className="min-h-4 text-caption text-danger"
          >
            {error}
          </p>
        </div>

        <p className="text-caption text-ink-secondary">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={resendIn > 0}
            className="font-bold text-pine-primary underline underline-offset-2 disabled:text-muted disabled:no-underline"
          >
            {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
          </button>
        </p>

        <LegalLine />

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary"
        >
          {verifying ? "Verifying…" : "Verify OTP"}
        </button>
      </form>
    );
  },
);
