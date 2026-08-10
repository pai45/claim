import type { ScanPayTransaction } from "@/features/scan-pay/types";
import type {
  TransactionIconId,
  TransactionItem,
} from "@/features/transactions/constants";
import { maskAccountNumber } from "@/features/bank-transfer/validation";

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

export function createPaymentLedgerRows(
  transaction: ScanPayTransaction,
  now = new Date(),
): TransactionItem[] {
  const postedOn = now.toISOString().slice(0, 10);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const bankPayee =
    transaction.payee.kind === "bank-transfer" ? transaction.payee : null;
  return transaction.fundingAllocations.map((allocation) => ({
    id: `${transaction.paymentGroupId}-${allocation.walletId}`,
    merchant: transaction.payee.name,
    paymentMethod: transaction.paymentMethod,
    refId: transaction.transactionId,
    amount: allocation.amount,
    type: "debit",
    dateLabel: DATE_LABEL_FORMATTER.format(now),
    dateTime: `${DATE_TIME_FORMATTER.format(now)} at ${time}`,
    postedOn,
    monthKey: postedOn.slice(0, 7),
    wallet: allocation.walletId,
    icon: iconForWallet(allocation.walletId),
    category: bankPayee
      ? "Finance / Bank"
      : transaction.category ?? "Scan & Pay",
    location: bankPayee ? "Online transfer" : "Bengaluru, Karnataka",
    cardMasked: bankPayee
      ? maskAccountNumber(bankPayee.accountNumber)
      : "Linked UPI account",
    walletName: allocation.walletLabel,
    paymentMode: transaction.paymentMethod,
    transactionId: transaction.transactionId,
    referenceNumber: transaction.transactionId,
    paymentGroupId: transaction.paymentGroupId,
    paymentTotal: transaction.amount,
    fundingAllocations: transaction.fundingAllocations,
  }));
}

function iconForWallet(
  walletId: "meal" | "fuel" | "misc",
): TransactionIconId {
  if (walletId === "meal") return "food";
  if (walletId === "fuel") return "fuel";
  return "money";
}
