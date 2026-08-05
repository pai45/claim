"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  type ClaimProgressStep,
} from "@/features/claims/constants";
import { downloadClaimReceipt } from "@/features/claims/receipt";
import { isClaimMutable, revokeClaim } from "@/features/claims/store";
import { useClaimDetails } from "@/features/claims/useClaimStore";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
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

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m14.5 5.5 4 4M4 20l4.1-.8L19.2 8.1a2.12 2.12 0 0 0-3-3L5.1 16.2 4 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4H6a2 2 0 0 0-2 2v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
  const claim = useClaimDetails(claimId);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [downloading, setDownloading] = useState(false);
  const mutable = isClaimMutable(claim.currentStatus);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setFeedback("");
    try {
      await downloadClaimReceipt(claim);
      setFeedback("Claim receipt downloaded.");
    } catch (error) {
      console.error("Claim receipt download failed", error);
      setFeedback("The receipt could not be downloaded. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleEdit() {
    setPendingChatIntent({ kind: "claim_edit", claimId: claim.id });
    router.push("/#claims");
  }

  function handleRevoke() {
    revokeClaim(claim.id);
    setConfirmRevokeOpen(false);
    setFeedback(`Claim ${claim.id} has been revoked.`);
  }

  return (
    <AppShell className="overflow-hidden">
      <header className="flex items-center gap-4 bg-white px-page pb-4 pt-2">
        <BackNavigationButton onClick={() => router.replace(backHref)} />
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
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading}
                aria-label={downloading ? "Downloading claim receipt" : "Download claim receipt"}
                title="Download claim receipt"
                className="flex h-11 w-11 items-center justify-center rounded-control text-pine transition-colors hover:bg-surface-tint disabled:opacity-50"
              >
                <DownloadIcon />
              </button>
              {mutable ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  aria-label="Edit claim"
                  title="Edit claim"
                  className="flex h-11 w-11 items-center justify-center rounded-control text-pine transition-colors hover:bg-surface-tint"
                >
                  <EditIcon />
                </button>
              ) : null}
            </div>
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

        {feedback ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-control bg-success-soft px-3 py-2 text-body-sm font-bold text-success"
          >
            {feedback}
          </p>
        ) : null}

        <section className="flex gap-3 pt-4">
          <button type="button" className="btn-primary">
            Contact Support
          </button>
          {mutable ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setConfirmRevokeOpen(true)}
            >
              Revoke Claim
            </button>
          ) : null}
        </section>
      </main>

      <ConfirmDialog
        open={confirmRevokeOpen}
        title="Revoke this claim?"
        description={`Are you sure you want to revoke claim ${claim.id}? This action can't be undone.`}
        confirmLabel="Revoke claim"
        cancelLabel="Keep claim"
        onConfirm={handleRevoke}
        onClose={() => setConfirmRevokeOpen(false)}
      />
    </AppShell>
  );
}

