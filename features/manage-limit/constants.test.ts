import { describe, expect, it } from "vitest";
import {
  MANAGE_LIMIT_STORAGE_KEY,
  createDefaultLimitState,
  loadLimitState,
  saveLimitState,
  saveTransactionChannelPreferences,
} from "./constants";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("manage limit channel preferences", () => {
  it("enables POS by default", () => {
    const state = createDefaultLimitState();

    expect(state.online.enabled).toBe(false);
    expect(state.pos.enabled).toBe(true);
    expect(state.contactless.enabled).toBe(false);
  });

  it("keeps POS on when older saved data has no POS preference", () => {
    const storage = createStorage();
    storage.setItem(
      MANAGE_LIMIT_STORAGE_KEY,
      JSON.stringify({
        online: {
          enabled: true,
          dailyLimit: 2000,
          perTxnLimit: 1000,
        },
      }),
    );

    expect(loadLimitState(storage).pos.enabled).toBe(true);
  });

  it("maps onboarding transaction choices to their matching channels", () => {
    const storage = createStorage();

    saveTransactionChannelPreferences(
      { onlineTransactions: true, tapToPay: true },
      storage,
    );

    const state = loadLimitState(storage);
    expect(state.online.enabled).toBe(true);
    expect(state.pos.enabled).toBe(true);
    expect(state.contactless.enabled).toBe(true);
    expect(storage.getItem(MANAGE_LIMIT_STORAGE_KEY)).not.toBeNull();
  });

  it("preserves saved limit amounts while updating channel choices", () => {
    const storage = createStorage();
    const existing = createDefaultLimitState();
    existing.online.dailyLimit = 4200;
    existing.contactless.perTxnLimit = 750;
    saveLimitState(existing, storage);

    saveTransactionChannelPreferences(
      { onlineTransactions: true, tapToPay: false },
      storage,
    );

    const state = loadLimitState(storage);
    expect(state.online.dailyLimit).toBe(4200);
    expect(state.contactless.perTxnLimit).toBe(750);
    expect(state.online.enabled).toBe(true);
    expect(state.pos.enabled).toBe(true);
    expect(state.contactless.enabled).toBe(false);
  });
});
