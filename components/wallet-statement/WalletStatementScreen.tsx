"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { NativeMonthPicker } from "@/components/shared/NativeMonthPicker";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { TransactionIcon } from "@/components/transactions/TransactionIcon";
import { formatSignedINR } from "@/features/transactions/constants";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { useFinancialStateVersion } from "@/features/transactions/useFinancialState";
import { buildTransactionDetailsHref } from "@/features/transactions/navigation";
import {
  WALLET_STATEMENT_MAX_MONTH,
  filterWalletStatementTransactions,
  getWalletStatement,
  groupWalletStatementTransactions,
  monthLabel,
} from "@/features/wallet-statement/constants";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function WalletStatementScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { personaId } = useActivePersona();
  const financialVersion = useFinancialStateVersion();
  const statement = useMemo(
    () => {
      void financialVersion;
      return getWalletStatement(
        searchParams.get("wallet"),
        personaId,
        financialVersion !== null,
      );
    },
    [financialVersion, personaId, searchParams],
  );
  const [selectedMonth, setSelectedMonth] = useState<string | null>(() => {
    const requestedMonth = searchParams.get("month");
    return requestedMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth)
      ? requestedMonth
      : null;
  });

  const visibleTransactions = useMemo(
    () => filterWalletStatementTransactions(statement.transactions, selectedMonth),
    [selectedMonth, statement.transactions],
  );
  const groups = useMemo(
    () => groupWalletStatementTransactions(visibleTransactions),
    [visibleTransactions],
  );

  return (
    <AppShell variant="bg" className="overflow-hidden">
      <ScreenHeader
        title={`${statement.label} Statement`}
        onBack={() => router.back()}
        className="bg-bg pb-1 pt-3"
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-2">
        <div className="flex min-h-11 items-center gap-2" aria-label="Statement filters">
          <button
            type="button"
            aria-pressed={selectedMonth === null}
            onClick={() => setSelectedMonth(null)}
            className={`min-h-11 rounded-pill px-4 text-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-primary ${
              selectedMonth === null
                ? "bg-pine-primary text-white"
                : "border border-border-muted bg-white text-ink-secondary"
            }`}
          >
            All
          </button>

          <NativeMonthPicker
            value={selectedMonth ?? ""}
            onChange={setSelectedMonth}
            label={`Choose statement month. Available from April to August 2026.${
              selectedMonth ? ` Currently ${monthLabel(selectedMonth)}.` : " Showing all months."
            }`}
            className={selectedMonth ? "outline outline-2 outline-pine-primary" : ""}
          >
            <CalendarIcon />
          </NativeMonthPicker>

          {selectedMonth ? (
            <p className="type-body-secondary truncate font-bold" aria-live="polite">
              {monthLabel(selectedMonth)}
            </p>
          ) : null}
        </div>

        {groups.length === 0 ? (
          <section className="mt-4 rounded-card border border-border-line bg-white p-card py-10 text-center shadow-card">
            <h2 className="type-section-title text-pine">No transactions found</h2>
            <p className="mt-1 type-body-secondary">
              There is no {statement.label.toLowerCase()} activity in {monthLabel(selectedMonth ?? WALLET_STATEMENT_MAX_MONTH)}.
            </p>
          </section>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {groups.map((group) => (
              <section key={group.monthKey} className="flex flex-col gap-2">
                <h2 className="type-section-title text-pine-primary">{group.label}</h2>
                <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
                  {group.transactions.map((transaction, index) => (
                    <Link
                      key={transaction.id}
                      href={buildTransactionDetailsHref({
                        transactionId: transaction.id,
                        mode: "benefits",
                        returnTo: `/wallet-statement/?wallet=${statement.id}${
                          selectedMonth ? `&month=${selectedMonth}` : ""
                        }`,
                      })}
                      className={`flex min-h-11 items-center gap-3 px-card py-3 transition-colors hover:bg-surface ${
                        index < group.transactions.length - 1 ? "border-b border-border-soft" : ""
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-success-tint text-pine-primary">
                        <TransactionIcon icon={transaction.icon} size={18} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-body-sm font-bold text-ink">
                          {transaction.merchant}
                        </span>
                        <span className="truncate text-caption text-ink-secondary">
                          {transaction.paymentMethod} | Ref ID: {transaction.refId}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        <span
                          className={`text-body-sm font-bold tabular-nums ${
                            transaction.type === "credit" ? "text-success" : "text-ink"
                          }`}
                        >
                          {formatSignedINR(transaction.amount, transaction.type)}
                        </span>
                        <span className="text-caption text-ink-secondary">
                          {dateFormatter.format(new Date(`${transaction.postedOn}T00:00:00Z`))}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
