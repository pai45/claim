"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { TransactionIcon } from "@/components/transactions/TransactionIcon";
import {
  formatINR,
  getTransaction,
  type TransactionItem,
} from "@/features/transactions/constants";
import { colors } from "@/lib/ui/colors";

type TransactionDetailsScreenProps = {
  transactionId: string;
};

export function TransactionDetailsScreen({
  transactionId,
}: TransactionDetailsScreenProps) {
  const router = useRouter();
  const txn =
    getTransaction(transactionId) ?? getTransaction("txn-amazon")!;

  return (
    <AppShell className="overflow-hidden" variant="surface">
      <ScreenHeader
        title="Transaction Details"
        onBack={() => router.back()}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-8 pt-2">
        <SummaryCard txn={txn} />

        <section className="flex flex-col gap-2">
          <h2 className="type-section-title text-pine-primary">
            Transaction Information
          </h2>
          <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
            <InfoRow
              icon={<DocIcon />}
              label="Transaction ID"
              value={txn.transactionId}
            />
            <InfoRow
              icon={<PageIcon />}
              label="Reference Number"
              value={txn.referenceNumber}
            />
            <InfoRow
              icon={<CalendarSmallIcon />}
              label="Date & Time"
              value={txn.dateTime}
            />
            <InfoRow
              icon={<ShapesIcon />}
              label="Category"
              value={txn.category}
            />
            <InfoRow
              icon={<PinIcon />}
              label="Location"
              value={txn.location}
              isLast
            />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="type-section-title text-pine-primary">
            Payment Information
          </h2>
          <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
            <InfoRow
              icon={<BillIcon />}
              label="Payment Mode"
              value={txn.paymentMode}
            />
            <InfoRow
              icon={<CardIcon />}
              label="Card Used"
              value={txn.cardMasked}
            />
            <InfoRow
              icon={<WalletIcon />}
              label="Wallet Name"
              value={txn.walletName}
              isLast
            />
          </div>
        </section>

        <div className="flex overflow-hidden rounded-card border border-border-line bg-white shadow-card">
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 text-body-sm font-bold text-pine-primary"
          >
            <DownloadIcon />
            Download
          </button>
          <div className="w-px self-stretch bg-border-line" aria-hidden="true" />
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 text-body-sm font-bold text-pine-primary"
          >
            <ShareIcon />
            Share
          </button>
        </div>

        <button type="button" className="btn-secondary min-h-11 h-auto py-3">
          Report an Issue
        </button>
      </main>
    </AppShell>
  );
}

function SummaryCard({ txn }: { txn: TransactionItem }) {
  const amountPrefix = txn.type === "credit" ? "+" : "";
  return (
    <section className="rounded-card border border-border-line bg-white p-card shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-tint">
          <TransactionIcon icon={txn.icon} size={20} />
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <p className="text-caption text-ink-secondary">
            {txn.type === "credit" ? "Amount received" : "Amount paid"}
          </p>
          <p className="type-amount text-ink">
            {amountPrefix}
            {formatINR(txn.amount)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-control bg-success-tint px-3 py-3">
        <div className="min-w-0">
          <p className="type-body truncate font-bold text-ink">{txn.merchant}</p>
          <p className="text-caption text-ink-secondary">
            {txn.type === "credit" ? "Received in" : "Paid to"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-caption font-bold text-ink">
          <CalendarSmallIcon />
          {txn.dateLabel}
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-page py-3.5 ${
        isLast ? "" : "border-b border-border-line"
      }`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-ink-secondary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-ink-secondary">{label}</p>
        <p className="text-body-sm font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <path d="M14 3v4h4M8 12h8M8 16h5" stroke={colors.inkSecondary} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <path d="M15 4v3h3" stroke={colors.inkSecondary} strokeWidth="1.6" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function ShapesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={colors.inkSecondary} strokeWidth="1.6" />
      <circle cx="17" cy="7" r="3.5" stroke={colors.inkSecondary} strokeWidth="1.6" />
      <path
        d="M8 20 12 13l4 7H8Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="2" stroke={colors.inkSecondary} strokeWidth="1.6" />
    </svg>
  );
}

function BillIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h12v16l-2-1.5L14 20l-2-1.5L10 20l-2-1.5L6 20V4Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 9h6M9 13h4" stroke={colors.inkSecondary} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <path d="M2.5 9.5h19M6 14h4" stroke={colors.inkSecondary} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 7.5A1.5 1.5 0 0 1 5 6h12.5A1.5 1.5 0 0 1 19 7.5V9h-3a2.5 2.5 0 0 0 0 5h3v2.5A1.5 1.5 0 0 1 17.5 18H5a1.5 1.5 0 0 1-1.5-1.5v-9Z"
        stroke={colors.inkSecondary}
        strokeWidth="1.6"
      />
      <circle cx="16.5" cy="11.5" r="1" fill={colors.inkSecondary} />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" stroke={colors.pinePrimary} strokeWidth="1.7" />
      <circle cx="6" cy="12" r="2.5" stroke={colors.pinePrimary} strokeWidth="1.7" />
      <circle cx="18" cy="19" r="2.5" stroke={colors.pinePrimary} strokeWidth="1.7" />
      <path
        d="m8.2 13.2 7.5 4.1M15.7 6.7l-7.5 4.1"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
      />
    </svg>
  );
}
