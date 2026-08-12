"use client";

import type { CSSProperties } from "react";
import { ReceiptActions } from "@/components/scan-pay/ScanPayResult";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppShell } from "@/components/shared/AppShell";
import {
  formatScanPayINR,
  paymentPayeeIdentifier,
  receiptRows,
  transactionStatusLabel,
} from "@/features/scan-pay/receipt";
import type { ScanPayTransaction } from "@/features/scan-pay/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type PaidScreenProps = {
  transaction: ScanPayTransaction;
  /**
   * Delay added to every entrance animation, so the screen can wait behind the success
   * tick overlay. Back-navigation from payment details renders it with no overlay in
   * front and passes 0 — without that the screen would sit blank for a second.
   */
  entranceBaseMs?: number;
  onViewDetails?: () => void;
  onDownload?: (transaction: ScanPayTransaction) => void;
  onShare?: (transaction: ScanPayTransaction) => void;
  onClose: () => void;
};

/**
 * The paid-to receipt, shared by Scan & Pay and bank transfers. The two differ only in
 * which receipt actions they offer and in how their status reads.
 */
function ScanPayPaidScreen({
  transaction,
  entranceBaseMs = 0,
  onViewDetails,
  onDownload,
  onShare,
  onClose,
}: PaidScreenProps) {
  const isBankTransfer = transaction.payee.kind === "bank-transfer";
  const status = transactionStatusLabel(transaction);
  const rows = receiptRows(transaction);

  return (
    <AppShell
      className="scan-pay-shell scan-pay-paid-screen relative overflow-hidden bg-white"
      style={{ "--paid-enter-base": `${entranceBaseMs}ms` } as CSSProperties}
    >
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-28 pt-4">
        <section className="scan-pay-paid-hero">
          <p className="scan-pay-paid-badge">
            <span className="scan-pay-paid-badge-check">
              <ScanPayIcon name="check" size={18} />
            </span>
            {formatScanPayINR(transaction.amount)}
          </p>
        </section>

        <div className="scan-pay-paid-payee mt-5 text-center">
          <p className="type-body-secondary">
            Paid to{" "}
            <span className="text-body font-bold text-pine">
              {transaction.payee.name}
            </span>
          </p>
          <p className="mt-0.5 text-caption text-ink-secondary">
            {paymentPayeeIdentifier(transaction)}
          </p>
        </div>

        <section className="scan-pay-paid-details mt-7">
          <h2 className="type-section-title">Transaction details</h2>
          <p className="mt-0.5 type-body-secondary">
            Reference, funding source and category
          </p>

          <dl className="mt-3 divide-y divide-border-soft">
            {rows.map(([label, value], index) => (
              <div
                key={label}
                className="animate-rise-in flex items-start justify-between gap-4 py-2.5 text-caption"
                style={staggerStyle(index, 45, 360, entranceBaseMs + 400)}
              >
                <dt className="text-ink-secondary">{label}</dt>
                <dd
                  className={`max-w-[62%] text-right font-bold ${
                    label === "Status"
                      ? status === "Success"
                        ? "text-success"
                        : "text-warning"
                      : "text-ink"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="scan-pay-paid-total mt-3 flex items-baseline justify-between border-t border-border-line pt-3">
            <span className="type-body font-bold text-pine">
              {isBankTransfer ? "Total debited" : "Total paid"}
            </span>
            <span className="font-display text-title font-bold text-pine">
              {formatScanPayINR(transaction.amount)}
            </span>
          </div>

          {onDownload && onShare ? (
            <div className="scan-pay-paid-actions">
              <ReceiptActions
                transaction={transaction}
                onViewDetails={onViewDetails}
                onDownload={onDownload}
                onShare={onShare}
              />
            </div>
          ) : null}
        </section>
      </main>

      <footer className="scan-pay-paid-footer absolute inset-x-0 bottom-0 z-30 border-t border-border-soft bg-white px-page pb-5 pt-3">
        <button type="button" className="btn-primary gap-2" onClick={onClose}>
          Back to Home
          <ScanPayIcon name="arrow" />
        </button>
      </footer>
    </AppShell>
  );
}

export function ScanPayReward({
  transaction,
  entranceBaseMs,
  onViewDetails,
  onDownload,
  onShare,
  onClose,
}: {
  transaction: ScanPayTransaction;
  entranceBaseMs?: number;
  onViewDetails: () => void;
  onDownload: (transaction: ScanPayTransaction) => void;
  onShare: (transaction: ScanPayTransaction) => void;
  onClose: () => void;
}) {
  return (
    <ScanPayPaidScreen
      transaction={transaction}
      entranceBaseMs={entranceBaseMs}
      onViewDetails={onViewDetails}
      onDownload={onDownload}
      onShare={onShare}
      onClose={onClose}
    />
  );
}

/** Bank transfers share the paid-to layout; they settle as Pending rather than Success. */
export function ScanPayBankTransferPaid({
  transaction,
  entranceBaseMs,
  onDownload,
  onShare,
  onClose,
}: {
  transaction: ScanPayTransaction;
  entranceBaseMs?: number;
  onDownload?: (transaction: ScanPayTransaction) => void;
  onShare?: (transaction: ScanPayTransaction) => void;
  onClose: () => void;
}) {
  return (
    <ScanPayPaidScreen
      transaction={transaction}
      entranceBaseMs={entranceBaseMs}
      onDownload={onDownload}
      onShare={onShare}
      onClose={onClose}
    />
  );
}
