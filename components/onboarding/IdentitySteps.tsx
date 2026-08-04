"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OtpInput, type OtpInputHandle } from "@/components/login/OtpInput";
import { DEMO_OTP, distributeOtpPaste, isOtpComplete, verifyOtp } from "@/features/auth/otp";
import type { IdentityForm } from "@/features/onboarding/types";
import { colors } from "@/lib/ui/colors";
import { OnboardingHeader } from "./OnboardingHeader";
import { BottomSheet, CenterModal } from "./OnboardingModals";
import { CheckRow, TextField } from "./OnboardingPrimitives";
import { PrimaryFooter } from "./PrimaryFooter";

type IdentityEmailStepProps = {
  email: string;
  onBack: () => void;
  onChangeEmail: (value: string) => void;
  onVerified: () => void;
};

export function IdentityEmailStep({
  email,
  onBack,
  onChangeEmail,
  onVerified,
}: IdentityEmailStepProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const otpRef = useRef<OtpInputHandle>(null);

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), 400);
    return () => window.clearTimeout(timer);
  }, [remaining, now]);

  useEffect(() => {
    if (!sheetOpen) return;
    const frame = window.requestAnimationFrame(() => otpRef.current?.focus(0));
    return () => window.cancelAnimationFrame(frame);
  }, [sheetOpen]);

  function openSheet() {
    if (!email.trim()) return;
    setDigits(["", "", "", "", "", ""]);
    setError(null);
    setSheetOpen(true);
    const started = Date.now();
    setDeadline(started + 59_000);
    setNow(started);
  }

  function handleVerifyOtp() {
    if (!isOtpComplete(digits)) return;
    const result = verifyOtp(digits.join(""));
    if (!result.ok) {
      setError(result.message);
      setDigits(["", "", "", "", "", ""]);
      otpRef.current?.focus(0);
      return;
    }
    setSheetOpen(false);
    onVerified();
  }

  return (
    <>
      <OnboardingHeader
        title="Identity Verification"
        subtitle="Complete these steps to activate your account."
        onBack={onBack}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4">
        <div className="mb-4 rounded-control bg-success-tint px-3 py-3">
          <p className="text-body-sm font-bold text-pine-primary">
            Email Verification
          </p>
          <p className="text-caption text-ink-secondary">Step 1 of 2</p>
        </div>
        <TextField
          label="Email"
          value={email}
          onChange={onChangeEmail}
          type="email"
          placeholder="name@company.com"
        />
        <p className="mt-3 text-caption text-ink-tertiary">
          Demo OTP: {DEMO_OTP}
        </p>
      </main>
      <PrimaryFooter
        label="Verify Email"
        disabled={!email.trim()}
        onClick={openSheet}
      />

      <BottomSheet
        open={sheetOpen}
        title="Verify Email OTP to Proceed"
        description={
          <>
            Please enter the verification code sent to your email{" "}
            <strong className="text-ink">{email}</strong>
          </>
        }
        onClose={closeSheet}
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
          labelId="email-otp-label"
          describedById="email-otp-error"
          onDigitChange={(index, value) => {
            setError(null);
            const digit = value.replace(/\D/g, "").slice(-1);
            setDigits((prev) => {
              const next = [...prev];
              next[index] = digit;
              return next;
            });
          }}
          onFill={(index, text) => {
            setError(null);
            setDigits((prev) => distributeOtpPaste(prev, index, text));
          }}
          onSubmit={handleVerifyOtp}
        />
        <span id="email-otp-label" className="sr-only">
          Email OTP
        </span>
        <div className="mt-3 flex items-center justify-between text-caption">
          <span className="font-bold text-ink-secondary">
            {remaining > 0
              ? `00:${String(remaining).padStart(2, "0")}`
              : "00:00"}
          </span>
          <button
            type="button"
            className="font-bold text-pine-primary disabled:text-muted"
            disabled={remaining > 0}
            onClick={() => {
              setDigits(["", "", "", "", "", ""]);
              setError(null);
              const started = Date.now();
              setDeadline(started + 59_000);
              setNow(started);
            }}
          >
            Resend OTP
          </button>
        </div>
        {error ? (
          <p id="email-otp-error" className="mt-2 text-caption text-danger">
            {error}
          </p>
        ) : (
          <span id="email-otp-error" className="sr-only" />
        )}
      </BottomSheet>
    </>
  );
}

type IdentityDetailsStepProps = {
  identity: IdentityForm;
  onBack: () => void;
  onChange: (field: keyof IdentityForm, value: string) => void;
  onComplete: () => void;
};

export function IdentityDetailsStep({
  identity,
  onBack,
  onChange,
  onComplete,
}: IdentityDetailsStepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const canProceed =
    confirmed &&
    identity.firstName.trim() &&
    identity.lastName.trim() &&
    identity.dateOfBirth.trim();

  return (
    <>
      <OnboardingHeader
        title="Identity Verification"
        subtitle="Complete these steps to activate your account."
        onBack={onBack}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4">
        <div className="rounded-control bg-success-tint px-3 py-3">
          <p className="text-body-sm font-bold text-pine-primary">
            Personal Details
          </p>
          <p className="text-caption text-ink-secondary">Step 2 of 2</p>
        </div>
        <TextField
          label="Title"
          value={identity.title}
          onChange={(value) => onChange("title", value)}
        />
        <TextField
          label="First Name"
          value={identity.firstName}
          onChange={(value) => onChange("firstName", value)}
          hint="Please enter your first name as per PAN"
        />
        <TextField
          label="Middle Name"
          value={identity.middleName}
          onChange={(value) => onChange("middleName", value)}
          hint="Please enter your middle name as per PAN"
        />
        <TextField
          label="Last Name"
          value={identity.lastName}
          onChange={(value) => onChange("lastName", value)}
          hint="Please enter your last name as per PAN"
        />
        <TextField
          label="Date of Birth"
          value={identity.dateOfBirth}
          onChange={(value) => onChange("dateOfBirth", value)}
          placeholder="DD/MM/YYYY"
          trailing={<CalendarIcon />}
        />
        <CheckRow
          checked={confirmed}
          onChange={setConfirmed}
          label="I verify that the information given above is accurate. If you find any discrepancies, please reach out to your HR Admin."
        />
      </main>
      <PrimaryFooter
        label="Proceed"
        disabled={!canProceed}
        onClick={() => setSuccessOpen(true)}
      />
      <CenterModal
        open={successOpen}
        title="Success"
        description="Your identity verification has been completed successfully."
        onConfirm={() => {
          setSuccessOpen(false);
          onComplete();
        }}
        onClose={() => {
          setSuccessOpen(false);
          onComplete();
        }}
      />
    </>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
