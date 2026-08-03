import { describe, expect, it } from "vitest";
import { resolveAppDataQuestion } from "./appData";
import { isExplicitAssistantAction, resolvePolicyQuestion } from "./policy";

/**
 * Mirrors the deterministic fast path in `useChat.sendMessage`. Anything this
 * returns as "llm_router" is what Tier 1 routing exists to catch — offline
 * those questions fall through to the keyword help menu.
 */
function fastPath(question: string): string {
  const appData = resolveAppDataQuestion(question);
  if (appData) return appData.kind;

  const policy = resolvePolicyQuestion(question);
  if (policy) return `policy:${policy.categories.length}`;

  if (isExplicitAssistantAction(question)) return "guided_action";

  return "llm_router";
}

describe("deterministic routing table", () => {
  it.each([
    ["Show my pending fuel claims", "claims"],
    ["Why was my claim rejected?", "claims"],
    ["Show my rejected claims", "claims"],
    ["What happened to CLM-44088?", "claims"],
    ["What is my available balance?", "dashboard"],
    ["How much is available on my fuel dashboard?", "dashboard"],
    ["Which wallet has the most left?", "wallets"],
    ["What is my total available?", "wallets"],
    ["What makes a claim fail?", "rules"],
    ["Why do claims get rejected?", "rules"],
    ["Is Shell allowed?", "merchants"],
    ["Is Starbucks eligible?", "merchants"],
    ["Which claims need more information?", "claims"],
    ["What proof is required for fuel?", "policy:1"],
    ["Tell me benefits about meals", "policy:1"],
    ["Compare the meal and fuel benefits", "policy:2"],
    // Names a category and says "claims", but asks the policy a question.
    ["When must I submit books claims?", "policy:1"],
    ["How do I claim fuel reimbursement?", "policy:1"],
    ["Upload a bill", "guided_action"],
    ["Register my vehicle", "guided_action"],
    ["Track my claim", "guided_action"],
  ])("routes %j deterministically to %s", (question, expected) => {
    expect(fastPath(question)).toBe(expected);
  });

  it.each([
    "Can I claim my Swiggy order?",
    "I lost my invoice, what do I do?",
    "What should I do with a laptop receipt?",
    "Do you have anything for gym memberships?",
  ])("hands %j to the LLM router", (question) => {
    expect(fastPath(question)).toBe("llm_router");
  });

  it("keeps the generic claim-status question on the guided track flow", () => {
    // Deliberately not answered from data — the Track claim card handles it.
    expect(resolveAppDataQuestion("What is the status of my claim?")).toBeNull();
    expect(fastPath("What is the status of my claim?")).toBe("guided_action");
  });
});
