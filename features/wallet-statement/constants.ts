import type { PersonaId } from "@/features/persona/types";
import {
  TRANSACTION_MAX_MONTH,
  TRANSACTION_MIN_MONTH,
  TRANSACTION_MONTHS,
  filterTransactionsByWallet,
  getTransactionItems,
  isTransactionWallet,
  type TransactionItem,
  type TransactionWallet,
} from "@/features/transactions/constants";

export type WalletStatementId = TransactionWallet;
export type WalletStatementTransaction = TransactionItem;

export type WalletStatement = {
  id: WalletStatementId;
  label: string;
  transactions: readonly WalletStatementTransaction[];
};

const WALLET_LABELS: Record<WalletStatementId, string> = {
  meal: "Meal Wallet",
  fuel: "Fuel Wallet",
  misc: "Reimbursement Wallet",
  mobile: "Mobile & Internet",
};

export const WALLET_STATEMENT_MIN_MONTH = TRANSACTION_MIN_MONTH;
export const WALLET_STATEMENT_MAX_MONTH = TRANSACTION_MAX_MONTH;

export function isWalletStatementId(
  value: string | null,
): value is WalletStatementId {
  return isTransactionWallet(value);
}

export function getWalletStatement(
  value: string | null,
  personaId?: PersonaId,
  includePersisted = true,
): WalletStatement {
  const id = isWalletStatementId(value) ? value : "meal";
  return {
    id,
    label: WALLET_LABELS[id],
    transactions: filterTransactionsByWallet(
      getTransactionItems(personaId, includePersisted),
      id,
    ),
  };
}

export function filterWalletStatementTransactions(
  transactions: readonly WalletStatementTransaction[],
  monthKey: string | null,
): WalletStatementTransaction[] {
  if (!monthKey) return [...transactions];
  return transactions.filter((transaction) => transaction.monthKey === monthKey);
}

export function monthLabel(monthKey: string): string {
  return (
    TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label ??
    new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${monthKey}-01T00:00:00Z`))
  );
}

export function groupWalletStatementTransactions(
  transactions: readonly WalletStatementTransaction[],
): {
  monthKey: string;
  label: string;
  transactions: WalletStatementTransaction[];
}[] {
  const monthKeys = [...new Set(transactions.map((item) => item.monthKey))]
    .sort()
    .reverse();

  return monthKeys.map((monthKey) => ({
    monthKey,
    label: monthKey === WALLET_STATEMENT_MAX_MONTH ? "Current Month" : monthLabel(monthKey),
    transactions: transactions
      .filter((item) => item.monthKey === monthKey)
      .sort((left, right) => right.postedOn.localeCompare(left.postedOn)),
  }));
}
