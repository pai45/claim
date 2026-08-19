import { describe, expect, it } from "vitest";
import { createAppDataFallbackSummary, resolveAppDataQuestion } from "./appData";
import { createPolicyFallbackSummary, resolvePolicyQuestion } from "./policy";

/**
 * Pins the answers quoted in LLM-CAPABILITIES.md. That document previously
 * drifted from the code (it advertised "When must I submit books claims?" as a
 * policy answer while the router sent it to the claims list), so the headline
 * numbers are asserted here rather than trusted to stay accurate.
 *
 * If one of these fails, either the app data changed — update the doc — or a
 * routing change moved the question somewhere unintended.
 */
function answer(question: string): string {
  const appData = resolveAppDataQuestion(question);
  if (appData) return createAppDataFallbackSummary(question, appData);

  const policy = resolvePolicyQuestion(question);
  if (policy) return createPolicyFallbackSummary(question, policy.categories);

  throw new Error(`"${question}" no longer resolves to a grounded answer`);
}

describe("documented answers", () => {
  it("Show my dashboard", () => {
    expect(answer("Show my dashboard")).toBe(
      [
        "**Claims dashboard (FY 26/27)**",
        "",
        "- **Available:** ₹1,75,000",
        "- **Utilized:** ₹82,000",
        "- **FY limit:** ₹2,57,000",
        "- **Categories:** 5",
      ].join("\n"),
    );
  });

  it("Which wallet has the most left?", () => {
    const reply = answer("Which wallet has the most left?");

    // Ranked by available balance, and covers the wallets with no dashboard.
    expect(reply).toContain("- **Driver Salary:** ₹45,000 available of ₹90,000");
    expect(reply).toContain("- **Mobile & Internet:** ₹2,000 available of ₹2,000");
    expect(reply).toContain("**Total available:** ₹2,05,000");
  });

  it("How many claims do I have?", () => {
    const reply = answer("How many claims do I have?");

    expect(reply).toContain("- **Count:** 25");
    expect(reply).toContain("- **Total:** \u20B91,06,895");
  });

  it("Why was my claim rejected?", () => {
    expect(answer("Why was my claim rejected?")).toContain(
      "- **CLM-45033** — Shell Aundh - 20 Apr 2026, ₹1,100, Rejected",
    );
  });

  it("Which claims need more information?", () => {
    expect(answer("Which claims need more information?")).toContain(
      "- **CLM-45188** — Indian Oil - 11 May 2026, ₹3,400, Needs info",
    );
  });

  it("Show mobile claims merges both datasets", () => {
    const reply = answer("Show mobile claims");

    expect(reply).toContain("- **Count:** 3");
    expect(reply).toContain("- **Total:** ₹3,097");
  });

  it("When must I submit books claims?", () => {
    expect(answer("When must I submit books claims?")).toBe(
      [
        "**Books & Periodicals deadline**",
        "",
        "- Claims must be submitted before the 5th of next month",
        "- **Claim Frequency:** Monthly",
      ].join("\n"),
    );
  });

  it("Compare the meal and fuel benefits", () => {
    const reply = answer("Compare the meal and fuel benefits");

    expect(reply).toContain(
      "- **Meal Wallet:** monthly limit ₹2,500 · monthly · GST food or restaurant invoice",
    );
    expect(reply).toContain("- **Fuel & Maintenance:** monthly limit ₹15,000");
  });

  it("Is Shell allowed?", () => {
    const reply = answer("Is Shell allowed?");

    expect(reply).toContain("- **Fuel:** Shell");
    expect(reply).toContain(
      "Brands outside this list are not automatically rejected; they need HR review.",
    );
  });

  it("What makes a claim fail?", () => {
    const reply = answer("What makes a claim fail?");

    expect(reply).toContain(
      "Every claim is checked for required fields, a valid amount and claim date, available balance, attached proof, duplicates, and the submission deadline.",
    );
    expect(reply).toContain(
      "- **Meal Wallet:** GST food or restaurant invoice, submit by the 5th of the next month",
    );
  });

  it("how much my meal wallet balance remains?", () => {
    const reply = answer("how much my meal wallet balance remains?");
    expect(reply).toContain("**Meal Wallet**");
    expect(reply).toContain("- **Available:** ₹30,000");
    expect(reply).toContain("- **Utilized:** ₹0 of ₹30,000 accrued");
  });

  it("How much balance is left in my mobile and internet benefit?", () => {
    const reply = answer("How much balance is left in my mobile and internet benefit?");
    expect(reply).toContain("**Mobile & Internet**");
    expect(reply).toContain("- **Available:** ₹2,000");
  });

  it("What is my total wallet balance?", () => {
    const reply = answer("What is my total wallet balance?");
    expect(reply).toContain("**Your wallets (FY 26/27)**");
    expect(reply).toContain("**Total available:** ₹2,05,000");
  });

  it("Is Swiggy allowed?", () => {
    const reply = answer("Is Swiggy allowed?");
    expect(reply).toContain("- **Meal:** Swiggy");
  });

  it("Is Zomato allowed?", () => {
    const reply = answer("Is Zomato allowed?");
    expect(reply).toContain("- **Meal:** Zomato");
  });

  it("Is Starbucks eligible?", () => {
    const reply = answer("Is Starbucks eligible?");
    expect(reply).toContain("- **Meal:** Starbucks");
  });

  it("Can I order from Blinkit?", () => {
    const reply = answer("Can I order from Blinkit?");
    expect(reply).toContain("- **Meal:** Blinkit");
  });
});
