import { useSyncExternalStore } from "react";
import type { BankRecipient } from "@/features/bank-transfer/validation";
import { maskAccountNumber } from "@/features/bank-transfer/validation";
import type { PersonaId } from "@/features/persona/types";
import type { ScanPayTransaction } from "@/features/scan-pay/types";
import type { TransactionItem } from "@/features/transactions/constants";

export const BANK_TRANSFER_HISTORY_STORAGE_KEY =
  "eb-claims:bank-transfer-history:v1";
const BANK_TRANSFER_HISTORY_VERSION = 1;
const BANK_TRANSFER_HISTORY_EVENT =
  "eb-claims:bank-transfer-history-updated";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type BankBeneficiary = BankRecipient & {
  id: string;
  initials: string;
};

export type BankTransferRecord = {
  beneficiary: BankBeneficiary;
  transaction: ScanPayTransaction;
  createdAt: string;
};

type PersistedBankTransferHistory = {
  version: typeof BANK_TRANSFER_HISTORY_VERSION;
  personas: Partial<Record<PersonaId, BankTransferRecord[]>>;
};

const SEEDED_BENEFICIARY_INPUTS = [
  {
    accountHolder: "Ananya Rao",
    accountNumber: "123456789012",
    ifsc: "HDFC0001234",
    amount: 2_500,
    createdAt: "2026-07-24T15:00:00.000Z",
  },
  {
    accountHolder: "Deevanshu Sharma",
    accountNumber: "405067890174",
    ifsc: "ICIC0000456",
    amount: 1_200,
    createdAt: "2026-07-20T11:15:00.000Z",
  },
  {
    accountHolder: "Anjali Kumar",
    accountNumber: "630217843321",
    ifsc: "SBIN0006789",
    amount: 4_000,
    createdAt: "2026-07-16T15:00:00.000Z",
  },
  {
    accountHolder: "Sneha Roy",
    accountNumber: "910233445864",
    ifsc: "UTIB0002468",
    amount: 850,
    createdAt: "2026-07-12T11:15:00.000Z",
  },
] as const;

export const SEEDED_BANK_TRANSFER_RECORDS: readonly BankTransferRecord[] =
  SEEDED_BENEFICIARY_INPUTS.map((input, index) => {
    const recipient: BankRecipient = {
      accountHolder: input.accountHolder,
      accountNumber: input.accountNumber,
      ifsc: input.ifsc,
    };
    const beneficiary = beneficiaryFromRecipient(recipient);
    const transaction: ScanPayTransaction = {
      paymentContext: { origin: "bank-transfer", recipient },
      payee: {
        kind: "bank-transfer",
        name: input.accountHolder,
        accountNumber: input.accountNumber,
        ifsc: input.ifsc,
      },
      mode: "benefits",
      amount: input.amount,
      transactionId: `EBBANK20260${index + 1}`,
      paymentMethod: "Bank Transfer",
      dateTime: formatDateTime(input.createdAt),
      walletId: "misc",
      walletLabel: "Reimbursement Wallet",
      category: "Finance",
      subcategory: "Bank",
      outcome: "success",
      cashbackAmount: 0,
      paymentGroupId: `seed-bank-transfer-${index + 1}`,
      fundingAllocations: [
        {
          walletId: "misc",
          walletLabel: "Reimbursement Wallet",
          amount: input.amount,
        },
      ],
    };
    return { beneficiary, transaction, createdAt: input.createdAt };
  });

export function getSavedBankBeneficiaries(
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): BankBeneficiary[] {
  const records = getBankTransferRecords(personaId, storage).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  const beneficiaries = new Map<string, BankBeneficiary>();
  for (const record of records) {
    const key = beneficiaryKey(record.beneficiary);
    if (!beneficiaries.has(key)) beneficiaries.set(key, record.beneficiary);
  }
  return [...beneficiaries.values()];
}

export function getBankBeneficiary(
  beneficiaryId: string,
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): BankBeneficiary | undefined {
  return getSavedBankBeneficiaries(personaId, storage).find(
    (beneficiary) => beneficiary.id === beneficiaryId,
  );
}

export function getBankBeneficiaryHistory(
  beneficiaryId: string,
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): BankTransferRecord[] {
  const beneficiary = getBankBeneficiary(beneficiaryId, personaId, storage);
  if (!beneficiary) return [];
  const key = beneficiaryKey(beneficiary);
  return getBankTransferRecords(personaId, storage)
    .filter((record) => beneficiaryKey(record.beneficiary) === key)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getBankTransferHistoryTransaction(
  transactionId: string,
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): TransactionItem | undefined {
  const record = getBankTransferRecords(personaId, storage).find(
    (item) => item.transaction.transactionId === transactionId,
  );
  return record ? toTransactionItem(record) : undefined;
}

export function recordBankTransfer(
  personaId: PersonaId,
  transaction: ScanPayTransaction,
  storage: StorageLike | null = defaultStorage(),
  createdAt = new Date().toISOString(),
): boolean {
  if (
    transaction.outcome !== "success" ||
    transaction.paymentContext.origin !== "bank-transfer" ||
    transaction.payee.kind !== "bank-transfer"
  ) {
    return false;
  }

  const persisted = readPersistedHistory(storage);
  const records = persisted.personas[personaId] ?? [];
  if (
    records.some(
      (record) =>
        record.transaction.paymentGroupId === transaction.paymentGroupId,
    )
  ) {
    return false;
  }

  const beneficiary = beneficiaryFromRecipient(
    transaction.paymentContext.recipient,
  );
  const record: BankTransferRecord = {
    beneficiary,
    transaction,
    createdAt,
  };
  writePersistedHistory(
    {
      ...persisted,
      personas: {
        ...persisted.personas,
        [personaId]: [record, ...records],
      },
    },
    storage,
  );
  return true;
}

export function getBankTransferRecords(
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): BankTransferRecord[] {
  const persisted = readPersistedHistory(storage).personas[personaId] ?? [];
  return personaId === "returning"
    ? [...persisted, ...SEEDED_BANK_TRANSFER_RECORDS]
    : [...persisted];
}

export function useBankTransferHistoryVersion(): string | null {
  return useSyncExternalStore(
    subscribeToBankTransferHistory,
    getBankTransferHistorySnapshot,
    () => null,
  );
}

export function beneficiaryFromRecipient(
  recipient: BankRecipient,
): BankBeneficiary {
  const accountHolder = recipient.accountHolder.trim();
  const accountNumber = recipient.accountNumber.replace(/\D/g, "");
  const ifsc = recipient.ifsc.replace(/\s/g, "").toUpperCase();
  return {
    id: `bank-${ifsc.toLowerCase()}-${accountNumber}`,
    accountHolder,
    accountNumber,
    ifsc,
    initials: initialsForName(accountHolder),
  };
}

function beneficiaryKey(recipient: BankRecipient): string {
  return `${recipient.accountNumber.replace(/\D/g, "")}:${recipient.ifsc
    .replace(/\s/g, "")
    .toUpperCase()}`;
}

function readPersistedHistory(
  storage: StorageLike | null,
): PersistedBankTransferHistory {
  const empty: PersistedBankTransferHistory = {
    version: BANK_TRANSFER_HISTORY_VERSION,
    personas: {},
  };
  if (!storage) return empty;
  try {
    const raw = storage.getItem(BANK_TRANSFER_HISTORY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedBankTransferHistory>;
    if (
      parsed.version !== BANK_TRANSFER_HISTORY_VERSION ||
      !parsed.personas ||
      typeof parsed.personas !== "object"
    ) {
      storage.removeItem(BANK_TRANSFER_HISTORY_STORAGE_KEY);
      return empty;
    }
    return {
      version: BANK_TRANSFER_HISTORY_VERSION,
      personas: parsed.personas,
    };
  } catch {
    return empty;
  }
}

function writePersistedHistory(
  state: PersistedBankTransferHistory,
  storage: StorageLike | null,
) {
  if (!storage) return;
  try {
    storage.setItem(BANK_TRANSFER_HISTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
  if (typeof window !== "undefined" && storage === window.sessionStorage) {
    window.dispatchEvent(new Event(BANK_TRANSFER_HISTORY_EVENT));
  }
}

function subscribeToBankTransferHistory(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === BANK_TRANSFER_HISTORY_STORAGE_KEY ||
      event.key === null
    ) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BANK_TRANSFER_HISTORY_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BANK_TRANSFER_HISTORY_EVENT, listener);
  };
}

function getBankTransferHistorySnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(BANK_TRANSFER_HISTORY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function initialsForName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "BA"
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(value));
}

function toTransactionItem(record: BankTransferRecord): TransactionItem {
  const { beneficiary, transaction, createdAt } = record;
  const postedOn = createdAt.slice(0, 10);
  return {
    id: `bank-history-${transaction.transactionId}`,
    merchant: beneficiary.accountHolder,
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
    category: "Finance / Bank",
    location: "Online transfer",
    cardMasked: maskAccountNumber(beneficiary.accountNumber),
    walletName: transaction.walletLabel,
    paymentMode: transaction.paymentMethod,
    transactionId: transaction.transactionId,
    referenceNumber: transaction.transactionId,
    paymentGroupId: transaction.paymentGroupId,
    paymentTotal: transaction.amount,
    fundingAllocations: transaction.fundingAllocations,
  };
}
