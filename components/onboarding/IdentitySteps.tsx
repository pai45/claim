"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OtpInput, type OtpInputHandle } from "@/components/login/OtpInput";
import { distributeOtpPaste, isOtpComplete, verifyOtp } from "@/features/auth/otp";
import type { IdentityForm } from "@/features/onboarding/types";
import { colors } from "@/lib/ui/colors";
import { OnboardingHeader } from "./OnboardingHeader";
import { BottomSheet, CenterModal } from "./OnboardingModals";
import { TextField } from "./OnboardingPrimitives";
import { PrimaryFooter } from "./PrimaryFooter";

const verificationNote = (
  <p className="type-body-secondary mb-3 text-subtle">
    <span className="font-bold text-subtle">Note: </span>
    I verify that the information given above is accurate. If you find any
    discrepancies, please reach out to your HR Admin.
  </p>
);

function IdentityStepProgress({
  label,
  step,
}: {
  label: string;
  step: 1 | 2;
}) {
  const totalSteps = 2;
  return (
    <section
      className="relative mt-5 shrink-0 bg-[#ddf0dc] px-page py-2"
      aria-label={`Identity verification, step ${step} of ${totalSteps}`}
    >
      <p className="text-body-sm font-bold text-ink">{label}</p>
      <p className="text-caption text-ink-secondary">
        Step {step} of {totalSteps}
      </p>
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${step === 1 ? "w-1/2" : "w-full"} bg-mint`}
        aria-hidden="true"
      />
    </section>
  );
}

type IdentityEmailStepProps = {
  email: string;
  onBack: () => void;
  onVerified: () => void;
};

export function IdentityEmailStep({
  email,
  onBack,
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
      <IdentityStepProgress label="Email Verification" step={1} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-5">
        <TextField
          label="Email"
          value={email}
          type="email"
          placeholder="name@company.com"
          readOnly
        />
      </main>
      <PrimaryFooter
        label="Verify Email"
        disabled={!email.trim()}
        onClick={openSheet}
        secondary={verificationNote}
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
  onComplete: () => void;
};

export function IdentityDetailsStep({
  identity,
  onBack,
  onComplete,
}: IdentityDetailsStepProps) {
  const [successOpen, setSuccessOpen] = useState(false);

  const canProceed =
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
      <IdentityStepProgress label="Personal Details" step={2} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4 pt-5">
        <TextField
          label="Title"
          value={identity.title}
          readOnly
        />
        <TextField
          label="First Name"
          value={identity.firstName}
          hint="Please enter your first name as per PAN"
          readOnly
        />
        <TextField
          label="Middle Name"
          value={identity.middleName}
          hint="Please enter your middle name as per PAN"
          readOnly
        />
        <TextField
          label="Last Name"
          value={identity.lastName}
          hint="Please enter your last name as per PAN"
          readOnly
        />
        <TextField
          label="Date of Birth"
          value={identity.dateOfBirth}
          placeholder="DD/MM/YYYY"
          trailing={<CalendarIcon />}
          readOnly
        />
      </main>
      <PrimaryFooter
        label="Proceed"
        disabled={!canProceed}
        onClick={() => setSuccessOpen(true)}
        secondary={verificationNote}
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
