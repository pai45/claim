import { describe, expect, it } from "vitest";
import type { BillExtract } from "./types";
import {
  BILL_DRAFT_LIMIT,
  BILL_DRAFT_RETENTION_MS,
  billDraftFingerprint,
  createBillDraftStore,
  isBillDraftEligible,
  isBillDraftUnsaved,
  restoreBillExtract,
  type BillDraft,
  type BillDraftBackend,
} from "./drafts";

class MemoryBackend implements BillDraftBackend {
  records = new Map<string, BillDraft>();

  async getAll() {
    return [...this.records.values()];
  }

  async putMany(records: BillDraft[]) {
    records.forEach((record) => this.records.set(record.id, record));
  }

  async deleteMany(ids: string[]) {
    ids.forEach((id) => this.records.delete(id));
  }

  async clear() {
    this.records.clear();
  }
}

function extract(index = 1): BillExtract {
  return {
    fileName: `bill-${index}.png`,
    rawText: "sensitive OCR",
    previewType: "image/png",
    fileBlob: new Blob([`bill-${index}`], { type: "image/png" }),
    vendor: `Merchant ${index}`,
    category: "Meal Wallet",
    amount: String(index * 100),
    billDate: "2026-08-13",
  };
}

describe("bill draft store", () => {
  it("saves files and fields without raw OCR, then restores the editable bill", async () => {
    const backend = new MemoryBackend();
    const store = createBillDraftStore(backend, () => 1_000, () => "draft-1");

    const [saved] = await store.save([extract()]);
    expect(saved.extract.rawText).toBe("");
    expect(saved.extract.fileBlob).toBeUndefined();
    expect(saved.fileBlob?.size).toBeGreaterThan(0);
    expect(saved.expiresAt).toBe(1_000 + BILL_DRAFT_RETENTION_MS);

    const restored = restoreBillExtract(saved);
    expect(restored.draftId).toBe("draft-1");
    expect(restored.vendor).toBe("Merchant 1");
    expect(restored.fileBlob).toBe(saved.fileBlob);
  });

  it("updates an existing draft, refreshes expiry, and does not create a duplicate", async () => {
    const backend = new MemoryBackend();
    let clock = 1_000;
    const store = createBillDraftStore(backend, () => clock, () => "draft-1");
    const [first] = await store.save([extract()]);

    clock = 2_000;
    const changed = {
      ...restoreBillExtract(first),
      amount: "999",
      fileBlob: undefined,
    };
    const [updated] = await store.save([changed]);

    expect(await store.count()).toBe(1);
    expect(updated.createdAt).toBe(1_000);
    expect(updated.updatedAt).toBe(2_000);
    expect(updated.expiresAt).toBe(2_000 + BILL_DRAFT_RETENTION_MS);
    expect(updated.fileBlob).toBe(first.fileBlob);
    expect(updated.extract.draftSavedFingerprint).toBe(
      billDraftFingerprint(updated.extract),
    );
  });

  it("prunes expired drafts and sorts live drafts newest first", async () => {
    const backend = new MemoryBackend();
    let clock = 100;
    let id = 0;
    const store = createBillDraftStore(
      backend,
      () => clock,
      () => `draft-${++id}`,
    );
    await store.save([extract(1)]);
    clock = 200;
    await store.save([extract(2)]);
    expect((await store.list()).map((draft) => draft.id)).toEqual([
      "draft-2",
      "draft-1",
    ]);

    clock = 100 + BILL_DRAFT_RETENTION_MS;
    expect((await store.list()).map((draft) => draft.id)).toEqual(["draft-2"]);
    expect(backend.records.has("draft-1")).toBe(false);
  });

  it("blocks an over-capacity batch without partially writing", async () => {
    const backend = new MemoryBackend();
    let id = 0;
    const store = createBillDraftStore(
      backend,
      () => 1_000,
      () => `draft-${++id}`,
    );
    await store.save(
      Array.from({ length: BILL_DRAFT_LIMIT }, (_, index) => extract(index + 1)),
    );

    await expect(store.save([extract(11)])).rejects.toMatchObject({
      code: "limit",
    });
    expect(await store.count()).toBe(BILL_DRAFT_LIMIT);
  });

  it("still updates an existing draft when all ten slots are occupied", async () => {
    const backend = new MemoryBackend();
    let id = 0;
    const store = createBillDraftStore(
      backend,
      () => 1_000,
      () => `draft-${++id}`,
    );
    const saved = await store.save(
      Array.from({ length: BILL_DRAFT_LIMIT }, (_, index) => extract(index + 1)),
    );
    const updated = { ...restoreBillExtract(saved[0]), amount: "777" };

    await expect(store.save([updated])).resolves.toHaveLength(1);
    expect(await store.count()).toBe(BILL_DRAFT_LIMIT);
  });

  it("only treats new unsubmitted bill extracts as draft eligible", () => {
    expect(isBillDraftEligible(extract())).toBe(true);
    expect(isBillDraftEligible({ ...extract(), submitted: true })).toBe(false);
    expect(isBillDraftEligible({ ...extract(), editClaimId: "CLM-1" })).toBe(false);
    expect(isBillDraftEligible(undefined)).toBe(false);
  });

  it("only treats bill work without a current saved snapshot as unsaved", async () => {
    const current = extract();
    expect(isBillDraftUnsaved(current)).toBe(true);

    const store = createBillDraftStore(
      new MemoryBackend(),
      () => 1_000,
      () => "draft-1",
    );
    const [saved] = await store.save([current]);
    const restored = restoreBillExtract(saved);

    expect(isBillDraftUnsaved(restored)).toBe(false);
    expect(isBillDraftUnsaved({ ...restored, amount: "999" })).toBe(true);
    expect(isBillDraftUnsaved({ ...restored, submitted: true })).toBe(false);
  });

  it("rejects a new draft whose original file is no longer available", async () => {
    const store = createBillDraftStore(
      new MemoryBackend(),
      () => 1_000,
      () => "draft-1",
    );
    const missingFile = { ...extract(), fileBlob: undefined };

    await expect(store.save([missingFile])).rejects.toMatchObject({
      code: "missing-file",
    });
    expect(await store.count()).toBe(0);
  });

  it("deletes one draft and clears all drafts", async () => {
    const backend = new MemoryBackend();
    let id = 0;
    const store = createBillDraftStore(
      backend,
      () => 1_000,
      () => `draft-${++id}`,
    );
    const saved = await store.save([extract(1), extract(2)]);
    await store.delete(saved[0].id);
    expect(await store.count()).toBe(1);
    await store.clear();
    expect(await store.count()).toBe(0);
  });
});
