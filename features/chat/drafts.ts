import type { ClaimExtract } from "@/features/chat/types";

export const CLAIM_DRAFT_LIMIT = 10;
export const CLAIM_DRAFT_RETENTION_DAYS = 7;
export const CLAIM_DRAFT_RETENTION_MS =
  CLAIM_DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const CLAIM_DRAFT_DELETE_HINT_KEY =
  "eb-claims:chat-drafts-delete-hint-seen";
export const CLAIM_DRAFTS_CHANGED_EVENT = "eb-claims:claim-drafts-changed";

const DATABASE_NAME = "eb-claims";
const DATABASE_VERSION = 2;
const STORE_NAME = "claim-drafts";

function notifyClaimDraftsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLAIM_DRAFTS_CHANGED_EVENT));
  }
}

export function subscribeToClaimDrafts(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CLAIM_DRAFTS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(CLAIM_DRAFTS_CHANGED_EVENT, listener);
}

export type ClaimDraft = {
  version: 1;
  id: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  extract: ClaimExtract;
  fileBlob?: Blob;
  previewAsset?: string;
};

export type ClaimDraftErrorCode =
  | "limit"
  | "missing-file"
  | "storage-unavailable";

export class ClaimDraftError extends Error {
  constructor(
    public readonly code: ClaimDraftErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ClaimDraftError";
  }
}

export type ClaimDraftOperationResult =
  | { ok: true }
  | { ok: false; code: ClaimDraftErrorCode; message: string };

export interface ClaimDraftBackend {
  getAll(): Promise<ClaimDraft[]>;
  putMany(records: ClaimDraft[]): Promise<void>;
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
    throw new ClaimDraftError(
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

class IndexedDbClaimDraftBackend implements ClaimDraftBackend {
  async getAll(): Promise<ClaimDraft[]> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      return await requestResult(
        transaction.objectStore(STORE_NAME).getAll() as IDBRequest<ClaimDraft[]>,
      );
    } finally {
      database.close();
    }
  }

  async putMany(records: ClaimDraft[]): Promise<void> {
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

export function claimDraftFingerprint(extract: ClaimExtract): string {
  return JSON.stringify({
    fileName: extract.fileName,
    previewAsset: extract.previewAsset,
    demoScenarioId: extract.demoScenarioId,
    category: extract.category ?? "",
    vendor: extract.vendor || extract.merchant || "",
    amount: extract.amount ?? "",
    claimDate: extract.claimDate || extract.date || "",
    claimMonth: extract.claimMonth ?? "",
    invoiceNo: extract.invoiceNo ?? "",
    warningAcknowledged: Boolean(extract.warningAcknowledged),
  });
}

export function isClaimDraftEligible(extract?: ClaimExtract): extract is ClaimExtract {
  return Boolean(extract && !extract.submitted && !extract.editClaimId);
}

/**
 * True only when leaving the chat would lose claim work. A claim whose current
 * fingerprint matches its saved snapshot is already safe in Chat drafts.
 */
export function isClaimDraftUnsaved(extract?: ClaimExtract): extract is ClaimExtract {
  return Boolean(
    isClaimDraftEligible(extract) &&
      (!extract.draftId ||
        extract.draftSavedFingerprint !== claimDraftFingerprint(extract)),
  );
}

function sanitizeExtract(
  extract: ClaimExtract,
  id: string,
  savedAt: number,
): ClaimExtract {
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
    draftSavedFingerprint: claimDraftFingerprint(next),
  };
}

async function resolveFileBlob(
  extract: ClaimExtract,
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

export function createClaimDraftStore(
  backend: ClaimDraftBackend,
  now: () => number = Date.now,
  createId: () => string = createDraftId,
) {
  async function liveDrafts(): Promise<ClaimDraft[]> {
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
    async list(): Promise<ClaimDraft[]> {
      return liveDrafts();
    },

    async get(id: string): Promise<ClaimDraft | null> {
      const records = await liveDrafts();
      return records.find((record) => record.id === id) ?? null;
    },

    async count(): Promise<number> {
      return (await liveDrafts()).length;
    },

    async save(extracts: ClaimExtract[]): Promise<ClaimDraft[]> {
      const eligible = extracts.filter(isClaimDraftEligible);
      if (eligible.length === 0) return [];

      const records = await liveDrafts();
      const existingById = new Map(records.map((record) => [record.id, record]));
      const newDraftCount = eligible.filter(
        (extract) => !extract.draftId || !existingById.has(extract.draftId),
      ).length;
      if (records.length + newDraftCount > CLAIM_DRAFT_LIMIT) {
        throw new ClaimDraftError(
          "limit",
          `You can save up to ${CLAIM_DRAFT_LIMIT} claim drafts. Delete or submit one before saving another.`,
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
            throw new ClaimDraftError(
              "missing-file",
              "This claim file is no longer available. Replace the claim before saving it as a draft.",
            );
          }
          return {
            version: 1 as const,
            id,
            createdAt: existing?.createdAt ?? savedAt,
            updatedAt: savedAt,
            expiresAt: savedAt + CLAIM_DRAFT_RETENTION_MS,
            extract: sanitizeExtract(extract, id, savedAt),
            fileBlob,
            previewAsset,
          };
        }),
      );

      await backend.putMany(prepared);
      notifyClaimDraftsChanged();
      return prepared.sort((left, right) => right.updatedAt - left.updatedAt);
    },

    async delete(id: string): Promise<void> {
      await backend.deleteMany([id]);
      notifyClaimDraftsChanged();
    },

    async prune(): Promise<number> {
      const before = await backend.getAll();
      await liveDrafts();
      return before.filter((record) => record.expiresAt <= now()).length;
    },

    async clear(): Promise<void> {
      await backend.clear();
      notifyClaimDraftsChanged();
    },
  };
}

export const claimDraftStore = createClaimDraftStore(
  new IndexedDbClaimDraftBackend(),
);

export function clearClaimDraftsBestEffort(): void {
  if (typeof indexedDB === "undefined") return;
  void claimDraftStore.clear().catch(() => {
    // Demo reset remains usable when browser storage is blocked.
  });
}

export function restoreClaimExtract(draft: ClaimDraft): ClaimExtract {
  return {
    ...draft.extract,
    rawText: "",
    previewAsset: draft.previewAsset,
    previewType: draft.extract.previewType || draft.fileBlob?.type,
    fileBlob: draft.fileBlob,
    draftId: draft.id,
    draftSavedAt: draft.updatedAt,
    draftSavedFingerprint: claimDraftFingerprint(draft.extract),
  };
}
