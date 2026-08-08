import { describe, expect, it } from "vitest";
import {
  POLICY_CATEGORIES,
  getPolicyCategory,
} from "@/features/policy/constants";
import {
  buildStructuredPolicyAnswer,
  createPolicyLeadSummary,
  createPolicyFallbackSummary,
  isGroundedPolicyAnswer,
  policyPayloadForAnswer,
  resolvePolicyQuestion,
} from "./policy";

describe("policy question routing", () => {
  it("routes a natural meal-benefit question", () => {
    const resolution = resolvePolicyQuestion("Tell me benefits about meals");

    expect(resolution?.categories.map((category) => category.id)).toEqual([
      "meal",
    ]);
  });

  it.each(POLICY_CATEGORIES)(
    "recognizes the $tabLabel category",
    (category) => {
      const resolution = resolvePolicyQuestion(
        `What are the benefits for ${category.aliases[0]}?`,
      );

      expect(resolution?.categories.map((item) => item.id)).toContain(
        category.id,
      );
    },
  );

  it("uses the active category for a follow-up", () => {
    const resolution = resolvePolicyQuestion(
      "What proof is required?",
      "meal",
    );

    expect(resolution?.categories.map((category) => category.id)).toEqual([
      "meal",
    ]);
  });

  it("does not mistake claim tracking for a policy follow-up", () => {
    expect(resolvePolicyQuestion("Where is my claim?", "meal")).toBeNull();
  });

  it("keeps every named benefit when a question compares two", () => {
    const resolution = resolvePolicyQuestion(
      "Compare the meal and fuel benefits",
    );

    expect(resolution?.categories.map((category) => category.id)).toEqual([
      "meal",
      "fuel",
    ]);
  });

  it("summarizes both benefits side by side", () => {
    const resolution = resolvePolicyQuestion(
      "Compare the meal and fuel benefits",
    );
    const answer = createPolicyFallbackSummary(
      "Compare the meal and fuel benefits",
      resolution!.categories,
    );

    expect(answer).toContain("Meal Wallet");
    expect(answer).toContain("Fuel & Maintenance");
  });

  it.each([
    ["Tell me benefits about meals", "overview"],
    ["What proof is required for meals?", "proof"],
    ["When must I submit meal claims?", "deadline"],
    ["What is covered under meal wallet?", "coverage"],
    ["How does meal wallet work?", "process"],
    ["What is the tax treatment for meals?", "tax"],
  ])("builds a typed %s policy card", (question, expectedView) => {
    const categories = [getPolicyCategory("meal")];
    const structured = buildStructuredPolicyAnswer(question, categories);
    const payload = policyPayloadForAnswer(question, categories, structured);

    expect(structured.view).toBe(expectedView);
    expect(structured.categories[0].id).toBe("meal");
    expect(payload.structured).toBe(structured);
    expect(createPolicyLeadSummary(structured).length).toBeGreaterThan(0);
  });

  it("builds a mobile-stacked comparison payload", () => {
    const categories = [getPolicyCategory("meal"), getPolicyCategory("fuel")];
    const structured = buildStructuredPolicyAnswer(
      "Compare meal and fuel benefits",
      categories,
    );

    expect(structured.view).toBe("comparison");
    expect(structured.categories.map((category) => category.id)).toEqual([
      "meal",
      "fuel",
    ]);
    expect(structured.categories.every((category) => category.facts.length >= 3)).toBe(true);
  });

  it.each([
    "Upload a food receipt",
    "Find a meal merchant",
    "Track my claim status",
    "Register my vehicle",
  ])("preserves the existing action flow for: %s", (question) => {
    expect(resolvePolicyQuestion(question, "meal")).toBeNull();
  });
});

describe("policy answer grounding", () => {
  const mealPolicy = getPolicyCategory("meal");

  it("creates a useful fallback from the policy source", () => {
    const answer = createPolicyFallbackSummary(
      "Tell me benefits about meals",
      mealPolicy,
    );

    expect(answer).toContain("₹2,500");
    expect(answer).toContain("GST food / restaurant invoices");
    expect(answer).toContain("5th");
    expect(answer).toContain("applicable tax regime");
    expect(answer).toContain("not tax advice");
  });

  it("accepts numeric facts that exist in the policy", () => {
    expect(
      isGroundedPolicyAnswer(
        "The monthly limit is ₹2,500, and claims are due before the 5th.",
        mealPolicy,
      ),
    ).toBe(true);
  });

  it.each([
    "The monthly limit is ₹3,000.",
    "Submit the claim before the 10th.",
    "This benefit saves 40% tax.",
  ])("rejects an unsupported numeric fact: %s", (answer) => {
    expect(isGroundedPolicyAnswer(answer, mealPolicy)).toBe(false);
  });
});
