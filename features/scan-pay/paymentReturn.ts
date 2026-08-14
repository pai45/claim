import type { ScanPayTransaction } from "@/features/scan-pay/types";

export const PAYMENT_RETURN_STORAGE_KEY =
  "eb-claims:completed-payment-return:v1";
const PAYMENT_RETURN_VERSION = 1;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PersistedPaymentReturn = {
  version: typeof PAYMENT_RETURN_VERSION;
  transaction: ScanPayTransaction;
};

export function saveCompletedPaymentReturn(
  transaction: ScanPayTransaction,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  if (!storage || !isRestorableTransaction(transaction)) return false;
  const payload: PersistedPaymentReturn = {
    version: PAYMENT_RETURN_VERSION,
    transaction,
  };
  try {
    storage.setItem(PAYMENT_RETURN_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function readCompletedPaymentReturn(
  transactionId: string,
  storage: StorageLike | null = defaultStorage(),
): ScanPayTransaction | null {
  if (!storage || !transactionId) return null;
  try {
    const raw = storage.getItem(PAYMENT_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedPaymentReturn>;
    if (
      parsed.version !== PAYMENT_RETURN_VERSION ||
      !isRestorableTransaction(parsed.transaction)
    ) {
      storage.removeItem(PAYMENT_RETURN_STORAGE_KEY);
      return null;
    }
    return parsed.transaction.transactionId === transactionId
      ? parsed.transaction
      : null;
  } catch {
    return null;
  }
}

export function clearCompletedPaymentReturn(
  transactionId?: string,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  if (transactionId && !readCompletedPaymentReturn(transactionId, storage)) {
    return;
  }
  try {
    storage.removeItem(PAYMENT_RETURN_STORAGE_KEY);
  } catch {
    return;
  }
}

export function buildCompletedPaymentReturnTo(
  transaction: ScanPayTransaction,
): string {
  const params = new URLSearchParams({
    mode: transaction.mode,
    resumePayment: transaction.transactionId,
  });
  if (
    transaction.paymentContext.origin === "upi-transfer" &&
    transaction.payee.kind === "upi"
  ) {
    params.set("payee", transaction.payee.payeeId);
    return `/send-money/?${params.toString()}`;
  }
  return `/?${params.toString()}#scan-pay`;
}

function isRestorableTransaction(
  transaction: unknown,
): transaction is ScanPayTransaction {
  if (!transaction || typeof transaction !== "object") return false;
  const candidate = transaction as Partial<ScanPayTransaction>;
  return (
    candidate.outcome === "success" &&
    (candidate.mode === "benefits" || candidate.mode === "pluspay") &&
    typeof candidate.transactionId === "string" &&
    candidate.transactionId.length > 0 &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0 &&
    isPaymentContext(candidate.paymentContext) &&
    isPaymentPayee(candidate.payee) &&
    typeof candidate.paymentMethod === "string" &&
    typeof candidate.dateTime === "string" &&
    typeof candidate.walletId === "string" &&
    typeof candidate.walletLabel === "string" &&
    typeof candidate.paymentGroupId === "string" &&
    Array.isArray(candidate.fundingAllocations)
  );
}

function isPaymentContext(
  context: ScanPayTransaction["paymentContext"] | undefined,
): context is ScanPayTransaction["paymentContext"] {
  if (!context || typeof context !== "object") return false;
  if (context.origin === "scan-pay") return true;
  if (context.origin === "upi-transfer") {
    return (
      typeof context.recipient?.id === "string" &&
      typeof context.recipient?.name === "string" &&
      typeof context.recipient?.upiId === "string"
    );
  }
  return (
    context.origin === "bank-transfer" &&
    typeof context.recipient?.accountHolder === "string" &&
    typeof context.recipient?.accountNumber === "string" &&
    typeof context.recipient?.ifsc === "string"
  );
}

function isPaymentPayee(
  payee: ScanPayTransaction["payee"] | undefined,
): payee is ScanPayTransaction["payee"] {
  if (!payee || typeof payee !== "object" || typeof payee.name !== "string") {
    return false;
  }
  if (payee.kind === "merchant") {
    return typeof payee.upiId === "string" && typeof payee.merchantId === "string";
  }
  if (payee.kind === "upi") {
    return typeof payee.upiId === "string" && typeof payee.payeeId === "string";
  }
  return (
    payee.kind === "bank-transfer" &&
    typeof payee.accountNumber === "string" &&
    typeof payee.ifsc === "string"
  );
}

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}
