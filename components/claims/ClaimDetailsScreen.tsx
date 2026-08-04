"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import {
  getClaimDetails,
  type ClaimProgressStep,
} from "@/features/claims/constants";
import { colors } from "@/lib/ui/colors";

type ClaimDetailsScreenProps = {
  claimId: string;
  backHref: string;
};

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke={colors.ink}
        strokeWidth="1.5"
      />
      <path d="M14 3v4h4" stroke={colors.ink} strokeWidth="1.5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={colors.pinePrimary} />
      <path
        d="M8 12.2 10.6 14.7 16 9.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpcomingCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke={colors.borderMuted} strokeWidth="1.5" />
      <path
        d="M12 8v4.2l2.4 1.4"
        stroke={colors.borderMuted}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-control border border-border-soft bg-white p-3">
      <span className="type-field-label">{label}</span>
      <span className="text-body-sm font-bold text-ink">{value}</span>
    </div>
  );
}

function ProgressRow({
  step,
  isLast,
}: {
  step: ClaimProgressStep;
  isLast: boolean;
}) {
  const done = step.status === "done";

  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex min-h-14 w-6 flex-col items-center">
        {done ? <CheckCircleIcon /> : <UpcomingCircleIcon />}
        {!isLast ? (
          done ? (
            <div className="mt-1 w-0.5 flex-1 bg-border-muted" />
          ) : (
            <div className="mt-1 w-0 flex-1 border-l-2 border-dashed border-border-muted" />
          )
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 pb-5">
        <p
          className={`text-body-sm font-bold ${
            done ? "text-ink" : "text-ink-secondary"
          }`}
        >
          {step.title}
        </p>
        <p
          className={`text-caption ${
            done ? "text-ink-secondary" : "text-ink-tertiary"
          }`}
        >
          {step.detail}
        </p>
      </div>
    </div>
  );
}

export function ClaimDetailsScreen({ claimId, backHref }: ClaimDetailsScreenProps) {
  const router = useRouter();
  const claim = getClaimDetails(claimId);

  return (
    <AppShell className="overflow-hidden">
      <header className="flex items-center gap-4 bg-white px-page pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.replace(backHref)}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="type-screen-title flex-1 truncate">Claim details</h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-8 pt-4">
        <section className="flex flex-col gap-4 rounded-bubble border border-border-line bg-white p-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-tint">
                <DocumentIcon />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="type-body font-bold text-ink">{claim.id}</p>
                <p className="type-body-secondary truncate">{claim.vendor}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-caption font-normal leading-4 text-success">
              {claim.status}
            </span>
          </div>

          <div className="h-px w-full bg-border-soft" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DetailField label="Category" value={claim.category} />
              <DetailField label="Amount" value={claim.amount} />
            </div>
            <div className="flex gap-2">
              <DetailField label="Submitted" value={claim.submittedAt} />
              <DetailField label="Current Status" value={claim.currentStatus} />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-section-title">Claim Progress</h2>
          <div className="flex flex-col gap-2 rounded-bubble border border-border-soft bg-white p-card">
            <div className="flex flex-col py-2">
              {claim.progress.map((step, index) => (
                <ProgressRow
                  key={step.id}
                  step={step}
                  isLast={index === claim.progress.length - 1}
                />
              ))}
            </div>
            <p className="type-body-secondary pt-2 font-bold">{claim.notifyNote}</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 pt-4">
          <button type="button" className="btn-primary">
            Contact Support
          </button>
          <button type="button" className="btn-secondary">
            Download Receipt
          </button>
        </section>
      </main>
    </AppShell>
  );
}

