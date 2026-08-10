import { formatINR as formatClaimsINR } from "@/features/claims-history/constants";
import { getActivePersonaId } from "@/features/persona/store";
import type { PersonaId } from "@/features/persona/types";
import {
  getPersonaFinancialDelta,
  type FundingAllocation,
  type FundingWalletId,
} from "@/features/transactions/financialState";
import { colors } from "@/lib/ui/colors";

export type TransactionWallet = "meal" | "fuel" | "misc" | "gift";

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
  paymentGroupId?: string;
  paymentTotal?: number;
  fundingAllocations?: FundingAllocation[];
};

export type AnalyticsWalletId = TransactionWallet;
export type TransactionWalletFilterId = TransactionWallet;

export type WalletFilterOption = {
  id: TransactionWalletFilterId;
  label: string;
  toneClass: string;
  iconClass: string;
};

export const WALLET_FILTER_OPTIONS: readonly WalletFilterOption[] = [
  {
    id: "meal",
    label: "Meal Wallet",
    toneClass: "bg-warning-soft",
    iconClass: "text-warning",
  },
  {
    id: "fuel",
    label: "Fuel Wallet",
    toneClass: "bg-surface-tint",
    iconClass: "text-pine-primary",
  },
  {
    id: "misc",
    label: "Reimbursement Wallet",
    toneClass: "bg-surface-tint-strong",
    iconClass: "text-pine-dark",
  },
  {
    id: "gift",
    label: "Gift Wallet",
    toneClass: "bg-success-soft",
    iconClass: "text-success",
  },
] as const;

export type WalletBalance = {
  amount: number;
  /** Pre-formatted for display; the gift wallet is denominated in points. */
  display: string;
};

/**
 * Mirrors `personaFinancialState` in `public/employee-benefits/app.js` so the
 * hosted PlusPay home and the React screens quote the same wallet balances.
 */
const WALLET_BALANCES: Record<
  "returning" | "new_user",
  Record<TransactionWallet, WalletBalance>
> = {
  returning: {
    meal: { amount: 6400, display: "₹6,400" },
    fuel: { amount: 3150, display: "₹3,150" },
    misc: { amount: 9100, display: "₹9,100" },
    gift: { amount: 6200, display: "6,200 pts" },
  },
  new_user: {
    meal: { amount: 10000, display: "₹10,000" },
    fuel: { amount: 10000, display: "₹10,000" },
    misc: { amount: 10000, display: "₹10,000" },
    gift: { amount: 10000, display: "10,000 pts" },
  },
};

export function getWalletBalance(
  walletId: TransactionWallet,
  personaId?: PersonaId,
  includePersisted = true,
): WalletBalance {
  const activePersona = personaId ?? getActivePersonaId();
  const base = activePersona === "new_user"
    ? WALLET_BALANCES.new_user[walletId]
    : WALLET_BALANCES.returning[walletId];
  if (walletId === "gift") return base;
  const debited = includePersisted
    ? (getPersonaFinancialDelta(activePersona).debits[walletId] ?? 0)
    : 0;
  const amount = Math.max(0, base.amount - debited);
  return { amount, display: formatINR(amount) };
}

export function getBaseWalletBalances(
  personaId?: PersonaId,
): Record<FundingWalletId, number> {
  const activePersona = personaId ?? getActivePersonaId();
  const base =
    activePersona === "new_user"
      ? WALLET_BALANCES.new_user
      : WALLET_BALANCES.returning;
  return {
    meal: base.meal.amount,
    fuel: base.fuel.amount,
    misc: base.misc.amount,
  };
}

export type TransactionMonth = {
  key: string;
  label: string;
  shortLabel: string;
};

export const TRANSACTION_MONTHS: readonly TransactionMonth[] = [
  { key: "2026-04", label: "April 2026", shortLabel: "Apr 2026" },
  { key: "2026-05", label: "May 2026", shortLabel: "May 2026" },
  { key: "2026-06", label: "June 2026", shortLabel: "Jun 2026" },
  { key: "2026-07", label: "July 2026", shortLabel: "Jul 2026" },
  { key: "2026-08", label: "August 2026", shortLabel: "Aug 2026" },
];

export const TRANSACTION_MIN_MONTH = TRANSACTION_MONTHS[0].key;
export const TRANSACTION_MAX_MONTH =
  TRANSACTION_MONTHS[TRANSACTION_MONTHS.length - 1].key;
export const WALLET_TRANSACTION_PREVIEW_LIMIT = 10;

export type AnalyticsCategory = {
  id: string;
  name: string;
  transactionCount: number;
  amount: number;
  percent: number;
  color: string;
  toneClass: string;
  icon: "groceries" | "entertainment" | "dining" | "shopping" | "travel" | "bills";
};

export type AnalyticsWeek = {
  id: string;
  label: string;
  amount: number;
  transactionCount: number;
};

export type AnalyticsMerchant = {
  id: string;
  name: string;
  transactionCount: number;
  amount: number;
  averageSpend: number;
  rewardsEarned: number;
  barClass: string;
  toneClass: string;
  textClass: string;
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

export const ANALYTICS_WALLETS = WALLET_FILTER_OPTIONS;

const WALLET_NAMES: Record<TransactionWallet, string> = {
  meal: "Meal Wallet",
  fuel: "Fuel Wallet",
  misc: "Reimbursement Wallet",
  gift: "Gift Wallet",
};

const CATEGORY_ICONS: Record<TransactionWallet, AnalyticsCategory["icon"]> = {
  meal: "dining",
  fuel: "travel",
  misc: "bills",
  gift: "shopping",
};

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

type TransactionSeed = Pick<
  TransactionItem,
  | "id"
  | "merchant"
  | "amount"
  | "postedOn"
  | "wallet"
  | "icon"
  | "category"
  | "refId"
> & {
  type?: TransactionItem["type"];
  paymentMethod?: string;
  location?: string;
};

function transaction(seed: TransactionSeed): TransactionItem {
  const type = seed.type ?? "debit";
  const paymentMethod =
    seed.paymentMethod ?? (seed.wallet === "misc" ? "UPI" : "RuPay Card");
  const date = new Date(`${seed.postedOn}T00:00:00Z`);
  return {
    ...seed,
    type,
    paymentMethod,
    dateLabel: DATE_LABEL_FORMATTER.format(date),
    dateTime: `${DATE_TIME_FORMATTER.format(date)} at 06:00 pm`,
    monthKey: seed.postedOn.slice(0, 7),
    location: seed.location ?? "Bengaluru, Karnataka",
    cardMasked:
      paymentMethod === "RuPay Card"
        ? "RuPay •••• 1234"
        : paymentMethod === "UPI"
          ? "Linked UPI account"
          : "Employee benefits account",
    walletName: WALLET_NAMES[seed.wallet],
    paymentMode: paymentMethod,
    transactionId: `TXN-${seed.postedOn.replaceAll("-", "")}-${seed.refId.slice(-4)}`,
    referenceNumber: seed.refId,
  };
}

/**
 * One canonical ledger powers Recent Transactions, wallet statements,
 * Transaction History, Transaction Details, and every analytics calculation.
 * Funding/opening-balance rows are intentionally not part of the visible
 * history; the only credit below is a real employee top-up.
 */
export const TRANSACTION_ITEMS: TransactionItem[] = [
  transaction({ id: "meal-08", merchant: "Zomato Payment", amount: 650, postedOn: "2026-08-28", wallet: "meal", icon: "food", category: "Dining", refId: "1277834728", paymentMethod: "UPI" }),
  transaction({ id: "meal-09", merchant: "Swiggy", amount: 420, postedOn: "2026-08-22", wallet: "meal", icon: "food", category: "Dining", refId: "1277834700", paymentMethod: "UPI" }),
  transaction({ id: "meal-01", merchant: "WeWork counter", amount: 1000, postedOn: "2026-08-14", wallet: "meal", icon: "food", category: "Dining", refId: "1277834688" }),
  transaction({ id: "meal-02", merchant: "Star Bazaar", amount: 2000, postedOn: "2026-08-14", wallet: "meal", icon: "bag", category: "Groceries", refId: "1277834664" }),
  transaction({ id: "meal-03", merchant: "Subway", amount: 480, postedOn: "2026-08-10", wallet: "meal", icon: "food", category: "Dining", refId: "1277834591", paymentMethod: "UPI" }),
  transaction({ id: "meal-04", merchant: "FreshMenu", amount: 725, postedOn: "2026-08-06", wallet: "meal", icon: "food", category: "Dining", refId: "1277834528", paymentMethod: "UPI" }),
  transaction({ id: "meal-05", merchant: "Nature's Basket", amount: 1240, postedOn: "2026-08-03", wallet: "meal", icon: "bag", category: "Groceries", refId: "1277834495" }),
  transaction({ id: "meal-06", merchant: "WeWork counter", amount: 1000, postedOn: "2026-07-24", wallet: "meal", icon: "food", category: "Dining", refId: "1277834388" }),
  transaction({ id: "meal-07", merchant: "Star Bazaar", amount: 2000, postedOn: "2026-07-12", wallet: "meal", icon: "bag", category: "Groceries", refId: "1277834321" }),
  transaction({ id: "meal-jun-01", merchant: "Subway", amount: 560, postedOn: "2026-06-18", wallet: "meal", icon: "food", category: "Dining", refId: "1277834218", paymentMethod: "UPI" }),
  transaction({ id: "meal-may-01", merchant: "Star Bazaar", amount: 1850, postedOn: "2026-05-16", wallet: "meal", icon: "bag", category: "Groceries", refId: "1277834116" }),
  transaction({ id: "meal-apr-01", merchant: "FreshMenu", amount: 680, postedOn: "2026-04-09", wallet: "meal", icon: "food", category: "Dining", refId: "1277834009", paymentMethod: "UPI" }),

  transaction({ id: "fuel-08", merchant: "Shell Select", amount: 2200, postedOn: "2026-08-29", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834729" }),
  transaction({ id: "fuel-09", merchant: "Bharat Petroleum", amount: 1800, postedOn: "2026-08-23", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834723" }),
  transaction({ id: "fuel-01", merchant: "Shell Select", amount: 2200, postedOn: "2026-08-16", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834607" }),
  transaction({ id: "fuel-02", merchant: "HP Petrol Pump", amount: 1450, postedOn: "2026-08-11", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834588" }),
  transaction({ id: "fuel-03", merchant: "Park+ Fastag Hub", amount: 650, postedOn: "2026-08-08", wallet: "fuel", icon: "car", category: "Tolls & Parking", refId: "2277834562", paymentMethod: "UPI" }),
  transaction({ id: "fuel-04", merchant: "IndianOil COCO", amount: 2000, postedOn: "2026-08-05", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834517" }),
  transaction({ id: "fuel-05", merchant: "Bharat Petroleum", amount: 1800, postedOn: "2026-08-02", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834490" }),
  transaction({ id: "fuel-06", merchant: "Shell Select", amount: 1750, postedOn: "2026-07-19", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834382" }),
  transaction({ id: "fuel-07", merchant: "DriveU Mobility", amount: 900, postedOn: "2026-06-28", wallet: "fuel", icon: "car", category: "Vehicle Services", refId: "2277834314", paymentMethod: "UPI" }),
  transaction({ id: "fuel-may-01", merchant: "IndianOil COCO", amount: 2100, postedOn: "2026-05-18", wallet: "fuel", icon: "fuel", category: "Fuel", refId: "2277834118" }),
  transaction({ id: "fuel-apr-01", merchant: "Park+ Fastag Hub", amount: 500, postedOn: "2026-04-12", wallet: "fuel", icon: "car", category: "Tolls & Parking", refId: "2277834012", paymentMethod: "UPI" }),

  transaction({ id: "misc-top-up", merchant: "Top Up", amount: 5000, postedOn: "2026-08-30", wallet: "misc", icon: "money", category: "Wallet Top Up", refId: "3277834730", type: "credit", paymentMethod: "Bank Transfer" }),
  transaction({ id: "misc-08", merchant: "Apollo Pharmacy", amount: 850, postedOn: "2026-08-27", wallet: "misc", icon: "money", category: "Pharmacy", refId: "3277834727" }),
  transaction({ id: "misc-09", merchant: "Urban Company", amount: 1600, postedOn: "2026-08-20", wallet: "misc", icon: "money", category: "Services", refId: "3277834720" }),
  transaction({ id: "misc-01", merchant: "Apollo Pharmacy", amount: 850, postedOn: "2026-08-14", wallet: "misc", icon: "money", category: "Pharmacy", refId: "3277834582" }),
  transaction({ id: "misc-02", merchant: "Urban Company", amount: 1600, postedOn: "2026-08-10", wallet: "misc", icon: "money", category: "Services", refId: "3277834539" }),
  transaction({ id: "misc-03", merchant: "Tata 1mg", amount: 940, postedOn: "2026-08-07", wallet: "misc", icon: "bag", category: "Pharmacy", refId: "3277834506" }),
  transaction({ id: "misc-04", merchant: "Cleartrip Counter", amount: 2300, postedOn: "2026-08-04", wallet: "misc", icon: "money", category: "Travel", refId: "3277834481" }),
  transaction({ id: "misc-05", merchant: "Cult Fit Center", amount: 1200, postedOn: "2026-08-01", wallet: "misc", icon: "money", category: "Wellness", refId: "3277834455" }),
  transaction({ id: "misc-06", merchant: "MakeMyTrip Desk", amount: 3200, postedOn: "2026-07-18", wallet: "misc", icon: "money", category: "Travel", refId: "3277834380" }),
  transaction({ id: "misc-07", merchant: "Apollo Pharmacy", amount: 680, postedOn: "2026-06-26", wallet: "misc", icon: "money", category: "Pharmacy", refId: "3277834296" }),
  transaction({ id: "misc-may-01", merchant: "Airtel Broadband", amount: 1299, postedOn: "2026-05-12", wallet: "misc", icon: "money", category: "Bills", refId: "3277834112" }),
  transaction({ id: "misc-apr-01", merchant: "Urban Company", amount: 1450, postedOn: "2026-04-08", wallet: "misc", icon: "money", category: "Services", refId: "3277834008" }),

  transaction({ id: "gift-08", merchant: "Lifestyle Store", amount: 2400, postedOn: "2026-08-27", wallet: "gift", icon: "gift", category: "Fashion", refId: "4277834727" }),
  transaction({ id: "txn-amazon", merchant: "Amazon", amount: 1500, postedOn: "2026-08-22", wallet: "gift", icon: "bag", category: "Shopping", refId: "4277834722" }),
  transaction({ id: "gift-01", merchant: "Amazon Pay", amount: 1000, postedOn: "2026-08-15", wallet: "gift", icon: "gift", category: "Gift Cards", refId: "4277834682" }),
  transaction({ id: "gift-02", merchant: "Lifestyle Store", amount: 2000, postedOn: "2026-08-12", wallet: "gift", icon: "gift", category: "Fashion", refId: "4277834639" }),
  transaction({ id: "gift-03", merchant: "Shoppers Stop", amount: 1200, postedOn: "2026-08-09", wallet: "gift", icon: "gift", category: "Shopping", refId: "4277834606" }),
  transaction({ id: "gift-04", merchant: "Myntra", amount: 850, postedOn: "2026-08-06", wallet: "gift", icon: "gift", category: "Fashion", refId: "4277834581" }),
  transaction({ id: "gift-05", merchant: "BookMyShow", amount: 480, postedOn: "2026-08-02", wallet: "gift", icon: "gift", category: "Entertainment", refId: "4277834555", paymentMethod: "UPI" }),
  transaction({ id: "gift-06", merchant: "Croma", amount: 2400, postedOn: "2026-07-21", wallet: "gift", icon: "gift", category: "Shopping", refId: "4277834420" }),
  transaction({ id: "gift-07", merchant: "Amazon Pay", amount: 750, postedOn: "2026-06-14", wallet: "gift", icon: "gift", category: "Gift Cards", refId: "4277834316" }),
  transaction({ id: "gift-may-01", merchant: "Myntra", amount: 900, postedOn: "2026-05-11", wallet: "gift", icon: "gift", category: "Fashion", refId: "4277834111" }),
  transaction({ id: "gift-apr-01", merchant: "BookMyShow", amount: 600, postedOn: "2026-04-06", wallet: "gift", icon: "gift", category: "Entertainment", refId: "4277834006", paymentMethod: "UPI" }),
].sort((left, right) => {
  const dateOrder = right.postedOn.localeCompare(left.postedOn);
  return dateOrder === 0 ? left.id.localeCompare(right.id) : dateOrder;
});

export function getTransactionItems(
  personaId?: PersonaId,
  includePersisted = true,
): TransactionItem[] {
  const activePersona = personaId ?? getActivePersonaId();
  const seeded = activePersona === "new_user" ? [] : TRANSACTION_ITEMS;
  const added = includePersisted
    ? getPersonaFinancialDelta(activePersona).transactions
    : [];
  return [...added, ...seeded].sort((left, right) => {
    const dateOrder = right.postedOn.localeCompare(left.postedOn);
    return dateOrder === 0 ? left.id.localeCompare(right.id) : dateOrder;
  });
}

export function getTransactionsByPaymentGroup(
  paymentGroupId: string,
  personaId?: PersonaId,
): TransactionItem[] {
  return getTransactionItems(personaId).filter(
    (item) => item.paymentGroupId === paymentGroupId,
  );
}

export function isTransactionWallet(value: unknown): value is TransactionWallet {
  return WALLET_FILTER_OPTIONS.some((wallet) => wallet.id === value);
}

export function filterTransactionsByWallet(
  items: TransactionItem[],
  walletId: TransactionWalletFilterId,
): TransactionItem[] {
  return items.filter((item) => item.wallet === walletId);
}

export function getRecentTransactionsByWallet(
  items: TransactionItem[],
  walletId: TransactionWalletFilterId,
  limit = WALLET_TRANSACTION_PREVIEW_LIMIT,
): TransactionItem[] {
  return filterTransactionsByWallet(items, walletId)
    .sort((left, right) => {
      const dateOrder = right.postedOn.localeCompare(left.postedOn);
      return dateOrder === 0 ? left.id.localeCompare(right.id) : dateOrder;
    })
    .slice(0, Math.max(0, limit));
}

export function filterTransactionsByMonth(
  items: TransactionItem[],
  monthKey: string,
): TransactionItem[] {
  return items.filter((item) => item.monthKey === monthKey);
}

function weeksForMonth(monthKey: string): AnalyticsWeek[] {
  const [year, month] = monthKey.split("-").map(Number);
  const finalDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [
    { id: `${monthKey}-01`, label: "1-7", amount: 0, transactionCount: 0 },
    { id: `${monthKey}-08`, label: "8-14", amount: 0, transactionCount: 0 },
    { id: `${monthKey}-15`, label: "15-21", amount: 0, transactionCount: 0 },
    { id: `${monthKey}-22`, label: `22-${finalDay}`, amount: 0, transactionCount: 0 },
  ];
}

export function getAnalyticsData(
  personaId?: PersonaId,
  walletId: AnalyticsWalletId = "meal",
  monthKey = TRANSACTION_MAX_MONTH,
  includePersisted = true,
): {
  totalSpent: number;
  monthLabel: string;
  monthShortLabel: string;
  categories: AnalyticsCategory[];
  weeks: AnalyticsWeek[];
  merchants: AnalyticsMerchant[];
  topMerchant: AnalyticsMerchant | null;
  averageWeeklySpend: number;
  rewardsEarned: number;
} {
  const items = filterTransactionsByMonth(
    filterTransactionsByWallet(
      getTransactionItems(personaId, includePersisted),
      walletId,
    ),
    monthKey,
  ).filter((item) => item.type === "debit");
  const totalSpent = items.reduce((sum, item) => sum + item.amount, 0);
  const grouped = new Map<string, TransactionItem[]>();
  for (const item of items) {
    grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
  }
  const palette = [
    { color: colors.pinePrimary, toneClass: "bg-pine-primary" },
    { color: colors.success, toneClass: "bg-success" },
    { color: colors.warning, toneClass: "bg-warning" },
    { color: colors.pine, toneClass: "bg-pine" },
    { color: colors.mint, toneClass: "bg-mint" },
  ];
  const categories = [...grouped.entries()]
    .map(([name, rows]) => ({
      name,
      rows,
      amount: rows.reduce((sum, row) => sum + row.amount, 0),
    }))
    .sort((left, right) => right.amount - left.amount)
    .map(({ name, rows, amount }, index) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      transactionCount: rows.length,
      amount,
      percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      color: palette[index % palette.length].color,
      toneClass: palette[index % palette.length].toneClass,
      icon: CATEGORY_ICONS[walletId],
    }));

  const weeks = weeksForMonth(monthKey);
  for (const item of items) {
    const day = Number(item.postedOn.slice(-2));
    const weekIndex = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
    weeks[weekIndex].amount += item.amount;
    weeks[weekIndex].transactionCount += 1;
  }

  const merchantPalette = [
    {
      barClass: "bg-warning",
      toneClass: "bg-warning-tint",
      textClass: "text-warning",
    },
    {
      barClass: "bg-pine-primary",
      toneClass: "bg-surface-tint",
      textClass: "text-pine-primary",
    },
    {
      barClass: "bg-success",
      toneClass: "bg-success-tint",
      textClass: "text-success",
    },
    {
      barClass: "bg-pine",
      toneClass: "bg-surface-tint-strong",
      textClass: "text-pine",
    },
    {
      barClass: "bg-mint",
      toneClass: "bg-success-soft",
      textClass: "text-pine-dark",
    },
  ];
  const merchantGroups = new Map<string, TransactionItem[]>();
  for (const item of items) {
    merchantGroups.set(item.merchant, [
      ...(merchantGroups.get(item.merchant) ?? []),
      item,
    ]);
  }
  const merchants = [...merchantGroups.entries()]
    .map(([name, rows]) => ({
      name,
      rows,
      amount: rows.reduce((sum, row) => sum + row.amount, 0),
    }))
    .sort((left, right) => right.amount - left.amount)
    .map(({ name, rows, amount }, index) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      transactionCount: rows.length,
      amount,
      averageSpend: Math.round(amount / rows.length),
      rewardsEarned: Math.round(amount * 0.02),
      ...merchantPalette[index % merchantPalette.length],
    }));

  const month = TRANSACTION_MONTHS.find((item) => item.key === monthKey);
  return {
    totalSpent,
    monthLabel: month?.label ?? monthKey,
    monthShortLabel: month?.shortLabel ?? monthKey,
    categories,
    weeks,
    merchants,
    topMerchant: merchants[0] ?? null,
    averageWeeklySpend: Math.round(totalSpent / weeks.length),
    rewardsEarned: Math.round(totalSpent * 0.02),
  };
}

export function formatINR(amount: number): string {
  return formatClaimsINR(amount);
}

export function formatCompactAmount(amount: number): string {
  if (amount < 1000) return String(amount);
  const compact = Number((amount / 1000).toFixed(1));
  return `${compact}K`;
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
  includePersisted = true,
): TransactionItem | undefined {
  return getTransactionItems(personaId, includePersisted).find(
    (item) => item.id === id,
  );
}

export function groupTransactions(
  items: TransactionItem[],
): { group: string; label: string; items: TransactionItem[] }[] {
  const monthKeys = [...new Set(items.map((item) => item.monthKey))].sort().reverse();
  return monthKeys.map((monthKey) => ({
    group: monthKey,
    label:
      monthKey === TRANSACTION_MAX_MONTH
        ? "Current Month"
        : TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label ?? monthKey,
    items: items
      .filter((item) => item.monthKey === monthKey)
      .sort((left, right) => right.postedOn.localeCompare(left.postedOn)),
  }));
}
