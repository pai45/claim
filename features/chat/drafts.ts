import type { BillExtract } from "@/features/chat/types";

export const BILL_DRAFT_LIMIT = 10;
export const BILL_DRAFT_RETENTION_DAYS = 7;
export const BILL_DRAFT_RETENTION_MS =
  BILL_DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const BILL_DRAFT_DELETE_HINT_KEY =
  "eb-claims:chat-drafts-delete-hint-seen";
export const BILL_DRAFTS_CHANGED_EVENT = "eb-claims:bill-drafts-changed";

const DATABASE_NAME = "eb-claims";
const DATABASE_VERSION = 1;
const STORE_NAME = "bill-drafts";

function notifyBillDraftsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BILL_DRAFTS_CHANGED_EVENT));
  }
}

export function subscribeToBillDrafts(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(BILL_DRAFTS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(BILL_DRAFTS_CHANGED_EVENT, listener);
}

export type BillDraft = {
  version: 1;
  id: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  extract: BillExtract;
  fileBlob?: Blob;
  previewAsset?: string;
};

export type BillDraftErrorCode =
  | "limit"
  | "missing-file"
  | "storage-unavailable";

export class BillDraftError extends Error {
  constructor(
    public readonly code: BillDraftErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BillDraftError";
  }
}

export type BillDraftOperationResult =
  | { ok: true }
  | { ok: false; code: BillDraftErrorCode; message: string };

export interface BillDraftBackend {
  getAll(): Promise<BillDraft[]>;
  putMany(records: BillDraft[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  clear(): Promise<void>;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new BillDraftError(
      "storage-unavailable",
      "Draft storage is unavailable in this browser.",
    );
  }

  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };
  return requestResult(request);
}

class IndexedDbBillDraftBackend implements BillDraftBackend {
  async getAll(): Promise<BillDraft[]> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      return await requestResult(
        transaction.objectStore(STORE_NAME).getAll() as IDBRequest<BillDraft[]>,
      );
    } finally {
      database.close();
    }
  }

  async putMany(records: BillDraft[]): Promise<void> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      records.forEach((record) => store.put(record));
      await transactionDone(transaction);
    } finally {
      database.close();
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      await transactionDone(transaction);
    } finally {
      database.close();
    }
  }

  async clear(): Promise<void> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).clear();
      await transactionDone(transaction);
    } finally {
      database.close();
    }
  }
}

function createDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function billDraftFingerprint(extract: BillExtract): string {
  return JSON.stringify({
    fileName: extract.fileName,
    previewAsset: extract.previewAsset,
    demoScenarioId: extract.demoScenarioId,
    category: extract.category ?? "",
    vendor: extract.vendor || extract.merchant || "",
    amount: extract.amount ?? "",
    billDate: extract.billDate || extract.date || "",
    billingMonth: extract.billingMonth ?? "",
    invoiceNo: extract.invoiceNo ?? "",
    warningAcknowledged: Boolean(extract.warningAcknowledged),
  });
}

export function isBillDraftEligible(extract?: BillExtract): extract is BillExtract {
  return Boolean(extract && !extract.submitted && !extract.editClaimId);
}

/**
 * True only when leaving the chat would lose bill work. A bill whose current
 * fingerprint matches its saved snapshot is already safe in Chat drafts.
 */
export function isBillDraftUnsaved(extract?: BillExtract): extract is BillExtract {
  return Boolean(
    isBillDraftEligible(extract) &&
      (!extract.draftId ||
        extract.draftSavedFingerprint !== billDraftFingerprint(extract)),
  );
}

function sanitizeExtract(
  extract: BillExtract,
  id: string,
  savedAt: number,
): BillExtract {
  const safeExtract = { ...extract };
  delete safeExtract.fileBlob;
  delete safeExtract.previewUrl;
  const next = {
    ...safeExtract,
    rawText: "",
    draftId: id,
    draftSavedAt: savedAt,
  };
  return {
    ...next,
    draftSavedFingerprint: billDraftFingerprint(next),
  };
}

async function resolveFileBlob(
  extract: BillExtract,
): Promise<Blob | undefined> {
  if (typeof Blob !== "undefined" && extract.fileBlob instanceof Blob) {
    return extract.fileBlob;
  }
  if (extract.previewUrl) {
    try {
      const response = await fetch(extract.previewUrl);
      if (response.ok) return await response.blob();
    } catch {
      // Fall through to the missing-file error.
    }
  }
  return undefined;
}

export function createBillDraftStore(
  backend: BillDraftBackend,
  now: () => number = Date.now,
  createId: () => string = createDraftId,
) {
  async function liveDrafts(): Promise<BillDraft[]> {
    const currentTime = now();
    const records = await backend.getAll();
    const expired = records
      .filter((record) => record.expiresAt <= currentTime)
      .map((record) => record.id);
    if (expired.length > 0) await backend.deleteMany(expired);
    return records
      .filter((record) => record.expiresAt > currentTime)
      .sort((left, right) => right.updatedAt - left.updatedAt);
  }

  return {
    async list(): Promise<BillDraft[]> {
      return liveDrafts();
    },

    async get(id: string): Promise<BillDraft | null> {
      const records = await liveDrafts();
      return records.find((record) => record.id === id) ?? null;
    },

    async count(): Promise<number> {
      return (await liveDrafts()).length;
    },

    async save(extracts: BillExtract[]): Promise<BillDraft[]> {
      const eligible = extracts.filter(isBillDraftEligible);
      if (eligible.length === 0) return [];

      const records = await liveDrafts();
      const existingById = new Map(records.map((record) => [record.id, record]));
      const newDraftCount = eligible.filter(
        (extract) => !extract.draftId || !existingById.has(extract.draftId),
      ).length;
      if (records.length + newDraftCount > BILL_DRAFT_LIMIT) {
        throw new BillDraftError(
          "limit",
          `You can save up to ${BILL_DRAFT_LIMIT} bill drafts. Delete or submit one before saving another.`,
        );
      }

      const savedAt = now();
      const prepared = await Promise.all(
        eligible.map(async (extract) => {
          const existing = extract.draftId
            ? existingById.get(extract.draftId)
            : undefined;
          const id = existing?.id ?? createId();
          const hasFileSource = Boolean(extract.fileBlob || extract.previewUrl);
          const fileBlob = extract.previewAsset
            ? undefined
            : hasFileSource
              ? await resolveFileBlob(extract)
              : existing?.fileBlob;
          const previewAsset = extract.previewAsset
            ? extract.previewAsset
            : hasFileSource
              ? undefined
              : existing?.previewAsset;
          if (!fileBlob && !previewAsset) {
            throw new BillDraftError(
              "missing-file",
              "This bill file is no longer available. Replace the bill before saving it as a draft.",
            );
          }
          return {
            version: 1 as const,
            id,
            createdAt: existing?.createdAt ?? savedAt,
            updatedAt: savedAt,
            expiresAt: savedAt + BILL_DRAFT_RETENTION_MS,
            extract: sanitizeExtract(extract, id, savedAt),
            fileBlob,
            previewAsset,
          };
        }),
      );

      await backend.putMany(prepared);
      notifyBillDraftsChanged();
      return prepared.sort((left, right) => right.updatedAt - left.updatedAt);
    },

    async delete(id: string): Promise<void> {
      await backend.deleteMany([id]);
      notifyBillDraftsChanged();
    },

    async prune(): Promise<number> {
      const before = await backend.getAll();
      await liveDrafts();
      return before.filter((record) => record.expiresAt <= now()).length;
    },

    async clear(): Promise<void> {
      await backend.clear();
      notifyBillDraftsChanged();
    },
  };
}

export const billDraftStore = createBillDraftStore(
  new IndexedDbBillDraftBackend(),
);

export function clearBillDraftsBestEffort(): void {
  if (typeof indexedDB === "undefined") return;
  void billDraftStore.clear().catch(() => {
    // Demo reset remains usable when browser storage is blocked.
  });
}

export function restoreBillExtract(draft: BillDraft): BillExtract {
  return {
    ...draft.extract,
    rawText: "",
    previewAsset: draft.previewAsset,
    previewType: draft.extract.previewType || draft.fileBlob?.type,
    fileBlob: draft.fileBlob,
    draftId: draft.id,
    draftSavedAt: draft.updatedAt,
    draftSavedFingerprint: billDraftFingerprint(draft.extract),
  };
}
