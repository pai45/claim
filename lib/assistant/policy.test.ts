import { describe, expect, it } from "vitest";
import {
  POLICY_CATEGORIES,
  getPolicyCategory,
} from "@/features/policy/constants";
import {
  createPolicyFallbackSummary,
  isGroundedPolicyAnswer,
  resolvePolicyQuestion,
} from "./policy";

describe("policy question routing", () => {
  it("routes a natural meal-benefit question", () => {
    const resolution = resolvePolicyQuestion("Tell me benefits about meals");

    expect(resolution?.type).toBe("match");
    if (resolution?.type === "match") {
      expect(resolution.category.id).toBe("meal");
    }
  });

  it.each(POLICY_CATEGORIES)(
    "recognizes the $tabLabel category",
    (category) => {
      const resolution = resolvePolicyQuestion(
        `What are the benefits for ${category.aliases[0]}?`,
      );

      expect(resolution?.type).toBe("match");
      if (resolution?.type === "match") {
        expect(resolution.category.id).toBe(category.id);
      }
    },
  );

  it("uses the active category for a follow-up", () => {
    const resolution = resolvePolicyQuestion(
      "What proof is required?",
      "meal",
    );

    expect(resolution?.type).toBe("match");
    if (resolution?.type === "match") {
      expect(resolution.category.id).toBe("meal");
    }
  });

  it("does not mistake claim tracking for a policy follow-up", () => {
    expect(resolvePolicyQuestion("Where is my claim?", "meal")).toBeNull();
  });

  it("asks for one category when multiple policies match", () => {
    const resolution = resolvePolicyQuestion(
      "Compare the meal and fuel benefits",
    );

    expect(resolution?.type).toBe("ambiguous");
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
