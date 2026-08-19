import { describe, expect, it } from "vitest";
import type { ClaimExtract } from "./types";
import {
  CLAIM_DRAFT_LIMIT,
  CLAIM_DRAFT_RETENTION_MS,
  claimDraftFingerprint,
  createClaimDraftStore,
  isClaimDraftEligible,
  isClaimDraftUnsaved,
  restoreClaimExtract,
  type ClaimDraft,
  type ClaimDraftBackend,
} from "./drafts";

class MemoryBackend implements ClaimDraftBackend {
  records = new Map<string, ClaimDraft>();

  async getAll() {
    return [...this.records.values()];
  }

  async putMany(records: ClaimDraft[]) {
    records.forEach((record) => this.records.set(record.id, record));
  }

  async deleteMany(ids: string[]) {
    ids.forEach((id) => this.records.delete(id));
  }

  async clear() {
    this.records.clear();
  }
}

function extract(index = 1): ClaimExtract {
  return {
    fileName: `claim-${index}.png`,
    rawText: "sensitive OCR",
    previewType: "image/png",
    fileBlob: new Blob([`claim-${index}`], { type: "image/png" }),
    vendor: `Merchant ${index}`,
    category: "Meal Wallet",
    amount: String(index * 100),
    claimDate: "2026-08-13",
  };
}

describe("claim draft store", () => {
  it("saves files and fields without raw OCR, then restores the editable claim", async () => {
    const backend = new MemoryBackend();
    const store = createClaimDraftStore(backend, () => 1_000, () => "draft-1");

    const [saved] = await store.save([extract()]);
    expect(saved.extract.rawText).toBe("");
    expect(saved.extract.fileBlob).toBeUndefined();
    expect(saved.fileBlob?.size).toBeGreaterThan(0);
    expect(saved.expiresAt).toBe(1_000 + CLAIM_DRAFT_RETENTION_MS);

    const restored = restoreClaimExtract(saved);
    expect(restored.draftId).toBe("draft-1");
    expect(restored.vendor).toBe("Merchant 1");
    expect(restored.fileBlob).toBe(saved.fileBlob);
  });

  it("updates an existing draft, refreshes expiry, and does not create a duplicate", async () => {
    const backend = new MemoryBackend();
    let clock = 1_000;
    const store = createClaimDraftStore(backend, () => clock, () => "draft-1");
    const [first] = await store.save([extract()]);

    clock = 2_000;
    const changed = {
      ...restoreClaimExtract(first),
      amount: "999",
      fileBlob: undefined,
    };
    const [updated] = await store.save([changed]);

    expect(await store.count()).toBe(1);
    expect(updated.createdAt).toBe(1_000);
    expect(updated.updatedAt).toBe(2_000);
    expect(updated.expiresAt).toBe(2_000 + CLAIM_DRAFT_RETENTION_MS);
    expect(updated.fileBlob).toBe(first.fileBlob);
    expect(updated.extract.draftSavedFingerprint).toBe(
      claimDraftFingerprint(updated.extract),
    );
  });

  it("prunes expired drafts and sorts live drafts newest first", async () => {
    const backend = new MemoryBackend();
    let clock = 100;
    let id = 0;
    const store = createClaimDraftStore(
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

    clock = 100 + CLAIM_DRAFT_RETENTION_MS;
    expect((await store.list()).map((draft) => draft.id)).toEqual(["draft-2"]);
    expect(backend.records.has("draft-1")).toBe(false);
  });

  it("blocks an over-capacity batch without partially writing", async () => {
    const backend = new MemoryBackend();
    let id = 0;
    const store = createClaimDraftStore(
      backend,
      () => 1_000,
      () => `draft-${++id}`,
    );
    await store.save(
      Array.from({ length: CLAIM_DRAFT_LIMIT }, (_, index) => extract(index + 1)),
    );

    await expect(store.save([extract(11)])).rejects.toMatchObject({
      code: "limit",
    });
    expect(await store.count()).toBe(CLAIM_DRAFT_LIMIT);
  });

  it("still updates an existing draft when all ten slots are occupied", async () => {
    const backend = new MemoryBackend();
    let id = 0;
    const store = createClaimDraftStore(
      backend,
      () => 1_000,
      () => `draft-${++id}`,
    );
    const saved = await store.save(
      Array.from({ length: CLAIM_DRAFT_LIMIT }, (_, index) => extract(index + 1)),
    );
    const updated = { ...restoreClaimExtract(saved[0]), amount: "777" };

    await expect(store.save([updated])).resolves.toHaveLength(1);
    expect(await store.count()).toBe(CLAIM_DRAFT_LIMIT);
  });

  it("only treats new unsubmitted claim extracts as draft eligible", () => {
    expect(isClaimDraftEligible(extract())).toBe(true);
    expect(isClaimDraftEligible({ ...extract(), submitted: true })).toBe(false);
    expect(isClaimDraftEligible({ ...extract(), editClaimId: "CLM-1" })).toBe(false);
    expect(isClaimDraftEligible(undefined)).toBe(false);
  });

  it("only treats claim work without a current saved snapshot as unsaved", async () => {
    const current = extract();
    expect(isClaimDraftUnsaved(current)).toBe(true);

    const store = createClaimDraftStore(
      new MemoryBackend(),
      () => 1_000,
      () => "draft-1",
    );
    const [saved] = await store.save([current]);
    const restored = restoreClaimExtract(saved);

    expect(isClaimDraftUnsaved(restored)).toBe(false);
    expect(isClaimDraftUnsaved({ ...restored, amount: "999" })).toBe(true);
    expect(isClaimDraftUnsaved({ ...restored, submitted: true })).toBe(false);
  });

  it("rejects a new draft whose original file is no longer available", async () => {
    const store = createClaimDraftStore(
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
    const store = createClaimDraftStore(
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
