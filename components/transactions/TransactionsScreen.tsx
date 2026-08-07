"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { EbBottomNav } from "@/components/shared/EbBottomNav";
import { TransactionIcon } from "@/components/transactions/TransactionIcon";
import { WalletFilterDropdown } from "@/components/transactions/WalletFilterDropdown";
import {
  CategoryGlyph,
  SpendingChart,
} from "@/components/transactions/SpendingChart";
import {
  ANALYTICS_VIEW_PILLS,
  ANALYTICS_WALLETS,
  HISTORY_TABS,
  WALLET_FILTER_OPTIONS,
  filterTransactionsByWallet,
  formatINR,
  formatSignedINR,
  getAnalyticsData,
  getTransactionItems,
  groupTransactions,
  type AnalyticsViewId,
  type AnalyticsWalletId,
  type HistoryTabId,
  type TransactionWalletFilterId,
} from "@/features/transactions/constants";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { colors } from "@/lib/ui/colors";

export function TransactionsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { personaId } = useActivePersona();
  const [tab, setTab] = useState<HistoryTabId>(
    searchParams.get("tab") === "analytics" ? "analytics" : "transactions",
  );
  const [selectedWallet, setSelectedWallet] =
    useState<TransactionWalletFilterId>("meal");
  const [analyticsView, setAnalyticsView] =
    useState<AnalyticsViewId>("category");
  const [analyticsWallet, setAnalyticsWallet] =
    useState<AnalyticsWalletId>("meal");

  const allTransactions = useMemo(
    () => getTransactionItems(personaId),
    [personaId],
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsByWallet(allTransactions, selectedWallet),
    [allTransactions, selectedWallet],
  );

  const groups = useMemo(
    () => groupTransactions(filteredTransactions),
    [filteredTransactions],
  );

  const analytics = useMemo(
    () => getAnalyticsData(personaId),
    [personaId],
  );

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Transaction History"
        onBack={() => router.push("/")}
      />

      <div className="shrink-0 border-b border-border-tab bg-white">
        <div
          className="flex items-end px-page"
          role="tablist"
          aria-label="Transaction views"
        >
          {HISTORY_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className="flex min-h-11 flex-1 items-center justify-center px-2 pt-2"
              >
                <span className="flex w-full flex-col items-center gap-2">
                  <span
                    className={`type-body text-center ${
                      active
                        ? "font-bold text-pine-primary"
                        : "font-normal text-ink-secondary"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`h-0.5 w-full rounded-pill ${
                      active ? "bg-pine-primary" : "bg-transparent"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-4">
        {tab === "transactions" ? (
          <TransactionsPanel
            selectedWallet={selectedWallet}
            onSelectWallet={setSelectedWallet}
            groups={groups}
            totalTransactions={filteredTransactions.length}
          />
        ) : (
          <AnalyticsPanel
            view={analyticsView}
            onViewChange={setAnalyticsView}
            wallet={analyticsWallet}
            onWalletChange={setAnalyticsWallet}
            analytics={analytics}
          />
        )}
      </main>

      <EbBottomNav active="transactions" />
    </AppShell>
  );
}

function TransactionsPanel({
  selectedWallet,
  onSelectWallet,
  groups,
  totalTransactions,
}: {
  selectedWallet: TransactionWalletFilterId;
  onSelectWallet: (wallet: TransactionWalletFilterId) => void;
  groups: ReturnType<typeof groupTransactions>;
  totalTransactions: number;
}) {
  const currentWalletOption = WALLET_FILTER_OPTIONS.find(
    (o) => o.id === selectedWallet,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 overflow-visible">
        <WalletFilterDropdown
          selectedWallet={selectedWallet}
          onSelectWallet={onSelectWallet}
        />
        <button
          type="button"
          aria-label="Filter by date"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-muted transition-colors hover:bg-surface-tint"
        >
          <CalendarIcon />
        </button>
        <button
          type="button"
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-border-muted bg-white px-3 text-body-sm font-bold text-pine-primary transition-colors hover:bg-surface-tint"
        >
          <UpiBoltIcon />
          UPI Transactions
        </button>
      </div>

      {totalTransactions === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-border-line bg-white p-card py-10 text-center shadow-card">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-subtle">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h3 className="type-section-title mb-1 text-ink">No transactions yet</h3>
          <p className="type-body-secondary mb-5 max-w-[260px]">
            No transactions found for {currentWalletOption?.label ?? "this wallet"}. Make a spend to see activity here.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex h-auto min-h-11 items-center gap-2 px-6 py-2.5 text-sm font-semibold"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        groups.map((section) => (
          <section key={section.group} className="flex flex-col gap-2">
            <h2 className="type-section-title text-pine-primary">
              {section.label}
            </h2>
            <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
              {section.items.map((txn, index) => {
                const isLast = index === section.items.length - 1;
                return (
                  <Link
                    key={txn.id}
                    href={`/transaction-details/?id=${encodeURIComponent(txn.id)}`}
                    style={staggerStyle(index)}
                    className={`animate-rise-in flex min-h-11 items-center gap-3 px-page py-3.5 transition-colors hover:bg-surface ${
                      !isLast ? "border-b border-border-line" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-tint">
                      <TransactionIcon icon={txn.icon} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <h3 className="type-body truncate font-bold text-ink">
                        {txn.merchant}
                      </h3>
                      <p className="truncate text-caption text-ink-secondary">
                        {txn.paymentMethod} | Ref ID: {txn.refId}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <p
                        className={`text-body-sm font-bold ${
                          txn.type === "credit" ? "text-success" : "text-ink"
                        }`}
                      >
                        {formatSignedINR(txn.amount, txn.type)}
                      </p>
                      <p className="text-caption text-ink-secondary">
                        {txn.dateLabel}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function AnalyticsPanel({
  view,
  onViewChange,
  wallet,
  onWalletChange,
  analytics,
}: {
  view: AnalyticsViewId;
  onViewChange: (view: AnalyticsViewId) => void;
  wallet: AnalyticsWalletId;
  onWalletChange: (wallet: AnalyticsWalletId) => void;
  analytics: ReturnType<typeof getAnalyticsData>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Analytics views"
      >
        {ANALYTICS_VIEW_PILLS.map((pill) => {
          const active = view === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onViewChange(pill.id)}
              className={`min-h-11 shrink-0 rounded-pill px-4 text-body-sm font-bold ${
                active
                  ? "bg-pine-primary text-white"
                  : "border border-border-muted bg-white text-ink-secondary"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ANALYTICS_WALLETS.map((item) => {
          const active = wallet === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onWalletChange(item.id)}
              className={`flex min-h-14 min-w-[132px] shrink-0 items-center gap-2 rounded-card px-3 py-2 text-left ${
                active ? "ring-2 ring-pine-primary" : ""
              }`}
              style={{ background: item.bg }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-control bg-white/70"
                style={{ color: item.ink }}
              >
                <WalletGlyph id={item.id} color={item.ink} />
              </span>
              <span
                className="text-caption font-bold leading-4"
                style={{ color: item.ink }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {view === "category" ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="type-section-title text-pine-primary">
              Spending by Category
            </h2>
            <button
              type="button"
              className="flex min-h-11 items-center gap-1 text-body-sm font-bold text-ink"
            >
              {analytics.monthLabel}
              <ChevronDownIcon color={colors.ink} />
            </button>
          </div>

          {analytics.categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-card border border-border-line bg-white p-card py-10 shadow-card text-center">
              <p className="type-body-secondary">
                No spending data available for this period.
              </p>
            </div>
          ) : (
            <section className="overflow-hidden rounded-card border border-border-line bg-white p-card shadow-card">
              <SpendingChart
                categories={analytics.categories}
                totalLabel={formatINR(analytics.totalSpent)}
                totalSubLabel="Total Spent"
              />

              <ul className="mt-2 divide-y divide-border-line">
                {analytics.categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center gap-3 py-3.5 first:pt-2 last:pb-0"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control"
                      style={{ background: category.color }}
                    >
                      <CategoryGlyph icon={category.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-body font-bold text-ink">
                        {category.name}
                      </p>
                      <p className="text-caption text-ink-secondary">
                        {category.transactionCount} Transactions
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-body-sm font-bold text-ink tabular-nums">
                        {formatINR(category.amount)}
                      </p>
                      <p className="text-caption font-bold text-ink-secondary tabular-nums">
                        {category.percent}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <div className="rounded-card border border-border-line bg-white p-card shadow-card">
          <p className="type-body-secondary py-10 text-center">
            {view === "trends"
              ? "Trends analytics coming soon."
              : "Merchant analytics coming soon."}
          </p>
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke={colors.ink}
        strokeWidth="1.7"
      />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke={colors.ink}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UpiBoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        fill="#FF6B35"
        stroke="#097A4B"
        strokeWidth="0.6"
      />
    </svg>
  );
}

function WalletGlyph({
  id,
  color,
}: {
  id: AnalyticsWalletId;
  color: string;
}) {
  if (id === "meal") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 4v16M8 8h3M16 4v7c0 2-1 3-2.5 3H16v6"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "fuel") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 19V7.5A1.5 1.5 0 0 1 7.5 6h5A1.5 1.5 0 0 1 14 7.5V19M5 19h11M14 10h2.5a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V10.5L19 8"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 1 0 2.3-5.6"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 4v4h4"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
