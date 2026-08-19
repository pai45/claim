import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  type PolicyTabId,
} from "@/features/policy/constants";
import { FY_LABEL } from "@/features/dashboard/constants";
import { MERCHANT_ALLOWLIST, findAllowlistMatches } from "@/lib/merchants/allowlist";
import type { BenefitType } from "@/lib/merchants/types";
import {
  ASSISTANT_CLAIMS,
  summarizeAssistantClaims,
  type AssistantClaim,
} from "./claimIndex";

/**
 * Grounded payload builders for the catalog-wide questions the per-category
 * policy prompt cannot answer: "where do I still have room", "what makes a
 * claim fail", "is this merchant allowed".
 */

function claimsFor(categoryId: PolicyTabId): AssistantClaim[] {
  return ASSISTANT_CLAIMS.filter((claim) => claim.categoryId === categoryId);
}

/** Cross-benefit view of all seven wallets. */
export function buildWalletOverview() {
  const wallets = EMPLOYER_BENEFITS_CATALOG.benefits.map((benefit) => {
    const summary = summarizeAssistantClaims(claimsFor(benefit.id));
    const { allocation, utilized, available } = benefit.balance;

    return {
      categoryId: benefit.id,
      name: benefit.display.label,
      allocation,
      utilized,
      available,
      // Precomputed so the answer never has to do arithmetic the grounding
      // check would reject.
      utilizedPercent: allocation > 0 ? Math.round((utilized / allocation) * 100) : 0,
      claimFrequency: benefit.benefits.find((item) => item.icon === "frequency")
        ?.detail,
      monthlyOrAnnualLimit: benefit.benefits.find((item) => item.icon === "limit")
        ?.detail,
      proofRequired: benefit.claimRules.proofRequired,
      submissionDeadlineDay: benefit.claimRules.submissionDeadlineDay ?? null,
      claimCount: summary.totalCount,
      claimedAmount: summary.totalAmount,
      hasDashboard: benefit.display.dashboardEnabled,
    };
  });

  const totals = wallets.reduce(
    (acc, wallet) => ({
      allocation: acc.allocation + wallet.allocation,
      utilized: acc.utilized + wallet.utilized,
      available: acc.available + wallet.available,
    }),
    { allocation: 0, utilized: 0, available: 0 },
  );

  return {
    kind: "wallet_overview" as const,
    financialYear: FY_LABEL,
    employer: EMPLOYER_BENEFITS_CATALOG.employerName,
    policyVersion: EMPLOYER_BENEFITS_CATALOG.policyVersion,
    reviewSla: EMPLOYER_BENEFITS_CATALOG.reviewSla,
    totals,
    // Highest available balance first — "where do I have room" reads straight off this.
    wallets: [...wallets].sort((left, right) => right.available - left.available),
  };
}

/**
 * The rules `evaluateClaimPrecheck` enforces at submission time, expressed
 * declaratively so the assistant can explain them before a claim is uploaded.
 * Keep in sync with `lib/claims/precheck.ts`.
 */
export function buildClaimRules(categoryId?: PolicyTabId) {
  const benefits = categoryId
    ? [getEmployerBenefit(categoryId)]
    : EMPLOYER_BENEFITS_CATALOG.benefits;

  return {
    kind: "claim_rules" as const,
    policyVersion: EMPLOYER_BENEFITS_CATALOG.policyVersion,
    effectiveDate: EMPLOYER_BENEFITS_CATALOG.effectiveDate,
    reviewSla: EMPLOYER_BENEFITS_CATALOG.reviewSla,
    checksAppliedAtSubmission: [
      {
        id: "details",
        rule: "Every required field for the category must be filled in.",
        blocking: true,
      },
      {
        id: "amount",
        rule: "The claim amount must be a number greater than zero.",
        blocking: true,
      },
      { id: "claim-date", rule: "The claim date must be a valid date.", blocking: true },
      {
        id: "policy",
        rule: "The category must exist in the benefits catalog, otherwise it goes to HR review.",
        blocking: false,
      },
      {
        id: "allowance",
        rule: "The amount must not exceed the available balance in that category.",
        blocking: true,
      },
      {
        id: "proof",
        rule: "A claim file must be attached, matching the category's proof requirement.",
        blocking: true,
      },
      {
        id: "duplicate",
        rule: "A claim with the same vendor, amount, and claim date already on record is flagged for review.",
        blocking: false,
      },
      {
        id: "deadline",
        rule: "The claim must be submitted before the category's submission deadline in the following month.",
        blocking: true,
      },
    ],
    categories: benefits.map((benefit) => ({
      categoryId: benefit.id,
      name: benefit.display.label,
      requiredFields: benefit.claimRules.requiredFields,
      proofRequired: benefit.claimRules.proofRequired,
      submissionDeadlineDay: benefit.claimRules.submissionDeadlineDay ?? null,
      availableBalance: benefit.balance.available,
      notes: benefit.notes,
    })),
  };
}

/** Merchant eligibility for the meal and fuel networks. */
export function buildMerchantSource(benefitType?: BenefitType, query?: string) {
  const types: BenefitType[] = benefitType ? [benefitType] : ["meal", "fuel"];
  const trimmed = query?.trim();

  return {
    kind: "merchant_allowlist" as const,
    query: trimmed || null,
    networks: types.map((type) => ({
      benefitType: type,
      categoryId: (type === "meal" ? "meal" : "fuel") satisfies PolicyTabId,
      brands: MERCHANT_ALLOWLIST[type],
      matches: trimmed ? findAllowlistMatches(trimmed, type) : [],
    })),
    note: "Brands outside this list are not automatically rejected; they need HR review.",
  };
}
