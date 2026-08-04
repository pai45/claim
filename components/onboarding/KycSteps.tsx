"use client";

import { useState } from "react";
import { colors } from "@/lib/ui/colors";
import { OnboardingHeader } from "./OnboardingHeader";
import { CenterModal } from "./OnboardingModals";
import { CheckRow } from "./OnboardingPrimitives";
import { PrimaryFooter } from "./PrimaryFooter";

type KycIntroStepProps = {
  onBack: () => void;
  onStart: () => void;
};

export function KycIntroStep({ onBack, onStart }: KycIntroStepProps) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      <OnboardingHeader title="KYC Verification" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4">
        <div className="mx-auto mt-4 flex h-36 w-36 items-center justify-center rounded-card bg-success-tint">
          <KycIllustration />
        </div>
        <h2 className="type-section-title mt-6 text-center">
          Complete your KYC Verification
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {[
            "Keep your Aadhaar & PAN card ready",
            "Please ensure you're in a well lit environment",
            "Follow on-screen instructions carefully",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: colors.success }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 12.5 4 4 8-9"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="type-body-secondary">{item}</span>
            </li>
          ))}
        </ul>
        {notice ? (
          <p className="mt-4 text-center text-caption font-bold text-ink-secondary">
            {notice}
          </p>
        ) : null}
      </main>
      <PrimaryFooter
        label="Start KYC Verification"
        onClick={onStart}
        secondary={
          <button
            type="button"
            className="mb-3 w-full text-center text-body-sm font-bold text-pine-primary"
            onClick={() => setNotice("Offline KYC is not available in this demo.")}
          >
            Proceed with Offline KYC
          </button>
        }
      />
    </>
  );
}

type KycConsentStepProps = {
  onBack: () => void;
  onConfirm: () => void;
};

export function KycConsentStep({ onBack, onConfirm }: KycConsentStepProps) {
  return (
    <>
      <OnboardingHeader title="pho labs" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4">
        <div className="rounded-card border border-border-line bg-white p-card shadow-card">
          <h2 className="type-section-title">Consent for Aadhaar Use (OTP)</h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 type-body-secondary">
            <li>
              I consent to use of my Aadhaar number for KYC verification with
              UIDAI via OTP.
            </li>
            <li>
              I understand this is a simulated partner flow for demo purposes.
            </li>
            <li>
              My demographic details may be shared with the employer benefits
              program.
            </li>
          </ul>
        </div>
      </main>
      <PrimaryFooter label="Confirm" onClick={onConfirm} />
    </>
  );
}

type KycAuthStepProps = {
  onBack: () => void;
  onAuthenticate: () => void;
};

export function KycAuthStep({ onBack, onAuthenticate }: KycAuthStepProps) {
  const [inIndia, setInIndia] = useState(false);

  return (
    <>
      <OnboardingHeader title="pho labs" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4">
        <div className="mx-auto mt-2 flex h-32 w-32 items-center justify-center rounded-card bg-surface-tint">
          <KycIllustration />
        </div>
        <p className="type-body-secondary mt-4 text-center">
          Keep your original PAN card handy and ensure you are in a well-lit
          environment before continuing.
        </p>
        <div className="mt-4">
          <CheckRow
            checked={inIndia}
            onChange={setInIndia}
            label="I confirm that I am physically present in India."
          />
        </div>
      </main>
      <PrimaryFooter
        label="Authenticate Aadhaar"
        disabled={!inIndia}
        onClick={onAuthenticate}
      />
    </>
  );
}

type KycProgressOverlayProps = {
  open: boolean;
  onDismiss: () => void;
};

export function KycProgressOverlay({
  open,
  onDismiss,
}: KycProgressOverlayProps) {
  return (
    <CenterModal
      open={open}
      variant="info"
      title="KYC Verification In Progress"
      description="Your KYC details are currently under review. This usually takes up to 24-48 hours."
      onConfirm={onDismiss}
      onClose={onDismiss}
    />
  );
}

type KycCompletedStepProps = {
  onContinue: () => void;
};

export function KycCompletedStep({ onContinue }: KycCompletedStepProps) {
  return (
    <>
      <OnboardingHeader title="KYC Verification" />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-page pb-4 text-center">
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: colors.success }}
          aria-hidden="true"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="m6.5 12.5 3.5 3.5 7.5-8"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="type-section-title mt-5">KYC Completed</h2>
        <p className="type-body-secondary mt-2 max-w-[280px]">
          Your KYC verification has been successfully completed.
        </p>
      </main>
      <PrimaryFooter label="Continue" onClick={onContinue} />
    </>
  );
}

function KycIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect
        x="16"
        y="8"
        width="32"
        height="48"
        rx="6"
        stroke={colors.pinePrimary}
        strokeWidth="2.5"
      />
      <rect
        x="22"
        y="16"
        width="20"
        height="14"
        rx="2"
        fill={colors.mintWash}
        stroke={colors.pinePrimary}
        strokeWidth="1.5"
      />
      <circle cx="44" cy="44" r="10" fill={colors.success} />
      <path
        d="m40 44 2.8 2.8 5.2-5.6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
