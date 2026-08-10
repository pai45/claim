import { useSyncExternalStore } from "react";
import type {
  ScanPayMode,
  ScanPayTransaction,
  UpiPayee,
} from "@/features/scan-pay/types";
import type { TransactionItem } from "@/features/transactions/constants";

export const RECIPIENT_HISTORY_STORAGE_KEY =
  "eb-claims:recipient-payment-history:v1";
const RECIPIENT_HISTORY_VERSION = 1;
const RECIPIENT_HISTORY_EVENT = "eb-claims:recipient-payment-history-updated";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type RecipientPaymentRecord = {
  payee: UpiPayee;
  transaction: ScanPayTransaction;
  createdAt: string;
};

type PersistedRecipientHistory = {
  version: typeof RECIPIENT_HISTORY_VERSION;
  records: RecipientPaymentRecord[];
};

export const SEEDED_PAYEES: readonly UpiPayee[] = [
  {
    id: "deevanshu-sharma",
    name: "Deevanshu Sharma",
    upiId: "deevanshu@paytm",
    initials: "DS",
  },
  {
    id: "anjali-kumar",
    name: "Anjali Kumar",
    upiId: "anjali.kumar@paytm",
    initials: "AK",
  },
  { id: "zomato", name: "Zomato", upiId: "zomato@paytm", initials: "ZO" },
  { id: "amazon", name: "Amazon", upiId: "amazon@pay", initials: "AM" },
  {
    id: "sneha-roy",
    name: "Sneha Roy",
    upiId: "sneha.roy@paytm",
    initials: "SR",
  },
];

const SEEDED_RECORDS = SEEDED_PAYEES.flatMap((payee, index) => [
  seedRecord(payee, "benefits", index, 0),
  seedRecord(payee, "benefits", index, 1),
  seedRecord(payee, "pluspay", index, 0),
  seedRecord(payee, "pluspay", index, 1),
]);

export function getRecentPayees(
  mode: ScanPayMode,
  storage: StorageLike | null = defaultStorage(),
): UpiPayee[] {
  const records = getRecipientPaymentRecords(storage)
    .filter((record) => record.transaction.mode === mode)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const payees = new Map<string, UpiPayee>();
  for (const record of records) payees.set(record.payee.upiId, record.payee);
  for (const payee of SEEDED_PAYEES) {
    if (!payees.has(payee.upiId)) payees.set(payee.upiId, payee);
  }
  return [...payees.values()];
}

export function getPayee(
  payeeId: string,
  mode: ScanPayMode,
  storage: StorageLike | null = defaultStorage(),
): UpiPayee | undefined {
  return getRecentPayees(mode, storage).find((payee) => payee.id === payeeId);
}

export function getPayeeHistory(
  payeeId: string,
  mode: ScanPayMode,
  storage: StorageLike | null = defaultStorage(),
): RecipientPaymentRecord[] {
  return getRecipientPaymentRecords(storage)
    .filter(
      (record) =>
        record.payee.id === payeeId && record.transaction.mode === mode,
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getRecipientHistoryTransaction(
  transactionId: string,
  storage: StorageLike | null = defaultStorage(),
): TransactionItem | undefined {
  const record = getRecipientPaymentRecords(storage).find(
    (item) => item.transaction.transactionId === transactionId,
  );
  return record ? toTransactionItem(record) : undefined;
}

export function recordRecipientPayment(
  transaction: ScanPayTransaction,
  storage: StorageLike | null = defaultStorage(),
  createdAt = new Date().toISOString(),
): boolean {
  if (
    transaction.outcome !== "success" ||
    transaction.payee.kind !== "upi" ||
    transaction.paymentContext.origin !== "upi-transfer"
  ) {
    return false;
  }
  const persisted = readPersistedHistory(storage);
  if (
    persisted.records.some(
      (record) => record.transaction.paymentGroupId === transaction.paymentGroupId,
    )
  ) {
    return false;
  }
  const record: RecipientPaymentRecord = {
    payee: transaction.paymentContext.recipient,
    transaction,
    createdAt,
  };
  writePersistedHistory(
    { ...persisted, records: [record, ...persisted.records] },
    storage,
  );
  return true;
}

export function getRecipientPaymentRecords(
  storage: StorageLike | null = defaultStorage(),
): RecipientPaymentRecord[] {
  return [...readPersistedHistory(storage).records, ...SEEDED_RECORDS];
}

export function useRecipientHistoryVersion(): string | null {
  return useSyncExternalStore(
    subscribeToRecipientHistory,
    getRecipientHistorySnapshot,
    () => null,
  );
}

function readPersistedHistory(
  storage: StorageLike | null,
): PersistedRecipientHistory {
  const empty: PersistedRecipientHistory = {
    version: RECIPIENT_HISTORY_VERSION,
    records: [],
  };
  if (!storage) return empty;
  try {
    const raw = storage.getItem(RECIPIENT_HISTORY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedRecipientHistory>;
    if (
      parsed.version !== RECIPIENT_HISTORY_VERSION ||
      !Array.isArray(parsed.records)
    ) {
      storage.removeItem(RECIPIENT_HISTORY_STORAGE_KEY);
      return empty;
    }
    return { version: RECIPIENT_HISTORY_VERSION, records: parsed.records };
  } catch {
    return empty;
  }
}

function writePersistedHistory(
  state: PersistedRecipientHistory,
  storage: StorageLike | null,
) {
  if (!storage) return;
  try {
    storage.setItem(RECIPIENT_HISTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
  if (typeof window !== "undefined" && storage === window.sessionStorage) {
    window.dispatchEvent(new Event(RECIPIENT_HISTORY_EVENT));
  }
}

function subscribeToRecipientHistory(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === RECIPIENT_HISTORY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(RECIPIENT_HISTORY_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECIPIENT_HISTORY_EVENT, listener);
  };
}

function getRecipientHistorySnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(RECIPIENT_HISTORY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function seedRecord(
  payee: UpiPayee,
  mode: ScanPayMode,
  payeeIndex: number,
  recordIndex: number,
): RecipientPaymentRecord {
  const day = 24 - payeeIndex * 2 - recordIndex;
  const createdAt = `2026-07-${String(day).padStart(2, "0")}T${recordIndex ? "11:15" : "15:00"}:00.000Z`;
  const amount = 500 + payeeIndex * 250 + recordIndex * 400;
  const transactionId = `${mode === "benefits" ? "EBUPI" : "ANQ"}${payeeIndex}${recordIndex}2026`;
  const walletLabel = mode === "benefits" ? "Reimbursement Wallet" : "ANQ";
  const fundingAllocations =
    mode === "benefits"
      ? [{ walletId: "misc" as const, walletLabel, amount }]
      : [];
  const transaction: ScanPayTransaction = {
    paymentContext: { origin: "upi-transfer", recipient: payee },
    payee: {
      kind: "upi",
      name: payee.name,
      upiId: payee.upiId,
      payeeId: payee.id,
    },
    mode,
    amount,
    transactionId,
    paymentMethod: mode === "benefits" ? "UPI" : "ANQ",
    dateTime: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(new Date(createdAt)),
    walletId: "misc",
    walletLabel,
    category: recordIndex ? "Shopping" : "Food",
    outcome: "success",
    cashbackAmount: 0,
    paymentGroupId: `seed-${mode}-${payee.id}-${recordIndex}`,
    fundingAllocations,
  };
  return { payee, transaction, createdAt };
}

function toTransactionItem(record: RecipientPaymentRecord): TransactionItem {
  const { transaction, createdAt, payee } = record;
  const postedOn = createdAt.slice(0, 10);
  return {
    id: `recipient-${transaction.transactionId}`,
    merchant: payee.name,
    paymentMethod: transaction.paymentMethod,
    refId: transaction.transactionId,
    amount: transaction.amount,
    type: "debit",
    dateLabel: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(createdAt)),
    dateTime: transaction.dateTime,
    postedOn,
    monthKey: postedOn.slice(0, 7),
    wallet: "misc",
    icon: "money",
    category: transaction.category ?? "UPI transfer",
    location: "UPI transfer",
    cardMasked: payee.upiId,
    walletName: transaction.walletLabel,
    paymentMode: transaction.paymentMethod,
    transactionId: transaction.transactionId,
    referenceNumber: transaction.transactionId,
    paymentGroupId: transaction.paymentGroupId,
    paymentTotal: transaction.amount,
    fundingAllocations: transaction.fundingAllocations,
  };
}
