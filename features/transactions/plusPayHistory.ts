import { useSyncExternalStore } from "react";
import { getPersonaConfig } from "@/features/persona/constants";
import type { PersonaId } from "@/features/persona/types";
import type {
  ScanPayTransaction,
  ScanPayOutcome,
} from "@/features/scan-pay/types";
import {
  TRANSACTION_MAX_MONTH,
  TRANSACTION_MONTHS,
  type TransactionIconId,
} from "@/features/transactions/constants";

export const PLUSPAY_HISTORY_STORAGE_KEY =
  "eb-claims:pluspay-history:v1";
const PLUSPAY_HISTORY_VERSION = 1;
const PLUSPAY_HISTORY_EVENT = "eb-claims:pluspay-history-updated";

export type PlusPayTransactionItem = {
  id: string;
  merchant: string;
  paymentMethod: string;
  upiId: string;
  refId: string;
  amount: number;
  type: "debit" | "credit";
  dateLabel: string;
  dateTime: string;
  postedOn: string;
  monthKey: string;
  icon: TransactionIconId;
  category: string;
  location: string;
  accountName: "ANQ";
  paymentMode: string;
  transactionId: string;
  referenceNumber: string;
  paymentGroupId: string;
  kind: "merchant" | "transfer";
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PersistedPlusPayHistory = {
  version: typeof PLUSPAY_HISTORY_VERSION;
  personas: Partial<Record<PersonaId, PlusPayTransactionItem[]>>;
};

type PlusPaySeed = {
  id: string;
  merchant: string;
  upiId: string;
  amount: number;
  postedOn: string;
  time: string;
  refId: string;
  category: string;
  kind: PlusPayTransactionItem["kind"];
};

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

const PLUSPAY_SEEDS: readonly PlusPaySeed[] = [
  { id: "pp-zomato", merchant: "Zomato", upiId: "zomato@paytm", amount: 650, postedOn: "2026-08-28", time: "13:20", refId: "ANQ28082601", category: "Food", kind: "merchant" },
  { id: "pp-deevanshu", merchant: "Deevanshu Sharma", upiId: "deevanshu@paytm", amount: 500, postedOn: "2026-08-24", time: "15:00", refId: "ANQ24082602", category: "UPI transfer", kind: "transfer" },
  { id: "pp-amazon", merchant: "Amazon", upiId: "amazon@pay", amount: 1500, postedOn: "2026-08-22", time: "18:45", refId: "ANQ22082603", category: "Shopping", kind: "merchant" },
  { id: "pp-anjali", merchant: "Anjali Kumar", upiId: "anjali.kumar@paytm", amount: 750, postedOn: "2026-08-20", time: "11:15", refId: "ANQ20082604", category: "UPI transfer", kind: "transfer" },
  { id: "pp-swiggy", merchant: "Swiggy", upiId: "swiggy@paytm", amount: 420, postedOn: "2026-08-16", time: "20:10", refId: "ANQ16082605", category: "Food", kind: "merchant" },
  { id: "pp-sneha", merchant: "Sneha Roy", upiId: "sneha.roy@paytm", amount: 1200, postedOn: "2026-08-12", time: "09:35", refId: "ANQ12082606", category: "UPI transfer", kind: "transfer" },
  { id: "pp-bookmyshow", merchant: "BookMyShow", upiId: "bookmyshow@pay", amount: 480, postedOn: "2026-07-26", time: "17:50", refId: "ANQ26072607", category: "Entertainment", kind: "merchant" },
  { id: "pp-freshmenu", merchant: "FreshMenu", upiId: "freshmenu@paytm", amount: 725, postedOn: "2026-07-18", time: "12:30", refId: "ANQ18072608", category: "Food", kind: "merchant" },
];

const SEEDED_ITEMS = PLUSPAY_SEEDS.map(seedItem);

export function getPlusPayTransactionItems(
  personaId: PersonaId,
  includePersisted = true,
  storage: StorageLike | null = defaultStorage(),
): PlusPayTransactionItem[] {
  const persona = getPersonaConfig(personaId);
  if (!persona.access.products.plusPay) return [];

  const seeded = persona.hasTransactions ? SEEDED_ITEMS : [];
  const persisted = includePersisted
    ? readPlusPayHistory(storage).personas[personaId] ?? []
    : [];
  const items = new Map<string, PlusPayTransactionItem>();
  for (const item of [...persisted, ...seeded]) {
    if (!items.has(item.paymentGroupId)) items.set(item.paymentGroupId, item);
  }
  return [...items.values()].sort(sortNewestFirst);
}

export function getPlusPayTransaction(
  id: string,
  personaId: PersonaId,
  includePersisted = true,
  storage: StorageLike | null = defaultStorage(),
): PlusPayTransactionItem | undefined {
  return getPlusPayTransactionItems(personaId, includePersisted, storage).find(
    (item) => item.id === id || item.transactionId === id,
  );
}

export function filterPlusPayTransactionsByMonth(
  items: readonly PlusPayTransactionItem[],
  monthKey: string,
): PlusPayTransactionItem[] {
  return items.filter((item) => item.monthKey === monthKey);
}

export function groupPlusPayTransactions(
  items: readonly PlusPayTransactionItem[],
): { group: string; label: string; items: PlusPayTransactionItem[] }[] {
  const monthKeys = [...new Set(items.map((item) => item.monthKey))]
    .sort()
    .reverse();
  return monthKeys.map((monthKey) => ({
    group: monthKey,
    label:
      monthKey === TRANSACTION_MAX_MONTH
        ? "Current Month"
        : TRANSACTION_MONTHS.find((month) => month.key === monthKey)?.label ??
          monthKey,
    items: items
      .filter((item) => item.monthKey === monthKey)
      .sort(sortNewestFirst),
  }));
}

export function recordPlusPayTransaction(
  personaId: PersonaId,
  transaction: ScanPayTransaction,
  storage: StorageLike | null = defaultStorage(),
  now = new Date(),
): boolean {
  if (
    transaction.mode !== "pluspay" ||
    transaction.outcome !== ("success" satisfies ScanPayOutcome)
  ) {
    return false;
  }

  const persisted = readPlusPayHistory(storage);
  const current = persisted.personas[personaId] ?? [];
  if (
    current.some(
      (item) =>
        item.paymentGroupId === transaction.paymentGroupId ||
        item.transactionId === transaction.transactionId,
    )
  ) {
    return false;
  }

  const next: PersistedPlusPayHistory = {
    ...persisted,
    personas: {
      ...persisted.personas,
      [personaId]: [toPlusPayItem(transaction, now), ...current],
    },
  };
  writePlusPayHistory(next, storage);
  return true;
}

export function usePlusPayHistoryVersion(): string | null {
  return useSyncExternalStore(
    subscribeToPlusPayHistory,
    getPlusPayHistorySnapshot,
    () => null,
  );
}

function seedItem(seed: PlusPaySeed): PlusPayTransactionItem {
  const date = new Date(`${seed.postedOn}T${seed.time}:00.000Z`);
  return {
    id: seed.id,
    merchant: seed.merchant,
    paymentMethod: "ANQ",
    upiId: seed.upiId,
    refId: seed.refId,
    amount: seed.amount,
    type: "debit",
    dateLabel: DATE_LABEL_FORMATTER.format(date),
    dateTime: DATE_TIME_FORMATTER.format(date),
    postedOn: seed.postedOn,
    monthKey: seed.postedOn.slice(0, 7),
    icon: seed.kind === "merchant" ? "bag" : "money",
    category: seed.category,
    location: seed.kind === "merchant" ? "Online payment" : "UPI transfer",
    accountName: "ANQ",
    paymentMode: "ANQ",
    transactionId: seed.refId,
    referenceNumber: seed.refId,
    paymentGroupId: `seed-${seed.id}`,
    kind: seed.kind,
  };
}

function toPlusPayItem(
  transaction: ScanPayTransaction,
  now: Date,
): PlusPayTransactionItem {
  const postedOn = now.toISOString().slice(0, 10);
  const isTransfer = transaction.paymentContext.origin === "upi-transfer";
  const upiId =
    transaction.payee.kind === "bank-transfer"
      ? transaction.payee.accountNumber
      : transaction.payee.upiId;
  return {
    id: `pluspay-${transaction.transactionId}`,
    merchant: transaction.payee.name,
    paymentMethod: transaction.paymentMethod,
    upiId,
    refId: transaction.transactionId,
    amount: transaction.amount,
    type: "debit",
    dateLabel: DATE_LABEL_FORMATTER.format(now),
    dateTime: transaction.dateTime,
    postedOn,
    monthKey: postedOn.slice(0, 7),
    icon: isTransfer ? "money" : "bag",
    category: transaction.category ?? (isTransfer ? "UPI transfer" : "Scan & Pay"),
    location: isTransfer ? "UPI transfer" : "Online payment",
    accountName: "ANQ",
    paymentMode: transaction.paymentMethod,
    transactionId: transaction.transactionId,
    referenceNumber: transaction.transactionId,
    paymentGroupId: transaction.paymentGroupId,
    kind: isTransfer ? "transfer" : "merchant",
  };
}

function readPlusPayHistory(
  storage: StorageLike | null,
): PersistedPlusPayHistory {
  const empty: PersistedPlusPayHistory = {
    version: PLUSPAY_HISTORY_VERSION,
    personas: {},
  };
  if (!storage) return empty;
  try {
    const raw = storage.getItem(PLUSPAY_HISTORY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedPlusPayHistory>;
    if (
      parsed.version !== PLUSPAY_HISTORY_VERSION ||
      !parsed.personas ||
      typeof parsed.personas !== "object"
    ) {
      storage.removeItem(PLUSPAY_HISTORY_STORAGE_KEY);
      return empty;
    }
    return {
      version: PLUSPAY_HISTORY_VERSION,
      personas: parsed.personas,
    };
  } catch {
    return empty;
  }
}

function writePlusPayHistory(
  state: PersistedPlusPayHistory,
  storage: StorageLike | null,
) {
  if (!storage) return;
  try {
    storage.setItem(PLUSPAY_HISTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
  if (typeof window !== "undefined" && storage === window.sessionStorage) {
    window.dispatchEvent(new Event(PLUSPAY_HISTORY_EVENT));
  }
}

function subscribeToPlusPayHistory(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === PLUSPAY_HISTORY_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(PLUSPAY_HISTORY_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PLUSPAY_HISTORY_EVENT, listener);
  };
}

function getPlusPayHistorySnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(PLUSPAY_HISTORY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function sortNewestFirst(
  left: PlusPayTransactionItem,
  right: PlusPayTransactionItem,
): number {
  const dateOrder = right.postedOn.localeCompare(left.postedOn);
  return dateOrder === 0 ? left.id.localeCompare(right.id) : dateOrder;
}
