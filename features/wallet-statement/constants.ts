import type { TransactionIconId } from "@/features/transactions/constants";

export type WalletStatementId = "meal" | "fuel" | "misc" | "gift";

export type WalletStatementTransaction = {
  id: string;
  merchant: string;
  referenceId: string;
  postedOn: string;
  amount: number;
  icon: TransactionIconId;
};

export type WalletStatement = {
  id: WalletStatementId;
  label: string;
  transactions: readonly WalletStatementTransaction[];
};

const WALLET_STATEMENTS: Record<WalletStatementId, WalletStatement> = {
  meal: {
    id: "meal",
    label: "Meal Wallet",
    transactions: [
      { id: "meal-01", merchant: "WeWork counter", referenceId: "1277834688", postedOn: "2026-08-14", amount: 1000, icon: "food" },
      { id: "meal-02", merchant: "Star Bazaar", referenceId: "1277834664", postedOn: "2026-08-14", amount: 2000, icon: "bag" },
      { id: "meal-03", merchant: "Subway", referenceId: "1277834591", postedOn: "2026-08-10", amount: 480, icon: "food" },
      { id: "meal-04", merchant: "FreshMenu", referenceId: "1277834528", postedOn: "2026-08-06", amount: 725, icon: "food" },
      { id: "meal-05", merchant: "Nature's Basket", referenceId: "1277834495", postedOn: "2026-08-03", amount: 1240, icon: "bag" },
      { id: "meal-06", merchant: "WeWork counter", referenceId: "1277834388", postedOn: "2026-07-24", amount: 1000, icon: "food" },
      { id: "meal-07", merchant: "Star Bazaar", referenceId: "1277834321", postedOn: "2026-07-12", amount: 2000, icon: "bag" },
    ],
  },
  fuel: {
    id: "fuel",
    label: "Fuel Wallet",
    transactions: [
      { id: "fuel-01", merchant: "Shell Select", referenceId: "2277834607", postedOn: "2026-08-16", amount: 2200, icon: "fuel" },
      { id: "fuel-02", merchant: "HP Petrol Pump", referenceId: "2277834588", postedOn: "2026-08-11", amount: 1450, icon: "fuel" },
      { id: "fuel-03", merchant: "Park+ Fastag Hub", referenceId: "2277834562", postedOn: "2026-08-08", amount: 650, icon: "car" },
      { id: "fuel-04", merchant: "IndianOil COCO", referenceId: "2277834517", postedOn: "2026-08-05", amount: 2000, icon: "fuel" },
      { id: "fuel-05", merchant: "Bharat Petroleum", referenceId: "2277834490", postedOn: "2026-08-02", amount: 1800, icon: "fuel" },
      { id: "fuel-06", merchant: "Shell Select", referenceId: "2277834382", postedOn: "2026-07-19", amount: 1750, icon: "fuel" },
      { id: "fuel-07", merchant: "DriveU Mobility", referenceId: "2277834314", postedOn: "2026-06-28", amount: 900, icon: "car" },
    ],
  },
  misc: {
    id: "misc",
    label: "Reimbursement Wallet",
    transactions: [
      { id: "misc-01", merchant: "Apollo Pharmacy", referenceId: "3277834582", postedOn: "2026-08-14", amount: 850, icon: "money" },
      { id: "misc-02", merchant: "Urban Company", referenceId: "3277834539", postedOn: "2026-08-10", amount: 1600, icon: "money" },
      { id: "misc-03", merchant: "Tata 1mg", referenceId: "3277834506", postedOn: "2026-08-07", amount: 940, icon: "bag" },
      { id: "misc-04", merchant: "Cleartrip Counter", referenceId: "3277834481", postedOn: "2026-08-04", amount: 2300, icon: "money" },
      { id: "misc-05", merchant: "Cult Fit Center", referenceId: "3277834455", postedOn: "2026-08-01", amount: 1200, icon: "money" },
      { id: "misc-06", merchant: "MakeMyTrip Desk", referenceId: "3277834380", postedOn: "2026-07-18", amount: 3200, icon: "money" },
      { id: "misc-07", merchant: "Apollo Pharmacy", referenceId: "3277834296", postedOn: "2026-06-26", amount: 680, icon: "money" },
    ],
  },
  gift: {
    id: "gift",
    label: "Gift Wallet",
    transactions: [
      { id: "gift-01", merchant: "Amazon Pay", referenceId: "4277834682", postedOn: "2026-08-15", amount: 1000, icon: "gift" },
      { id: "gift-02", merchant: "Lifestyle Store", referenceId: "4277834639", postedOn: "2026-08-12", amount: 2000, icon: "gift" },
      { id: "gift-03", merchant: "Shoppers Stop", referenceId: "4277834606", postedOn: "2026-08-09", amount: 1200, icon: "gift" },
      { id: "gift-04", merchant: "Myntra", referenceId: "4277834581", postedOn: "2026-08-06", amount: 850, icon: "gift" },
      { id: "gift-05", merchant: "BookMyShow", referenceId: "4277834555", postedOn: "2026-08-02", amount: 480, icon: "gift" },
      { id: "gift-06", merchant: "Croma", referenceId: "4277834420", postedOn: "2026-07-21", amount: 2400, icon: "gift" },
      { id: "gift-07", merchant: "Amazon Pay", referenceId: "4277834316", postedOn: "2026-06-14", amount: 750, icon: "gift" },
    ],
  },
};

export const WALLET_STATEMENT_MIN_MONTH = "2026-04";
export const WALLET_STATEMENT_MAX_MONTH = "2026-08";

export function isWalletStatementId(value: string | null): value is WalletStatementId {
  return value === "meal" || value === "fuel" || value === "misc" || value === "gift";
}

export function getWalletStatement(value: string | null): WalletStatement {
  return WALLET_STATEMENTS[isWalletStatementId(value) ? value : "meal"];
}

export function filterWalletStatementTransactions(
  transactions: readonly WalletStatementTransaction[],
  monthKey: string | null,
): WalletStatementTransaction[] {
  if (!monthKey) return [...transactions];
  return transactions.filter((transaction) => transaction.postedOn.startsWith(monthKey));
}

export function monthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T00:00:00Z`));
}

export function groupWalletStatementTransactions(
  transactions: readonly WalletStatementTransaction[],
): { monthKey: string; label: string; transactions: WalletStatementTransaction[] }[] {
  const latestMonth = WALLET_STATEMENT_MAX_MONTH;
  const monthKeys = [...new Set(transactions.map((item) => item.postedOn.slice(0, 7)))]
    .sort()
    .reverse();

  return monthKeys.map((monthKey) => ({
    monthKey,
    label: monthKey === latestMonth ? "Current Month" : monthLabel(monthKey),
    transactions: transactions
      .filter((item) => item.postedOn.startsWith(monthKey))
      .sort((left, right) => right.postedOn.localeCompare(left.postedOn)),
  }));
}
