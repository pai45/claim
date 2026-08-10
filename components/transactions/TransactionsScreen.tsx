"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { EbBottomNav } from "@/components/shared/EbBottomNav";
import { NativeMonthPicker } from "@/components/shared/NativeMonthPicker";
import { TransactionIcon } from "@/components/transactions/TransactionIcon";
import { WalletFilterDropdown } from "@/components/transactions/WalletFilterDropdown";
import {
  CategoryGlyph,
  MerchantSpendingChart,
  SpendingChart,
  WeeklySpendingChart,
} from "@/components/transactions/SpendingChart";
import {
  ANALYTICS_VIEW_PILLS,
  ANALYTICS_WALLETS,
  HISTORY_TABS,
  TRANSACTION_MAX_MONTH,
  TRANSACTION_MONTHS,
  WALLET_FILTER_OPTIONS,
  filterTransactionsByMonth,
  filterTransactionsByWallet,
  formatINR,
  formatSignedINR,
  getAnalyticsData,
  getTransactionItems,
  groupTransactions,
  isTransactionWallet,
  type AnalyticsViewId,
  type AnalyticsWalletId,
  type HistoryTabId,
  type TransactionWalletFilterId,
} from "@/features/transactions/constants";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { colors } from "@/lib/ui/colors";
import { useFinancialStateVersion } from "@/features/transactions/financialState";
import { resolveTransactionMode } from "@/features/transactions/mode";
import {
  filterPlusPayTransactionsByMonth,
  getPlusPayTransactionItems,
  groupPlusPayTransactions,
  usePlusPayHistoryVersion,
} from "@/features/transactions/plusPayHistory";

export function TransactionsScreen() {
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const mode = resolveTransactionMode(searchParams.get("mode"), persona.access);

  return mode === "pluspay" ? (
    <PlusPayTransactionsScreen />
  ) : (
    <BenefitsTransactionsScreen />
  );
}

function BenefitsTransactionsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { personaId } = useActivePersona();
  const financialVersion = useFinancialStateVersion();
  const [tab, setTab] = useState<HistoryTabId>(
    searchParams.get("tab") === "analytics" ? "analytics" : "transactions",
  );
  const [selectedWallet, setSelectedWallet] =
    useState<TransactionWalletFilterId>(() => {
      const requestedWallet = searchParams.get("wallet");
      return isTransactionWallet(requestedWallet) ? requestedWallet : "meal";
    });
  const [analyticsView, setAnalyticsView] =
    useState<AnalyticsViewId>(() => {
      const requestedView = searchParams.get("view");
      return requestedView === "category" || requestedView === "merchants"
        ? requestedView
        : "trends";
    });
  const [selectedMonth, setSelectedMonth] = useState(TRANSACTION_MAX_MONTH);

  const allTransactions = useMemo(
    () => {
      void financialVersion;
      return getTransactionItems(personaId, financialVersion !== null);
    },
    [financialVersion, personaId],
  );

  const filteredTransactions = useMemo(
    () =>
      filterTransactionsByMonth(
        filterTransactionsByWallet(allTransactions, selectedWallet),
        selectedMonth,
      ),
    [allTransactions, selectedMonth, selectedWallet],
  );

  const groups = useMemo(
    () => groupTransactions(filteredTransactions),
    [filteredTransactions],
  );

  const analytics = useMemo(
    () => {
      void financialVersion;
      return getAnalyticsData(
        personaId,
        selectedWallet,
        selectedMonth,
        financialVersion !== null,
      );
    },
    [financialVersion, personaId, selectedMonth, selectedWallet],
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
            monthKey={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        ) : (
          <AnalyticsPanel
            view={analyticsView}
            onViewChange={setAnalyticsView}
            wallet={selectedWallet}
            onWalletChange={setSelectedWallet}
            analytics={analytics}
            monthKey={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        )}
      </main>

      <EbBottomNav active="transactions" />
    </AppShell>
  );
}

function PlusPayTransactionsScreen() {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const historyVersion = usePlusPayHistoryVersion();
  const [selectedMonth, setSelectedMonth] = useState(TRANSACTION_MAX_MONTH);

  const transactions = useMemo(() => {
    void historyVersion;
    return getPlusPayTransactionItems(personaId, historyVersion !== null);
  }, [historyVersion, personaId]);
  const visibleTransactions = useMemo(
    () => filterPlusPayTransactionsByMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );
  const groups = useMemo(
    () => groupPlusPayTransactions(visibleTransactions),
    [visibleTransactions],
  );
  const monthLabel =
    TRANSACTION_MONTHS.find((month) => month.key === selectedMonth)?.label ??
    selectedMonth;

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Transaction History"
        eyebrow="PlusPay"
        onBack={() => router.push("/?mode=pluspay")}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <NativeMonthPicker
              value={selectedMonth}
              onChange={setSelectedMonth}
              label={`Choose PlusPay transaction month, currently ${monthLabel}. Available from April to August 2026.`}
              className="h-11 w-11 shrink-0"
            >
              <CalendarIcon />
            </NativeMonthPicker>
            <span className="type-body-secondary truncate font-bold">
              {monthLabel}
            </span>
          </div>

          {visibleTransactions.length === 0 ? (
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
              <h2 className="type-section-title mb-1 text-ink">
                No transactions yet
              </h2>
              <p className="type-body-secondary mb-5 max-w-[260px]">
                No PlusPay activity in {monthLabel}.
              </p>
              <Link
                href="/?mode=pluspay"
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
                  {section.items.map((txn, index) => (
                    <Link
                      key={txn.id}
                      href={`/transaction-details/?id=${encodeURIComponent(txn.id)}&mode=pluspay`}
                      style={staggerStyle(index)}
                      className={`animate-rise-in flex min-h-11 items-center gap-3 px-page py-3.5 transition-colors hover:bg-surface ${
                        index < section.items.length - 1
                          ? "border-b border-border-line"
                          : ""
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
                          ANQ | Ref ID: {txn.refId}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <p className="text-body-sm font-bold text-ink">
                          {formatSignedINR(txn.amount, txn.type)}
                        </p>
                        <p className="text-caption text-ink-secondary">
                          {txn.dateLabel}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <EbBottomNav active="transactions" variant="pluspay" />
    </AppShell>
  );
}

function TransactionsPanel({
  selectedWallet,
  onSelectWallet,
  groups,
  totalTransactions,
  monthKey,
  onSelectMonth,
}: {
  selectedWallet: TransactionWalletFilterId;
  onSelectWallet: (wallet: TransactionWalletFilterId) => void;
  groups: ReturnType<typeof groupTransactions>;
  totalTransactions: number;
  monthKey: string;
  onSelectMonth: (monthKey: string) => void;
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
        <NativeMonthPicker
          value={monthKey}
          onChange={onSelectMonth}
          label={`Choose transaction month, currently ${TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label}. Available from April to August 2026.`}
          className="h-11 w-11 shrink-0"
        >
          <CalendarIcon />
        </NativeMonthPicker>
        <span className="type-body-secondary truncate font-bold">
          {TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label}
        </span>
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
            No wallet activity for {currentWalletOption?.label ?? "this wallet"} in {TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label}.
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
                    href={`/transaction-details/?id=${encodeURIComponent(txn.id)}&mode=benefits`}
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
  monthKey,
  onSelectMonth,
}: {
  view: AnalyticsViewId;
  onViewChange: (view: AnalyticsViewId) => void;
  wallet: AnalyticsWalletId;
  onWalletChange: (wallet: AnalyticsWalletId) => void;
  analytics: ReturnType<typeof getAnalyticsData>;
  monthKey: string;
  onSelectMonth: (monthKey: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ANALYTICS_WALLETS.map((item) => {
          const active = wallet === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onWalletChange(item.id)}
              aria-pressed={active}
              className={`flex min-h-14 min-w-[132px] shrink-0 items-center gap-2 rounded-control border px-3 py-2 text-left transition-colors ${item.toneClass} ${
                active ? "border-pine-primary" : "border-border-line"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white/70 ${item.iconClass}`}
              >
                <WalletGlyph id={item.id} />
              </span>
              <span className={`text-caption font-bold leading-4 ${item.iconClass}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

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

      {view === "trends" ? (
        <>
          <AnalyticsSectionHeader
            title="Spending Trends"
            monthKey={monthKey}
            monthLabel={analytics.monthShortLabel}
            onSelectMonth={onSelectMonth}
          />

          {analytics.totalSpent === 0 ? (
            <AnalyticsEmptyState />
          ) : (
            <>
              <section className="rounded-card border border-border-line bg-white p-card shadow-card">
                <WeeklySpendingChart
                  weeks={analytics.weeks}
                  monthLabel={analytics.monthLabel}
                />
              </section>

              <section className="grid grid-cols-2 gap-2" aria-label="Spending trend summary">
                <TrendMetric
                  icon={<AverageIcon />}
                  value={formatINR(analytics.averageWeeklySpend)}
                  label="Avg Weekly Spend"
                />
                <TrendMetric
                  icon={<RewardsIcon />}
                  value={formatINR(analytics.rewardsEarned)}
                  label="Rewards Earned"
                />
              </section>
            </>
          )}
        </>
      ) : view === "category" ? (
        <>
          <AnalyticsSectionHeader
            title="Spending by Category"
            monthKey={monthKey}
            monthLabel={analytics.monthShortLabel}
            onSelectMonth={onSelectMonth}
          />

          {analytics.categories.length === 0 ? (
            <AnalyticsEmptyState />
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
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-white ${category.toneClass}`}>
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
        <>
          <AnalyticsSectionHeader
            title="Spending by Merchants"
            monthKey={monthKey}
            monthLabel={analytics.monthShortLabel}
            onSelectMonth={onSelectMonth}
          />

          {analytics.topMerchant === null ? (
            <AnalyticsEmptyState />
          ) : (
            <>
              <TopMerchantCard merchant={analytics.topMerchant} />
              <section className="rounded-card border border-border-line bg-white p-card shadow-card">
                <h3 className="type-section-title text-ink">Top Merchants</h3>
                <div className="mt-3">
                  <MerchantSpendingChart merchants={analytics.merchants} />
                </div>

                <ul className="mt-4 divide-y divide-border-line">
                  {analytics.merchants.map((merchant) => (
                    <li key={merchant.id} className="flex items-center gap-3 py-3.5 first:pt-2 last:pb-0">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control font-display text-body font-bold ${merchant.toneClass} ${merchant.textClass}`}>
                        {merchant.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-bold text-ink">
                          {merchant.name}
                        </span>
                        <span className="block text-caption text-ink-secondary">
                          {merchant.transactionCount} {merchant.transactionCount === 1 ? "Transaction" : "Transactions"}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-caption font-bold text-warning">
                          <MerchantRewardIcon />
                          +{merchant.rewardsEarned} pts
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <strong className="block text-body-sm font-bold text-ink tabular-nums">
                          {formatINR(merchant.amount)}
                        </strong>
                        <span className="block text-caption text-ink-tertiary tabular-nums">
                          Avg. {formatINR(merchant.averageSpend)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function AnalyticsSectionHeader({
  title,
  monthKey,
  monthLabel,
  onSelectMonth,
}: {
  title: string;
  monthKey: string;
  monthLabel: string;
  onSelectMonth: (monthKey: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="type-section-title text-pine-primary">{title}</h2>
      <NativeMonthPicker
        value={monthKey}
        onChange={onSelectMonth}
        label={`Choose analytics month, currently ${monthLabel}. Available from April to August 2026.`}
        className="gap-1 bg-white px-3 text-body-sm font-bold text-ink shadow-card hover:bg-surface-tint"
      >
        <span className="pointer-events-none flex items-center gap-1">
          {monthLabel}
          <ChevronDownIcon color={colors.ink} />
        </span>
      </NativeMonthPicker>
    </div>
  );
}

function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border-line bg-white p-card py-10 text-center shadow-card">
      <p className="type-body-secondary">
        No spending data available for this period.
      </p>
    </div>
  );
}

function TopMerchantCard({
  merchant,
}: {
  merchant: NonNullable<ReturnType<typeof getAnalyticsData>["topMerchant"]>;
}) {
  return (
    <article className="rounded-card border border-success-border bg-success-soft p-card shadow-card">
      <div className="flex items-center gap-2 text-body-sm text-pine">
        <StoreIcon />
        <span>Top Merchant This Month</span>
      </div>
      <h3 className="mt-2 type-amount text-ink">{merchant.name}</h3>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <MerchantMetric value={formatINR(merchant.amount)} label="Total Spends" />
        <MerchantMetric
          value={`${merchant.transactionCount} ${merchant.transactionCount === 1 ? "txn" : "txns"}`}
          label="Transactions"
        />
        <MerchantMetric
          value={`+${merchant.rewardsEarned} pts`}
          label="Rewards"
          icon={<MerchantRewardIcon />}
          warning
        />
      </div>
    </article>
  );
}

function MerchantMetric({
  value,
  label,
  icon,
  warning = false,
}: {
  value: string;
  label: string;
  icon?: ReactNode;
  warning?: boolean;
}) {
  return (
    <span className="min-w-0">
      <strong className={`flex items-center gap-1 truncate text-body-sm font-bold tabular-nums ${warning ? "text-warning" : "text-ink"}`}>
        {icon}
        {value}
      </strong>
      <span className="block truncate text-caption text-ink-secondary">{label}</span>
    </span>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10h16M6 10v9h12v-9M5 5h14l1 5a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0l1-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MerchantRewardIcon() {
  return (
    <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5h8v4a4 4 0 0 1-8 0V5ZM10 14h4M12 14v4M8 19h8M8 7H5v2a3 3 0 0 0 3 3M16 7h3v2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendMetric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <article className="flex min-h-16 items-center gap-3 rounded-card border border-border-line bg-white p-3 shadow-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-tint text-pine-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block truncate font-display text-body-sm font-bold text-ink tabular-nums">
          {value}
        </strong>
        <span className="block truncate text-caption text-ink-secondary">{label}</span>
      </span>
    </article>
  );
}

function AverageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19h14M7 19v-7h10v7M9 9l3-4 3 4M12 5v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RewardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5h8v4a4 4 0 0 1-8 0V5ZM10 14h4M12 14v4M8 19h8M8 7H5v2a3 3 0 0 0 3 3M16 7h3v2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function WalletGlyph({ id }: { id: AnalyticsWalletId }) {
  if (id === "meal") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 4v16M8 8h3M16 4v7c0 2-1 3-2.5 3H16v6"
          stroke="currentColor"
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
          stroke="currentColor"
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
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 4v4h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
