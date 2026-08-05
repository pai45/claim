import { formatINR as formatClaimsINR } from "@/features/claims-history/constants";

export type TransactionWallet = "main" | "meal" | "fuel" | "misc" | "gift";

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
  /** Positive amounts are credits (top-ups); negative are debits. */
  type: "debit" | "credit";
  dateLabel: string;
  dateTime: string;
  monthGroup: "current" | "november";
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

export type AnalyticsWalletId = "meal" | "fuel" | "reimbursement";

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

export const ANALYTICS_WALLETS: {
  id: AnalyticsWalletId;
  label: string;
  bg: string;
  ink: string;
}[] = [
  { id: "meal", label: "Meal Wallet", bg: "#FFF4DB", ink: "#8A5A00" },
  { id: "fuel", label: "Fuel Wallet", bg: "#E5F3FF", ink: "#0B5CAD" },
  {
    id: "reimbursement",
    label: "Reimbursement",
    bg: "#ECE9FF",
    ink: "#4B3FA8",
  },
];

export const ANALYTICS_TOTAL_SPENT = 50000;
export const ANALYTICS_MONTH_LABEL = "Feb 2026";

/**
 * Category palette for the analytics chart (data colors, not brand chrome).
 *
 * Validated as a set, in this render order, against the white card surface —
 * OKLCH lightness band, chroma floor, and colour-vision separation on the
 * adjacent pairlist (a donut is a stacked bar wrapped into a ring, so each
 * segment only ever touches two others, and the wrap pair was checked too).
 *
 * Two slots are deliberately not the obvious hue:
 * - Dining is magenta rather than the violet `#7B5CFF` it used to be, which sat
 *   ΔE 8.4 from Groceries blue for normal vision and 1.2 under protanopia —
 *   effectively the same colour for a red-weak reader.
 * - Bills is a deeper amber than `#E8B84A`, which was above the lightness band
 *   and too pale to hold a label.
 *
 * Groceries, Travel and Bills still sit below 3:1 against white. That is
 * allowed here because the value is never carried by colour alone: every
 * segment is directly labelled and the list below the chart repeats the whole
 * table. Keep both if you change these.
 */
export const ANALYTICS_CATEGORIES: AnalyticsCategory[] = [
  {
    id: "groceries",
    name: "Groceries",
    transactionCount: 7,
    amount: 15000,
    percent: 30,
    color: "#3B6EF5",
    icon: "groceries",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    transactionCount: 4,
    amount: 6000,
    percent: 12,
    color: "#E85D4C",
    icon: "entertainment",
  },
  {
    id: "dining",
    name: "Dining",
    transactionCount: 5,
    amount: 6000,
    percent: 12,
    color: "#A0479E",
    icon: "dining",
  },
  {
    id: "shopping",
    name: "Shopping",
    transactionCount: 6,
    amount: 9000,
    percent: 18,
    color: "#2BB673",
    icon: "shopping",
  },
  {
    id: "travel",
    name: "Travel",
    transactionCount: 3,
    amount: 6500,
    percent: 13,
    color: "#4BA3E3",
    icon: "travel",
  },
  {
    id: "bills",
    name: "Bills",
    transactionCount: 4,
    amount: 7500,
    percent: 15,
    color: "#CE9A22",
    icon: "bills",
  },
];

export const TRANSACTION_ITEMS: TransactionItem[] = [
  {
    id: "txn-amazon",
    merchant: "Amazon",
    paymentMethod: "Rupay Card",
    refId: "12345678",
    amount: 4250,
    type: "debit",
    dateLabel: "20 Dec",
    dateTime: "20 December at 02:32 pm",
    monthGroup: "current",
    wallet: "gift",
    icon: "bag",
    category: "E-Commerce",
    location: "Mumbai, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Main Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000003",
    referenceNumber: "REFUCK477Q4A",
  },
  {
    id: "txn-zomato",
    merchant: "Zomato Payment",
    paymentMethod: "Rupay Card",
    refId: "12345678",
    amount: 650,
    type: "debit",
    dateLabel: "14 Dec",
    dateTime: "14 December at 08:15 pm",
    monthGroup: "current",
    wallet: "meal",
    icon: "food",
    category: "Dining",
    location: "Bengaluru, Karnataka",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Meal Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000004",
    referenceNumber: "REFZOM8821K2",
  },
  {
    id: "txn-uber",
    merchant: "Uber",
    paymentMethod: "Rupay Card",
    refId: "12345678",
    amount: 650,
    type: "debit",
    dateLabel: "12 Dec",
    dateTime: "12 December at 09:40 am",
    monthGroup: "current",
    wallet: "fuel",
    icon: "car",
    category: "Travel",
    location: "Pune, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Fuel Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000005",
    referenceNumber: "REFUBR3391P8",
  },
  {
    id: "txn-topup",
    merchant: "Top Up",
    paymentMethod: "Bank Transfer",
    refId: "12345678",
    amount: 5000,
    type: "credit",
    dateLabel: "10 Dec",
    dateTime: "10 December at 11:05 am",
    monthGroup: "current",
    wallet: "misc",
    icon: "money",
    category: "Wallet Top Up",
    location: "Mumbai, Maharashtra",
    cardMasked: "Savings ••••2210",
    walletName: "Main Wallet",
    paymentMode: "Bank Transfer",
    transactionId: "TXN0000000000006",
    referenceNumber: "REFTOP5500M1",
  },
  {
    id: "txn-shell",
    merchant: "Shell Select",
    paymentMethod: "Rupay Card",
    refId: "123456791",
    amount: 2200,
    type: "debit",
    dateLabel: "08 Dec",
    dateTime: "08 December at 06:22 pm",
    monthGroup: "current",
    wallet: "fuel",
    icon: "fuel",
    category: "Fuel",
    location: "Mumbai, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Fuel Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000007",
    referenceNumber: "REFSHE2200F3",
  },
  {
    id: "txn-starbazaar",
    merchant: "Star Bazaar",
    paymentMethod: "Rupay Card",
    refId: "123456792",
    amount: 1180,
    type: "debit",
    dateLabel: "06 Dec",
    dateTime: "06 December at 01:10 pm",
    monthGroup: "current",
    wallet: "meal",
    icon: "bag",
    category: "Groceries",
    location: "Mumbai, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Meal Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000008",
    referenceNumber: "REFSTR1180G4",
  },
  {
    id: "txn-lifestyle",
    merchant: "Lifestyle Store",
    paymentMethod: "Rupay Card",
    refId: "123456793",
    amount: 2400,
    type: "debit",
    dateLabel: "04 Dec",
    dateTime: "04 December at 04:45 pm",
    monthGroup: "current",
    wallet: "gift",
    icon: "gift",
    category: "Shopping",
    location: "Bengaluru, Karnataka",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Gift Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000009",
    referenceNumber: "REFLFS2400S5",
  },
  {
    id: "txn-swiggy-nov",
    merchant: "Swiggy",
    paymentMethod: "Rupay Card",
    refId: "123456700",
    amount: 420,
    type: "debit",
    dateLabel: "28 Nov",
    dateTime: "28 November at 07:55 pm",
    monthGroup: "november",
    wallet: "meal",
    icon: "food",
    category: "Dining",
    location: "Mumbai, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Meal Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000010",
    referenceNumber: "REFSWG0420N1",
  },
  {
    id: "txn-amazon-nov",
    merchant: "Amazon",
    paymentMethod: "Rupay Card",
    refId: "123456701",
    amount: 1899,
    type: "debit",
    dateLabel: "18 Nov",
    dateTime: "18 November at 03:20 pm",
    monthGroup: "november",
    wallet: "gift",
    icon: "bag",
    category: "E-Commerce",
    location: "Mumbai, Maharashtra",
    cardMasked: "Rupay Card ••••7845",
    walletName: "Main Wallet",
    paymentMode: "Card Payment",
    transactionId: "TXN0000000000011",
    referenceNumber: "REFAMZ1899N2",
  },
  {
    id: "txn-topup-nov",
    merchant: "Top Up",
    paymentMethod: "Bank Transfer",
    refId: "123456702",
    amount: 3000,
    type: "credit",
    dateLabel: "05 Nov",
    dateTime: "05 November at 10:00 am",
    monthGroup: "november",
    wallet: "misc",
    icon: "money",
    category: "Wallet Top Up",
    location: "Mumbai, Maharashtra",
    cardMasked: "Savings ••••2210",
    walletName: "Main Wallet",
    paymentMode: "Bank Transfer",
    transactionId: "TXN0000000000012",
    referenceNumber: "REFTOP3000N3",
  },
];

export const MONTH_GROUP_LABELS: Record<TransactionItem["monthGroup"], string> =
  {
    current: "Current Month",
    november: "November",
  };

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

export function getTransaction(id: string): TransactionItem | undefined {
  return TRANSACTION_ITEMS.find((item) => item.id === id);
}

export function groupTransactions(
  items: TransactionItem[],
): { group: TransactionItem["monthGroup"]; label: string; items: TransactionItem[] }[] {
  const order: TransactionItem["monthGroup"][] = ["current", "november"];
  return order
    .map((group) => ({
      group,
      label: MONTH_GROUP_LABELS[group],
      items: items.filter((item) => item.monthGroup === group),
    }))
    .filter((section) => section.items.length > 0);
}
