"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanPayFlow } from "@/components/scan-pay/ScanPayFlow";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { BenefitWalletIcon } from "@/components/shared/BenefitWalletIcon";
import { TransactionListCard } from "@/components/transactions/TransactionListCard";
import {
  getPayee,
  getPayeeHistory,
  getRecentPayees,
  type RecipientPaymentRecord,
  useRecipientHistoryVersion,
} from "@/features/send-money/history";
import type {
  ScanPayLaunch,
  ScanPayMode,
  UpiPayee,
} from "@/features/scan-pay/types";
import {
  clearCompletedPaymentReturn,
  readCompletedPaymentReturn,
} from "@/features/scan-pay/paymentReturn";
import { buildTransactionDetailsHref } from "@/features/transactions/navigation";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { formatSignedINR } from "@/features/transactions/constants";
import { UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function PayUpiScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const historyVersion = useRecipientHistoryVersion();
  void historyVersion;
  const mode = resolveMode(searchParams.get("mode"), persona.access);
  const payeeId = searchParams.get("payee");
  const resumePaymentId = searchParams.get("resumePayment");
  const payees = getRecentPayees(mode);
  const selectedPayee = payeeId ? getPayee(payeeId, mode) : undefined;
  const [launch, setLaunch] = useState<ScanPayLaunch | null>(() => {
    const transaction = resumePaymentId
      ? readCompletedPaymentReturn(resumePaymentId)
      : null;
    return transaction ? { kind: "completed", transaction } : null;
  });

  useEffect(() => {
    if (launch?.kind === "completed") {
      clearCompletedPaymentReturn(launch.transaction.transactionId);
    }
  }, [launch]);

  function navigateToPayee(payee: UpiPayee) {
    router.push(sendMoneyUrl(mode, payee.id));
  }

  function closePayee() {
    router.push(sendMoneyUrl(mode));
  }

  function closePaymentFlow() {
    setLaunch(null);
    if (resumePaymentId) {
      router.replace(sendMoneyUrl(mode, selectedPayee?.id));
    }
  }

  return (
    <>
      {selectedPayee ? (
        <RecipientHistoryScreen
          payee={selectedPayee}
          mode={mode}
          onBack={closePayee}
          onPayAgain={() => setLaunch({ kind: "payee", payee: selectedPayee })}
          onTransaction={(transactionId) =>
            router.push(
              buildTransactionDetailsHref({
                transactionId,
                mode,
                returnTo: sendMoneyUrl(mode, selectedPayee.id),
              }),
            )
          }
        />
      ) : (
        <PayeeListScreen
          payees={payees}
          onBack={() => router.push("/")}
          onEnterUpi={() => setLaunch({ kind: "upi-entry" })}
          onPayee={navigateToPayee}
        />
      )}

      {launch ? (
        <ScanPayFlow
          open
          scenario="success"
          mode={mode}
          merchantType="unclassified"
          launch={launch}
          onClose={closePaymentFlow}
        />
      ) : null}
    </>
  );
}

export function PayeeListScreen({
  payees,
  onBack,
  onEnterUpi,
  onPayee,
}: {
  payees: UpiPayee[];
  onBack: () => void;
  onEnterUpi: () => void;
  onPayee: (payee: UpiPayee) => void;
}) {
  return (
    <AppShell className="overflow-hidden bg-white">
      <header className="relative flex shrink-0 items-center justify-between px-page pb-3 pt-4">
        <BackNavigationButton onClick={onBack} ariaLabel="Back" />
        <h1 className="type-screen-title pointer-events-none absolute left-0 right-0 text-center text-ink">
          Pay to UPI ID
        </h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-2">
        <section className="animate-rise-in pt-1" style={staggerStyle(0)}>
          <button
            type="button"
            onClick={onEnterUpi}
            className="flex min-h-20 w-full items-center justify-between rounded-card bg-pine-primary p-card text-left text-white shadow-cta transition-transform active:scale-[0.98]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-white text-pine-primary shadow-soft"
                aria-hidden="true"
              >
                <AtIcon />
              </span>
              <span className="min-w-0">
                <span className="type-body block font-bold text-white!">
                  Enter UPI ID
                </span>
                <span className="mt-0.5 block text-caption text-white/80">
                  Pay to any UPI ID instantly
                </span>
              </span>
            </span>
            <ChevronIcon className="shrink-0 text-white/80" />
          </button>
        </section>

        <section className="mt-6 animate-rise-in" style={staggerStyle(1)}>
          <h2 className="type-section-title mb-3 text-ink">Recently Paid</h2>
          <div className="flex flex-col gap-3">
            {payees.map((payee, index) => (
              <button
                key={payee.id}
                type="button"
                onClick={() => onPayee(payee)}
                style={staggerStyle(index + 2)}
                className="animate-rise-in flex min-h-16 w-full items-center justify-between rounded-card border border-border-line bg-white p-card text-left shadow-card transition-transform active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <PayeeAvatar payee={payee} />
                  <span className="min-w-0">
                    <span className="type-body block truncate font-bold text-ink">
                      {payee.name}
                    </span>
                    <span className="type-body-secondary mt-0.5 block truncate">
                      {payee.upiId}
                    </span>
                  </span>
                </span>
                <ChevronIcon className="shrink-0 text-mint" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export function RecipientHistoryScreen({
  payee,
  mode,
  onBack,
  onPayAgain,
  onTransaction,
}: {
  payee: UpiPayee;
  mode: ScanPayMode;
  onBack: () => void;
  onPayAgain: () => void;
  onTransaction: (transactionId: string) => void;
}) {
  const historyVersion = useRecipientHistoryVersion();
  void historyVersion;
  const history = getPayeeHistory(payee.id, mode);
  const groups = groupHistory(history);

  return (
    <AppShell className="overflow-hidden bg-white">
      <header className="relative flex shrink-0 items-center px-page pb-2 pt-4">
        <BackNavigationButton onClick={onBack} ariaLabel="Back to recent payees" />
        <h1 className="type-screen-title pointer-events-none absolute left-0 right-0 text-center text-ink">
          Account
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-1">
        <section className="animate-rise-in flex flex-col items-center text-center">
          <PayeeAvatar payee={payee} large />
          <h2 className="type-section-title mt-3 text-ink">{payee.name}</h2>
          <p className="type-body-secondary mt-1">{payee.upiId}</p>
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {groups.map(([dateLabel, records], groupIndex) => (
            <section
              key={dateLabel}
              className="animate-rise-in"
              style={staggerStyle(groupIndex + 1)}
              aria-labelledby={`history-${groupIndex}`}
            >
              <h3
                id={`history-${groupIndex}`}
                className="type-body-secondary mb-2 font-bold text-pine-primary"
              >
                {dateLabel}
              </h3>
              <TransactionListCard
                items={records.map((record) => ({
                  id: record.transaction.transactionId,
                  title: payee.name,
                  subtitle: `${record.transaction.paymentMethod} | Ref ID: ${record.transaction.transactionId}`,
                  amountLabel: formatSignedINR(
                    record.transaction.amount,
                    "debit",
                  ),
                  metaLabel: formatTime(record.createdAt),
                  icon: <BenefitWalletIcon wallet="misc" />,
                }))}
                onSelect={(item) => onTransaction(item.id)}
              />
            </section>
          ))}
        </div>

        <AppIcon
          src={UPI_SETTINGS_ASSETS.poweredByUpi}
          alt="Powered by UPI"
          width={72}
          height={30}
          className="mx-auto mb-2 mt-auto h-auto w-16 pt-8"
        />
      </main>

      <footer className="shrink-0 rounded-t-bubble bg-white px-page pb-5 pt-4 shadow-drawer">
        <button type="button" className="btn-primary" onClick={onPayAgain}>
          Pay Again
        </button>
      </footer>
    </AppShell>
  );
}

function PayeeAvatar({ payee, large = false }: { payee: UpiPayee; large?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-pill bg-pine-primary font-display font-bold text-white shadow-icon ${
        large ? "h-20 w-20 text-title" : "h-11 w-11 text-body"
      }`}
      aria-hidden="true"
    >
      {payee.initials}
    </span>
  );
}

function AtIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveMode(
  requested: string | null,
  access: ReturnType<typeof useActivePersona>["persona"]["access"],
): ScanPayMode {
  if (requested === "pluspay" && access.products.plusPay) return "pluspay";
  if (requested === "benefits" && access.products.ebPlus) return "benefits";
  if (access.defaultProduct === "pluspay" && access.products.plusPay) {
    return "pluspay";
  }
  return access.products.ebPlus ? "benefits" : "pluspay";
}

function sendMoneyUrl(mode: ScanPayMode, payeeId?: string): string {
  const params = new URLSearchParams({ mode });
  if (payeeId) params.set("payee", payeeId);
  return `/send-money/?${params.toString()}`;
}

function groupHistory(
  records: RecipientPaymentRecord[],
): [string, RecipientPaymentRecord[]][] {
  const groups = new Map<string, RecipientPaymentRecord[]>();
  for (const record of records) {
    const label = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(record.createdAt));
    groups.set(label, [...(groups.get(label) ?? []), record]);
  }
  return [...groups.entries()];
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(value));
}
