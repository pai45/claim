import { describe, expect, it } from "vitest";
import {
  CHAT_STORAGE_KEY,
  clearChatSession,
  createPersistedChatSession,
  loadChatSession,
  saveChatSession,
} from "./persistence";
import { appDataPayloadForResolution } from "@/lib/assistant/appData";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("chat persistence", () => {
  it("removes previews and raw OCR text before saving", () => {
    const session = createPersistedChatSession(
      {
        messages: [
          {
            id: "1",
            role: "assistant",
            content: "review",
            createdAt: 1,
            kind: "bill_extract",
            billExtract: {
              fileName: "bill.png",
              rawText: "sensitive raw text",
              previewUrl: "blob:secret",
              vendor: "Merchant",
            },
          },
        ],
        driverSalaryDraft: { driverName: "Ramesh", dlRawText: "raw dl" },
        activeBenefitType: null,
        activePolicyCategory: null,
        activeAppDataContext: null,
      },
      1000,
    );
    expect(session.messages[0].billExtract?.rawText).toBe("");
    expect(session.messages[0].billExtract?.previewUrl).toBeUndefined();
    expect(session.driverSalaryDraft.dlRawText).toBeUndefined();
  });

  it("restores valid state and removes expired or corrupt state", () => {
    const storage = fakeStorage();
    const session = createPersistedChatSession(
      {
        messages: [{ id: "1", role: "user", content: "hello", createdAt: 1 }],
        driverSalaryDraft: {},
        activeBenefitType: null,
        activePolicyCategory: null,
        activeAppDataContext: null,
      },
      1000,
    );
    saveChatSession(session, storage);
    expect(loadChatSession(storage, 1001)?.messages).toHaveLength(1);
    expect(loadChatSession(storage, session.expiresAt)).toBeNull();
    storage.setItem(CHAT_STORAGE_KEY, "not json");
    expect(loadChatSession(storage, 1001)).toBeNull();
    clearChatSession(storage);
    expect(storage.getItem(CHAT_STORAGE_KEY)).toBeNull();
  });

  it("round-trips structured replies and accepts legacy replies without them", () => {
    const storage = fakeStorage();
    const session = createPersistedChatSession(
      {
        messages: [
          {
            id: "structured",
            role: "assistant",
            content: "Here is your current balance.",
            createdAt: 1,
            kind: "app_data_answer",
            appDataAnswer: appDataPayloadForResolution({ kind: "dashboard" }),
          },
          {
            id: "legacy",
            role: "assistant",
            content: "**Meal Wallet**",
            createdAt: 2,
            kind: "policy_answer",
            policyAnswer: { categoryId: "meal" },
          },
        ],
        driverSalaryDraft: {},
        activeBenefitType: null,
        activePolicyCategory: null,
        activeAppDataContext: null,
      },
      1000,
    );

    saveChatSession(session, storage);
    const restored = loadChatSession(storage, 1001);

    expect(restored?.messages[0].appDataAnswer?.structured?.kind).toBe(
      "claims_dashboard",
    );
    expect(restored?.messages[1].policyAnswer?.structured).toBeUndefined();
  });
});
