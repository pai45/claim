"use client";

import { useRef } from "react";
import { colors } from "@/lib/ui/colors";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type BeneficiaryAddedSheetProps = {
  open: boolean;
  accountHolder: string;
  onClose: () => void;
  onContinue: () => void;
};

export function BeneficiaryAddedSheet({
  open,
  accountHolder,
  onClose,
  onContinue,
}: BeneficiaryAddedSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  useModalFocus(sheetRef, open, onClose);

  if (!open) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed inset-0 z-[70] mx-auto max-w-phone"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beneficiary-added-title"
      aria-describedby="beneficiary-added-description"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close beneficiary registration confirmation"
        onClick={onClose}
        className="absolute inset-0 bg-pine-dark/40"
      />
      <section className="animate-sheet-rise absolute inset-x-0 bottom-0 max-h-dvh overflow-y-auto rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-drawer">
        <header className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink-secondary"
            aria-label="Close beneficiary registration confirmation"
          >
            <CloseIcon />
          </button>
        </header>

        <div>
          <h2 id="beneficiary-added-title" className="type-screen-title text-ink">
            Beneficiary Added Successfully
          </h2>
          <p
            id="beneficiary-added-description"
            className="mt-2 type-body-secondary text-ink-secondary"
          >
            This bank account belongs to{" "}
            <strong className="font-bold text-ink">
              {accountHolder.trim().toUpperCase()}
            </strong>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <GuidanceRow
            icon={<BeneficiaryTimingIcon variant="new" />}
            title="For New Beneficiary"
          >
            After registration, the fund transfer process could take minimum 30
            mins.
          </GuidanceRow>
          <GuidanceRow
            icon={<BeneficiaryTimingIcon variant="existing" />}
            title="For Existing Beneficiary"
          >
            Subsequent fund transfers could take minimum 5 mins.
          </GuidanceRow>
        </div>

        <div className="my-6 border-t border-border-soft" />

        <GuidanceRow icon={<InfoIcon />} title="Transfer Limit">
          The default transfer limit for this beneficiary is ₹2L. To adjust the
          limit, please contact{" "}
          <a
            href="mailto:support@pinelabs.com"
            className="font-bold text-pine-primary underline underline-offset-2"
          >
            support@pinelabs.com
          </a>
          .
        </GuidanceRow>

        <button type="button" className="btn-primary mt-7" onClick={onContinue}>
          Continue
        </button>
      </section>
    </div>
  );
}

function GuidanceRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-success-soft">
        {icon}
      </span>
      <div className="pt-1">
        <h3 className="type-section-title text-ink">{title}</h3>
        <p className="mt-1 type-body-secondary text-ink-secondary">{children}</p>
      </div>
    </div>
  );
}

function BeneficiaryTimingIcon({ variant }: { variant: "new" | "existing" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="4" fill={colors.success} />
      <path
        d="M3.5 20c.9-4.1 3.1-6.2 6.5-6.2s5.6 2.1 6.5 6.2"
        fill={colors.success}
      />
      <path
        d={variant === "new" ? "m17 16 2 2 3-4" : "m16.5 17 2 2 3-4"}
        stroke={colors.success}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={colors.success} />
      <path
        d="M12 10v6m0-9h.01"
        stroke={colors.white}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
