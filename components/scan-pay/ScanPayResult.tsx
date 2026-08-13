"use client";

/* eslint-disable @next/next/no-img-element */
import type { ChangeEvent, Dispatch } from "react";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  formatScanPayINR,
  receiptRows,
} from "@/features/scan-pay/receipt";
import type {
  ScanPayAction,
  ScanPayState,
  ScanPayTransaction,
} from "@/features/scan-pay/types";
import {
  DEMO_DOCUMENT_ASSETS,
  SCAN_PAY_ASSETS,
  UPI_SETTINGS_ASSETS,
} from "@/lib/ui/assets";
import { withBasePath } from "@/lib/basePath";

type ReceiptActionProps = {
  transaction: ScanPayTransaction;
  onDownload: (transaction: ScanPayTransaction) => void;
  onShare: (transaction: ScanPayTransaction) => void;
};

export function ScanPaySubmitting({
  transactionAmount,
  onBack,
}: {
  transactionAmount: number;
  onBack: () => void;
}) {
  return (
    <AppShell className="scan-pay-shell overflow-hidden bg-white">
      <ScreenHeader title="Processing Payment" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-page text-center">
        <div className="relative flex items-center justify-center">
          <span className="scan-pay-processing-halo" aria-hidden="true" />
          <span
            className="scan-pay-processing-halo scan-pay-processing-halo--b"
            aria-hidden="true"
          />
          <div className="scan-pay-processing-orbit relative z-10 flex h-24 w-24 items-center justify-center rounded-pill bg-surface-tint shadow-icon">
            <AppIcon
              src={SCAN_PAY_ASSETS.paymentProcessingLogo}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
        </div>
        <h2
          className="animate-rise-in type-section-title mt-8 text-pine"
          style={{ animationDelay: "140ms" }}
        >
          Processing payment
        </h2>
        <p
          className="animate-rise-in mt-1 type-body-secondary"
          style={{ animationDelay: "200ms" }}
        >
          Please don’t close the app
        </p>
        <p
          className="animate-rise-in type-amount mt-5"
          style={{ animationDelay: "260ms" }}
        >
          {formatScanPayINR(transactionAmount)}
        </p>
      </main>
      <footer className="shrink-0 px-page pb-8 text-center text-caption text-ink-secondary">
        Your payment is secure and encrypted
      </footer>
    </AppShell>
  );
}

export function ScanPayResult({
  state,
  dispatch,
  onClose,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
  onClose: () => void;
}) {
  const transaction = state.transaction;
  if (!transaction) return null;
  const failed = transaction.outcome === "failed";
  return (
    <AppShell className="scan-pay-shell overflow-hidden bg-white">
      <ScreenHeader
        title={failed ? "Payment Failed" : "Payment Processing"}
        onBack={() => dispatch({ type: "BACK" })}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-3">
        <ReceiptTicket transaction={transaction} />
        <SupportCard
          onSupport={() =>
            dispatch({ type: "OPEN_FAQ", returnStep: "result" })
          }
        />
        {transaction.payee.kind !== "bank-transfer" ? (
          <AppIcon
            src={UPI_SETTINGS_ASSETS.poweredByUpi}
            alt="Powered by UPI"
            width={72}
            height={30}
            className="mx-auto mt-8 h-auto w-16"
          />
        ) : null}
      </main>
      <footer className="shrink-0 border-t border-border-soft bg-white px-page pb-5 pt-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            failed ? dispatch({ type: "RETRY_PAYMENT" }) : onClose()
          }
        >
          {failed ? "Retry Payment" : "Done"}
        </button>
      </footer>
    </AppShell>
  );
}

export function ScanPayPaymentDetails({
  state,
  dispatch,
  onDownload,
  onShare,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
} & Omit<ReceiptActionProps, "transaction">) {
  const transaction = state.transaction;
  if (!transaction) return null;
  return (
    <AppShell className="scan-pay-shell overflow-hidden bg-white">
      <ScreenHeader
        title="Payment Successful"
        onBack={() => dispatch({ type: "BACK" })}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-3">
        <ReceiptTicket transaction={transaction} />

        {state.receiptState === "confirmed" ? (
          <div className="mt-3 flex items-center gap-3 rounded-card border border-success-border bg-success-soft p-card text-success shadow-card" role="status">
            <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-success text-white">
              <ScanPayIcon name="check" />
            </span>
            <div>
              <p className="text-body-sm font-bold">Receipt uploaded</p>
              <p className="text-caption text-ink-secondary">
                Your proof of payment is attached to this transaction.
              </p>
            </div>
          </div>
        ) : null}

        <SupportCard
          onSupport={() =>
            dispatch({ type: "OPEN_FAQ", returnStep: "paymentDetails" })
          }
        />
        <ReceiptActions
          transaction={transaction}
          onDownload={onDownload}
          onShare={onShare}
        />
        {transaction.payee.kind !== "bank-transfer" ? (
          <AppIcon
            src={UPI_SETTINGS_ASSETS.poweredByUpi}
            alt="Powered by UPI"
            width={72}
            height={30}
            className="mx-auto mt-8 h-auto w-16"
          />
        ) : null}
      </main>
      <footer className="shrink-0 border-t border-border-soft bg-white px-page pb-5 pt-3">
        <button
          type="button"
          className="btn-primary gap-2"
          onClick={() => dispatch({ type: "OPEN_RECEIPT_CAPTURE" })}
        >
          <ScanPayIcon name="receipt" />
          {state.receiptState === "confirmed" ? "Replace Receipt" : "Upload Receipt"}
        </button>
      </footer>
    </AppShell>
  );
}

export function ScanPayReceiptCapture({
  dispatch,
}: {
  dispatch: Dispatch<ScanPayAction>;
}) {
  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    dispatch({ type: "CAPTURE_RECEIPT", preview: URL.createObjectURL(file) });
  }

  return (
    <AppShell className="scan-pay-shell relative overflow-hidden bg-pine-dark text-white">
      <AppIcon
        src={DEMO_DOCUMENT_ASSETS.billMeal}
        alt="Receipt ready to capture"
        width={402}
        height={874}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-pine-dark/35" aria-hidden="true" />
      <header className="relative z-10 flex items-center justify-between px-page pt-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-pill bg-white/90 text-pine shadow-soft"
          aria-label="Back to payment details"
        >
          <ScanPayIcon name="arrow" className="rotate-180" />
        </button>
        <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-pill bg-white/90 text-pine shadow-soft" aria-label="Choose receipt from gallery">
          <ScanPayIcon name="gallery" />
          <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
        </label>
      </header>
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-page">
        <div className="h-[68%] w-full rounded-card border-2 border-white/70" aria-hidden="true" />
      </main>
      <footer className="relative z-10 flex shrink-0 justify-center pb-8">
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "CAPTURE_RECEIPT",
              preview: DEMO_DOCUMENT_ASSETS.billMeal,
            })
          }
          className="flex h-20 w-20 items-center justify-center rounded-pill border-4 border-white bg-white/30 shadow-icon"
          aria-label="Capture receipt"
        >
          <span className="h-14 w-14 rounded-pill bg-white" />
        </button>
      </footer>
    </AppShell>
  );
}

export function ScanPayReceiptReview({
  state,
  dispatch,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
}) {
  const source = state.receiptPreview?.startsWith("blob:")
    ? state.receiptPreview
    : withBasePath(state.receiptPreview ?? DEMO_DOCUMENT_ASSETS.billMeal);
  return (
    <AppShell className="scan-pay-shell overflow-hidden bg-pine-dark">
      <main className="flex min-h-0 flex-1 items-center justify-center p-page">
        <img
          src={source}
          alt="Captured receipt preview"
          className="max-h-full max-w-full rounded-card object-contain shadow-menu"
        />
      </main>
      <footer className="grid shrink-0 grid-cols-2 gap-3 bg-white px-page pb-5 pt-3">
        <button
          type="button"
          className="btn-secondary gap-2"
          onClick={() => dispatch({ type: "RETAKE_RECEIPT" })}
        >
          <ScanPayIcon name="close" />
          Retake
        </button>
        <button
          type="button"
          className="btn-primary gap-2"
          onClick={() => dispatch({ type: "CONFIRM_RECEIPT" })}
        >
          <ScanPayIcon name="check" />
          Confirm
        </button>
      </footer>
    </AppShell>
  );
}

export function ReceiptTicket({
  transaction,
  compact = false,
}: {
  transaction: ScanPayTransaction;
  compact?: boolean;
}) {
  const tone = {
    success: {
      bar: "bg-pine-primary",
      icon: "bg-pine-primary text-white",
      status: "text-success",
    },
    failed: {
      bar: "bg-danger",
      icon: "bg-danger text-white",
      status: "text-danger",
    },
    processing: {
      bar: "bg-warning",
      icon: "bg-warning text-white",
      status: "text-warning",
    },
  }[transaction.outcome];
  return (
    <article className="scan-pay-ticket overflow-hidden rounded-card border border-border-line bg-white shadow-card">
      <div className={`h-3 ${tone.bar}`} />
      <div className={`${compact ? "px-3 pb-3" : "px-card pb-card"}`}>
        <div className="flex flex-col items-center border-b border-dashed border-border-muted py-4 text-center">
          <span className={`flex h-12 w-12 items-center justify-center rounded-pill shadow-icon ${tone.icon}`}>
            <ScanPayIcon
              name={transaction.outcome === "failed" ? "close" : transaction.outcome === "processing" ? "upi" : "check"}
              size={26}
            />
          </span>
          <p className="type-amount mt-2">{formatScanPayINR(transaction.amount)}</p>
          <p className="text-caption text-ink-secondary">
            Paid to {transaction.payee.name}
          </p>
        </div>
        <dl className="divide-y divide-border-soft">
          {receiptRows(transaction).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-caption">
              <dt className="text-ink-secondary">{label}</dt>
              <dd className={`max-w-[62%] text-right font-bold ${label === "Status" ? transaction.payee.kind === "bank-transfer" ? "text-warning" : tone.status : "text-ink"}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function SupportCard({ onSupport }: { onSupport: () => void }) {
  return (
    <section className="mt-3 rounded-card border border-warning-border bg-warning-soft p-card shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-warning-tint text-warning">
          <ScanPayIcon name="warning" />
        </span>
        <div>
          <h2 className="text-body-sm font-bold text-ink">
            Any issues with this transaction?
          </h2>
          <p className="mt-0.5 text-caption text-ink-secondary">
            Our support team is here to help you 24/7.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="btn-secondary mt-3 h-auto min-h-11 text-body-sm"
        onClick={onSupport}
      >
        Get Support
      </button>
    </section>
  );
}

export function ReceiptActions({
  transaction,
  onDownload,
  onShare,
  onViewDetails,
}: ReceiptActionProps & { onViewDetails?: () => void }) {
  const actions = [
    onViewDetails
      ? {
          label: "View Details",
          icon: SCAN_PAY_ASSETS.transactionDetails,
          action: onViewDetails,
        }
      : null,
    {
      label: "Download",
      icon: SCAN_PAY_ASSETS.downloadSquare,
      action: () => onDownload(transaction),
    },
    {
      label: "Share",
      icon: SCAN_PAY_ASSETS.shareSquare,
      action: () => onShare(transaction),
    },
  ].filter(Boolean) as { label: string; icon: string; action: () => void }[];
  return (
    <div
      role="group"
      aria-label="Receipt actions"
      className={`mt-4 grid divide-x divide-border-line overflow-hidden rounded-card border border-border-line bg-white shadow-card ${actions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.action}
          className="flex min-h-20 flex-col items-center justify-center gap-2 px-2 py-3 transition-colors hover:bg-surface-tint active:bg-surface-tint-strong focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine-primary"
        >
          <AppIcon src={action.icon} alt="" size={24} className="h-6 w-6" />
          <span className="text-caption font-normal leading-4 text-ink-secondary">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
