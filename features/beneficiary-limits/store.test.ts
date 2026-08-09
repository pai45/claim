import { describe, expect, it } from "vitest";
import {
  BENEFICIARY_LIMITS_STORAGE_KEY,
  addBeneficiaryLimit,
  beneficiaryFromDraft,
  createDefaultBeneficiaryLimitState,
  deleteBeneficiaryLimit,
  loadBeneficiaryLimitState,
  resolveBeneficiaryAccount,
  saveBeneficiaryLimitState,
  updateBeneficiaryLimit,
  validateBeneficiaryLimitDraft,
  type BeneficiaryLimitDraft,
} from "./store";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const validDraft: BeneficiaryLimitDraft = {
  name: "John Smith",
  upiId: "john.smith@paytm",
  monthlyLimit: "7500",
  perTransactionLimit: "5000",
};

describe("beneficiary limit store", () => {
  it("creates independent seeded account lists", () => {
    const state = createDefaultBeneficiaryLimitState();

    expect(state.accounts.benefits).toHaveLength(2);
    expect(state.accounts.pluspay).toHaveLength(2);
    expect(state.accounts.benefits[0]).toEqual({
      id: "vishal-sharma",
      name: "Vishal Sharma",
      upiId: "john.doe@paytm",
      monthlyLimit: 6392,
      perTransactionLimit: 6392,
    });
    expect(state.accounts.benefits).not.toBe(state.accounts.pluspay);
  });

  it("round-trips persisted state", () => {
    const storage = memoryStorage();
    const state = createDefaultBeneficiaryLimitState();
    state.accounts.benefits = [];

    saveBeneficiaryLimitState(state, storage);

    expect(loadBeneficiaryLimitState(storage).accounts.benefits).toEqual([]);
    expect(loadBeneficiaryLimitState(storage).accounts.pluspay).toHaveLength(2);
  });

  it("falls back to seeds and removes corrupt storage", () => {
    const storage = memoryStorage();
    storage.setItem(BENEFICIARY_LIMITS_STORAGE_KEY, "{broken");

    const state = loadBeneficiaryLimitState(storage);

    expect(state.accounts.benefits).toHaveLength(2);
    expect(storage.getItem(BENEFICIARY_LIMITS_STORAGE_KEY)).toBeNull();
  });

  it("adds newest first, updates in place, and deletes by id", () => {
    const initial = createDefaultBeneficiaryLimitState();
    const john = beneficiaryFromDraft(validDraft, "john");
    const added = addBeneficiaryLimit(initial, "benefits", john);

    expect(added.accounts.benefits[0]).toEqual(john);
    expect(initial.accounts.benefits).toHaveLength(2);

    const updated = updateBeneficiaryLimit(added, "benefits", {
      ...john,
      name: "John S.",
    });
    expect(updated.accounts.benefits[0].name).toBe("John S.");

    const removed = deleteBeneficiaryLimit(updated, "benefits", "john");
    expect(removed.accounts.benefits.some((item) => item.id === "john")).toBe(
      false,
    );
    expect(removed.accounts.pluspay).toHaveLength(2);
  });

  it("validates UPI uniqueness and limit relationships", () => {
    const existing = createDefaultBeneficiaryLimitState().accounts.benefits;

    expect(validateBeneficiaryLimitDraft(validDraft, existing)).toEqual({});
    expect(
      validateBeneficiaryLimitDraft(
        { ...validDraft, upiId: " JOHN.DOE@PAYTM " },
        existing,
      ).upiId,
    ).toContain("already");
    expect(
      validateBeneficiaryLimitDraft(
        { ...validDraft, perTransactionLimit: "7501" },
        existing,
      ).perTransactionLimit,
    ).toContain("cannot exceed");
    expect(
      validateBeneficiaryLimitDraft(
        { ...validDraft, monthlyLimit: "12.50" },
        existing,
      ).monthlyLimit,
    ).toContain("whole-rupee");
  });

  it("allows an edited beneficiary to retain its own UPI ID", () => {
    const existing = createDefaultBeneficiaryLimitState().accounts.benefits;
    const vishal = existing[0];
    const draft = {
      name: vishal.name,
      upiId: vishal.upiId.toUpperCase(),
      monthlyLimit: String(vishal.monthlyLimit),
      perTransactionLimit: String(vishal.perTransactionLimit),
    };

    expect(validateBeneficiaryLimitDraft(draft, existing, vishal.id)).toEqual(
      {},
    );
  });

  it("resolves requested accounts against persona access", () => {
    expect(resolveBeneficiaryAccount("pluspay", ["benefits", "pluspay"])).toBe(
      "pluspay",
    );
    expect(resolveBeneficiaryAccount("pluspay", ["benefits"])).toBe(
      "benefits",
    );
    expect(resolveBeneficiaryAccount("benefits", ["pluspay"])).toBe(
      "pluspay",
    );
  });
});
