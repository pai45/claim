import { describe, expect, it } from "vitest";
import {
  buildGroundedAppData,
  appDataPayloadForResolution,
} from "@/lib/assistant/appData";
import { policyPayloadForAnswer } from "@/lib/assistant/policy";
import { getPolicyCategory } from "@/features/policy/constants";
import type { ChatMessage } from "@/features/chat/types";
import {
  getContextualQuickChats,
  trailingContextualQuickChats,
} from "./contextualQuickChats";

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "message-1",
    role: "assistant",
    content: "Answer",
    createdAt: 1,
    kind: "text",
    ...overrides,
  };
}

function appDataMessage(
  resolution: Parameters<typeof buildGroundedAppData>[0],
): ChatMessage {
  const structured = buildGroundedAppData(resolution);
  return message({
    kind: "app_data_answer",
    appDataAnswer: appDataPayloadForResolution(resolution, structured),
  });
}

function simplifiedActions(value: ChatMessage) {
  return getContextualQuickChats(value).map(({ label, intentId }) => ({
    label,
    intentId,
  }));
}

describe("contextual quick chats", () => {
  it("suggests category-aware follow-ups for policy answers", () => {
    const category = getPolicyCategory("meal");
    const value = message({
      kind: "policy_answer",
      policyAnswer: policyPayloadForAnswer("What is covered?", [category]),
    });

    expect(simplifiedActions(value)).toEqual([
      { label: "Check Meal Wallet balance", intentId: "view_dashboard" },
      { label: "Show Meal Wallet claims", intentId: "claim_history" },
      { label: "Choose another policy", intentId: "view_policy" },
      { label: "New claim", intentId: "upload_claim" },
    ]);
  });

  it("suggests policy follow-ups for grounded claim-rule answers", () => {
    expect(
      simplifiedActions(
        appDataMessage({ kind: "rules", categoryId: "mobile" }),
      ),
    ).toEqual([
      {
        label: "Check Mobile & Internet balance",
        intentId: "view_dashboard",
      },
      {
        label: "Show Mobile & Internet claims",
        intentId: "claim_history",
      },
      { label: "Choose another policy", intentId: "view_policy" },
      { label: "New claim", intentId: "upload_claim" },
    ]);
  });

  it("suggests generic claim follow-ups for the overall dashboard", () => {
    expect(simplifiedActions(appDataMessage({ kind: "dashboard" }))).toEqual([
      { label: "Pending claims", intentId: "claim_history" },
      { label: "View claim history", intentId: "claim_history" },
      { label: "Check a policy", intentId: "view_policy" },
    ]);
  });

  it("suggests related actions for a category dashboard", () => {
    expect(
      simplifiedActions(
        appDataMessage({ kind: "dashboard", categoryId: "fuel" }),
      ),
    ).toEqual([
      {
        label: "Show Fuel & Maintenance claims",
        intentId: "claim_history",
      },
      { label: "Review Fuel & Maintenance policy", intentId: undefined },
      { label: "Upload a claim", intentId: "upload_claim" },
    ]);
  });

  it("suggests the first two status filters for unfiltered claim history", () => {
    expect(simplifiedActions(appDataMessage({ kind: "claims" }))).toEqual([
      { label: "Pending", intentId: "claim_history" },
      { label: "Approved", intentId: "claim_history" },
      { label: "View dashboard", intentId: "view_dashboard" },
      { label: "New claim", intentId: "upload_claim" },
    ]);
  });

  it("excludes the active status and includes the category in filtered history", () => {
    expect(
      simplifiedActions(
        appDataMessage({
          kind: "claims",
          categoryId: "books",
          status: "Pending",
        }),
      ),
    ).toEqual([
      { label: "Approved", intentId: "claim_history" },
      { label: "Rejected", intentId: "claim_history" },
      { label: "View dashboard", intentId: "view_dashboard" },
      { label: "New claim", intentId: "upload_claim" },
    ]);
  });

  it("suggests informational follow-ups for an individual claim", () => {
    expect(
      simplifiedActions(
        appDataMessage({ kind: "claims", claimId: "CLM-43872" }),
      ),
    ).toEqual([
      { label: "View claim history", intentId: "claim_history" },
      { label: "View dashboard", intentId: "view_dashboard" },
      { label: "Check a policy", intentId: "view_policy" },
      { label: "New claim", intentId: "upload_claim" },
    ]);
  });

  it.each([
    message(),
    message({ kind: "upload_options" }),
    message({ kind: "claim_cta", claimId: "CLM-43872" }),
    message({ kind: "driver_name_input" }),
    message({
      kind: "app_data_answer",
      appDataAnswer: { target: "none" },
    }),
  ])("does not suggest replies for non-target messages", (value) => {
    expect(getContextualQuickChats(value)).toEqual([]);
  });

  it("returns suggestions only when an eligible answer is trailing", () => {
    const eligible = appDataMessage({ kind: "dashboard" });
    const userReply = message({ id: "message-2", role: "user" });

    expect(trailingContextualQuickChats([eligible])).toHaveLength(3);
    expect(trailingContextualQuickChats([eligible, userReply])).toEqual([]);
  });

  it("derives suggestions from a restored message without stored options", () => {
    const restored = JSON.parse(
      JSON.stringify(appDataMessage({ kind: "dashboard", categoryId: "meal" })),
    ) as ChatMessage;

    expect(getContextualQuickChats(restored).map((item) => item.label)).toEqual(
      ["Show Meal Wallet claims", "Review Meal Wallet policy", "Upload a claim"],
    );
  });
});
