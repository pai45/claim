import { formatINR as formatClaimsINR } from "@/features/claims-history/constants";
import {
  ALL_BENEFIT_CLAIMS,
  type BenefitClaimItem,
} from "@/features/dashboard/benefitClaims";
import { getActivePersonaId } from "@/features/persona/store";
import type { PersonaId } from "@/features/persona/types";
import {
  EMPLOYER_BENEFITS_CATALOG,
  type PolicyTabId,
} from "@/features/policy/constants";
import { colors } from "@/lib/ui/colors";

export type TransactionWallet = PolicyTabId;

export type TransactionIconId =
  | "bag"
  | "food"
  | "car"
  | "money"
  | "fuel"
  | "gift";

export type TransactionItem = {
  id: string;
  merchant: string;
  paymentMethod: string;
  refId: string;
  amount: number;
  /** Credits load a wallet; debits are approved claims deducted from it. */
  type: "debit" | "credit";
  dateLabel: string;
  dateTime: string;
  postedOn: string;
  monthKey: string;
  wallet: TransactionWallet;
  icon: TransactionIconId;
  category: string;
  location: string;
  cardMasked: string;
  walletName: string;
  paymentMode: string;
  transactionId: string;
  referenceNumber: string;
};

export type AnalyticsWalletId = TransactionWallet;
export type TransactionWalletFilterId = TransactionWallet;

export type WalletFilterOption = {
  id: TransactionWalletFilterId;
  label: string;
};

export const WALLET_FILTER_OPTIONS: readonly WalletFilterOption[] =
  EMPLOYER_BENEFITS_CATALOG.benefits.map((benefit) => ({
    id: benefit.id,
    label: benefit.display.label,
  }));

export type TransactionMonth = {
  key: string;
  label: string;
  shortLabel: string;
};

export const TRANSACTION_MONTHS: readonly TransactionMonth[] = [
  { key: "2026-04", label: "April 2026", shortLabel: "Apr" },
  { key: "2026-05", label: "May 2026", shortLabel: "May" },
  { key: "2026-06", label: "June 2026", shortLabel: "Jun" },
  { key: "2026-07", label: "July 2026", shortLabel: "Jul" },
  { key: "2026-08", label: "August 2026", shortLabel: "Aug" },
];

export type AnalyticsCategory = {
  id: string;
  name: string;
  transactionCount: number;
  amount: number;
  percent: number;
  color: string;
  icon: "groceries" | "entertainment" | "dining" | "shopping" | "travel" | "bills";
};

export const HISTORY_TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "analytics", label: "Analytics" },
] as const;

export type HistoryTabId = (typeof HISTORY_TABS)[number]["id"];

export const ANALYTICS_VIEW_PILLS = [
  { id: "trends", label: "Trends" },
  { id: "category", label: "Category" },
  { id: "merchants", label: "Merchants" },
] as const;

export type AnalyticsViewId = (typeof ANALYTICS_VIEW_PILLS)[number]["id"];

export const ANALYTICS_WALLETS = EMPLOYER_BENEFITS_CATALOG.benefits.map(
  (benefit) => ({
    id: benefit.id,
    label: benefit.display.label,
    bg: benefit.display.iconBg,
    ink: benefit.display.iconTone,
  }),
);

const ICON_BY_WALLET: Record<TransactionWallet, TransactionIconId> = {
  meal: "food",
  gift: "gift",
  fuel: "fuel",
  mobile: "money",
  driver: "car",
  books: "bag",
  professional: "bag",
};

const CATEGORY_ICON: Record<TransactionWallet, AnalyticsCategory["icon"]> = {
  meal: "dining",
  gift: "shopping",
  fuel: "travel",
  mobile: "bills",
  driver: "travel",
  books: "shopping",
  professional: "bills",
};

function claimWallet(claim: BenefitClaimItem): TransactionWallet {
  const title = `${claim.category} ${claim.title}`.toLowerCase();
  if (title.includes("fuel") || title.includes("petrol") || title.includes("tyre") || title.includes("service")) return "fuel";
  if (title.includes("mobile") || title.includes("airtel") || title.includes("jio") || title.includes("internet")) return "mobile";
  if (title.includes("driver salary")) return "driver";
  if (title.includes("book") || title.includes("kindle") || title.includes("crossword") || title.includes("periodical")) return "books";
  if (title.includes("professional") || title.includes("course") || title.includes("certificate") || title.includes("learning")) return "professional";
  if (title.includes("meal") || title.includes("food")) return "meal";
  return "gift";
}

function transactionSequence(id: string): string {
  return id.replace(/\D/g, "").padStart(5, "0").slice(-5);
}

function openingTransaction(
  wallet: TransactionWallet,
  label: string,
  allocation: number,
  index: number,
): TransactionItem {
  const sequence = String(index + 1).padStart(5, "0");
  return {
    id: `txn-${wallet}-opening-load`,
    merchant: "Annual wallet load",
    paymentMethod: "Employer funding",
    refId: `LOAD-${sequence}`,
    amount: allocation,
    type: "credit",
    dateLabel: "01 Apr",
    dateTime: "01 April 2026 at 09:00 am",
    postedOn: "2026-04-01",
    monthKey: "2026-04",
    wallet,
    icon: "money",
    category: "Wallet Load",
    location: "Pine Labs Benefits",
    cardMasked: "Employer benefits account",
    walletName: label,
    paymentMode: "Wallet Load",
    transactionId: `TXN20260401${sequence}`,
    referenceNumber: `FY2627-${wallet.toUpperCase()}-LOAD`,
  };
}

function claimTransaction(claim: BenefitClaimItem): TransactionItem {
  const wallet = claimWallet(claim);
  const benefit = EMPLOYER_BENEFITS_CATALOG.benefits.find(
    (item) => item.id === wallet,
  )!;
  const sequence = transactionSequence(claim.id);
  const merchant =
    claim.id === "CLM-43872" ? "Amazon" : claim.title.split(" - ")[0];
  return {
    id: claim.id === "CLM-43872" ? "txn-amazon" : `txn-${claim.id.toLowerCase()}`,
    merchant,
    paymentMethod: "Approved claim",
    refId: claim.id,
    amount: claim.amount,
    type: "debit",
    dateLabel: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${claim.submittedOn}T00:00:00Z`)),
    dateTime: `${claim.date} at 06:00 pm`,
    postedOn: claim.submittedOn,
    monthKey: claim.submittedOn.slice(0, 7),
    wallet,
    icon: ICON_BY_WALLET[wallet],
    category: claim.category,
    location: "Benefits reimbursement",
    cardMasked: "Employee benefits account",
    walletName: benefit.display.label,
    paymentMode: "Claim Reimbursement",
    transactionId: `TXN2026${sequence}`,
    referenceNumber: claim.id,
  };
}

const OPENING_LOADS = EMPLOYER_BENEFITS_CATALOG.benefits.map(
  (benefit, index) =>
    openingTransaction(
      benefit.id,
      benefit.display.label,
      benefit.balance.allocation,
      index,
    ),
);

const APPROVED_CLAIM_DEBITS = ALL_BENEFIT_CLAIMS.filter(
  (claim) => claim.status === "Approved",
).map(claimTransaction);

export const TRANSACTION_ITEMS: TransactionItem[] = [
  ...OPENING_LOADS,
  ...APPROVED_CLAIM_DEBITS,
].sort((left, right) => {
  const dateOrder = right.postedOn.localeCompare(left.postedOn);
  return dateOrder === 0 ? left.id.localeCompare(right.id) : dateOrder;
});

export function getTransactionItems(personaId?: PersonaId): TransactionItem[] {
  const activePersona = personaId ?? getActivePersonaId();
  return activePersona === "new_user" ? [] : TRANSACTION_ITEMS;
}

export function filterTransactionsByWallet(
  items: TransactionItem[],
  walletId: TransactionWalletFilterId,
): TransactionItem[] {
  return items.filter((item) => item.wallet === walletId);
}

export function filterTransactionsByMonth(
  items: TransactionItem[],
  monthKey: string,
): TransactionItem[] {
  return items.filter((item) => item.monthKey === monthKey);
}

export function getWalletLedgerSummary(
  items: TransactionItem[],
  walletId: TransactionWalletFilterId,
  monthKey: string,
): {
  openingBalance: number;
  credits: number;
  debits: number;
  closingBalance: number;
} {
  const walletItems = filterTransactionsByWallet(items, walletId);
  const beforeMonth = walletItems.filter((item) => item.monthKey < monthKey);
  const inMonth = walletItems.filter((item) => item.monthKey === monthKey);
  const net = (rows: TransactionItem[]) =>
    rows.reduce(
      (sum, item) => sum + (item.type === "credit" ? item.amount : -item.amount),
      0,
    );
  const credits = inMonth.reduce(
    (sum, item) => sum + (item.type === "credit" ? item.amount : 0),
    0,
  );
  const debits = inMonth.reduce(
    (sum, item) => sum + (item.type === "debit" ? item.amount : 0),
    0,
  );
  const openingBalance = net(beforeMonth);
  return {
    openingBalance,
    credits,
    debits,
    closingBalance: openingBalance + credits - debits,
  };
}

export function getAnalyticsData(
  personaId?: PersonaId,
  walletId: AnalyticsWalletId = "meal",
  monthKey = "2026-07",
): {
  totalSpent: number;
  monthLabel: string;
  categories: AnalyticsCategory[];
} {
  const items = filterTransactionsByMonth(
    filterTransactionsByWallet(getTransactionItems(personaId), walletId),
    monthKey,
  ).filter((item) => item.type === "debit");
  const totalSpent = items.reduce((sum, item) => sum + item.amount, 0);
  const grouped = new Map<string, TransactionItem[]>();
  for (const item of items) {
    grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
  }
  const palette = [
    colors.pinePrimary,
    colors.success,
    colors.warning,
    colors.pine,
    colors.mint,
  ];
  const categories = [...grouped.entries()].map(([name, rows], index) => {
    const amount = rows.reduce((sum, row) => sum + row.amount, 0);
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      transactionCount: rows.length,
      amount,
      percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      color: palette[index % palette.length],
      icon: CATEGORY_ICON[walletId],
    };
  });
  return {
    totalSpent,
    monthLabel:
      TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label ?? monthKey,
    categories,
  };
}

export function formatINR(amount: number): string {
  return formatClaimsINR(amount);
}

export function formatSignedINR(
  amount: number,
  type: TransactionItem["type"],
): string {
  const formatted = formatINR(amount);
  return type === "credit" ? `+ ${formatted}` : `- ${formatted}`;
}

export function getTransaction(
  id: string,
  personaId?: PersonaId,
): TransactionItem | undefined {
  return getTransactionItems(personaId).find((item) => item.id === id);
}

export function groupTransactions(
  items: TransactionItem[],
): { group: string; label: string; items: TransactionItem[] }[] {
  const monthKeys = [...new Set(items.map((item) => item.monthKey))].sort().reverse();
  return monthKeys.map((monthKey) => ({
    group: monthKey,
    label:
      TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label ?? monthKey,
    items: items
      .filter((item) => item.monthKey === monthKey)
      .sort((left, right) => right.postedOn.localeCompare(left.postedOn)),
  }));
}
