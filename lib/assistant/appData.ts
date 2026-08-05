import {
  BENEFIT_DASHBOARD_FY_LABEL,
  getBenefitClaimsDashboard,
} from "@/features/dashboard/benefitClaims";
import {
  AVAILABLE_LIMIT,
  DASHBOARD_CATEGORIES,
  FY_LABEL,
  FY_LIMIT,
  UTILIZED_AMOUNT,
  formatINR,
} from "@/features/dashboard/constants";
import {
  getEmployerBenefit,
  getPolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import { MERCHANT_ALLOWLIST } from "@/lib/merchants/allowlist";
import type { BenefitType } from "@/lib/merchants/types";
import type { AppDataAnswerPayload } from "@/features/chat/types";
import {
  ASSISTANT_CLAIMS,
  matchesClaimStatus,
  summarizeAssistantClaims,
  type AssistantClaim,
  type ClaimAnswerStatus,
} from "./claimIndex";
import { normalizeAssistantText } from "./policy";
import {
  buildClaimRules,
  buildMerchantSource,
  buildWalletOverview,
} from "./sources";
import type { AssistantTurn } from "./assistantApiTypes";

export type { ClaimAnswerStatus };

export type AppDataContext = {
  kind: AppDataResolution["kind"];
  categoryId?: PolicyTabId;
};

export type AppDataResolution =
  | { kind: "dashboard"; categoryId?: PolicyTabId }
  | {
      kind: "claims";
      categoryId?: PolicyTabId;
      claimId?: string;
      status?: ClaimAnswerStatus;
    }
  | { kind: "wallets" }
  | { kind: "rules"; categoryId?: PolicyTabId }
  | { kind: "merchants"; benefitType?: BenefitType; query?: string };

export type GroundedAppData = Record<string, unknown>;

const CLAIM_QUESTION =
  /\b(claim history|claims history|my claims|past claims|previous claims|recent claims|latest claims|approved claims|pending claims|rejected claims|show claims|list claims|how many claims)\b/;
const DASHBOARD_QUESTION =
  /\b(dashboard|balance|balances|available balance|available limit|utilized|accrued|benefit balance|claim balance|fy limit|financial year limit|how much is left|remaining balance)\b/;
const CLAIM_FOLLOW_UP =
  /\b(approved|pending|rejected|needs info|under review|recent|latest|amount|how many|which ones|status)\b/;
const DASHBOARD_FOLLOW_UP =
  /\b(available|utilized|accrued|balance|limit|pending|approved|total|how much|left|remaining)\b/;
const WALLET_QUESTION =
  /\b(all my wallets|all wallets|every wallet|all my benefits|all benefits|every benefit|wallet overview|across benefits|across wallets|which wallet|which benefit|total available|overall balance)\b/;
// Deliberately generic-only: "why was MY claim rejected" is a question about
// this employee's claims and must fall through to the claims branch below.
const RULES_QUESTION =
  /\b(claim rules|submission rules|what makes a claim (fail|get rejected)|why do claims get rejected|why are claims rejected|before i submit|required fields|precheck|what documents do i need)\b/;
const MERCHANT_ELIGIBILITY = /\b(allowed|eligible|accepted|approved|covered|valid)\b/;
// "When must I submit books claims?" names a category and says "claims", but it
// is asking the policy a question — not asking to see this employee's records.
const POLICY_INTENT_HINT =
  /\b(deadline|submission|submit|when|proof|document|documents|invoice|receipt|limit|covered|cover|coverage|eligible|eligibility|tax|frequency|how do i|how does|process|steps)\b/;
const CLAIM_LISTING_HINT =
  /\b(show|list|history|past|previous|recent|latest|how many|status of|my claims|pending|approved|rejected|needs info)\b/;

function includesPhrase(message: string, phrase: string): boolean {
  const normalizedPhrase = normalizeAssistantText(phrase);
  return (` ${message} `).includes(` ${normalizedPhrase} `);
}

function findDashboardCategory(message: string) {
  return DASHBOARD_CATEGORIES.find((category) => {
    const policy = getPolicyCategory(category.id);
    const phrases = [
      ...policy.aliases,
      policy.tabLabel,
      policy.title,
      category.name,
    ];
    return phrases.some((phrase) => includesPhrase(message, phrase));
  });
}

function findClaimId(message: string): string | undefined {
  const match = message.match(/\bclm[-\s]?(\d{5})\b/i);
  return match ? `CLM-${match[1]}` : undefined;
}

function findClaimStatus(message: string): ClaimAnswerStatus | undefined {
  if (/\brevoked\b/.test(message)) return "Revoked";
  if (/\brejected\b/.test(message)) return "Rejected";
  if (
    /\b(needs? (more )?info(rmation)?|more info(rmation)?|information needed|additional info(rmation)?)\b/.test(
      message,
    )
  ) {
    return "Needs info";
  }
  if (/\b(pending|under review)\b/.test(message)) return "Pending";
  if (/\bapproved\b/.test(message)) return "Approved";
  return undefined;
}

/** Detects a named meal/fuel brand so "is Shell allowed?" can be answered. */
function findMerchantBrand(
  message: string,
): { benefitType: BenefitType; brand: string } | undefined {
  for (const benefitType of ["fuel", "meal"] as const) {
    for (const brand of MERCHANT_ALLOWLIST[benefitType]) {
      if (includesPhrase(message, brand)) return { benefitType, brand };
    }
  }
  return undefined;
}

export function resolveAppDataQuestion(
  question: string,
  intentId?: string,
  activeContext?: AppDataContext | null,
): AppDataResolution | null {
  const normalized = normalizeAssistantText(question);
  const category = findDashboardCategory(normalized);

  if (intentId === "view_dashboard") {
    return { kind: "dashboard", categoryId: category?.id };
  }

  if (intentId === "claim_history") {
    return {
      kind: "claims",
      categoryId: category?.id,
      status: findClaimStatus(normalized),
    };
  }

  if (intentId) return null;

  const claimId = findClaimId(normalized);
  if (claimId) {
    return category
      ? { kind: "claims", claimId, categoryId: category.id }
      : { kind: "claims", claimId };
  }

  if (WALLET_QUESTION.test(normalized)) {
    return { kind: "wallets" };
  }

  if (RULES_QUESTION.test(normalized)) {
    return { kind: "rules", categoryId: category?.id };
  }

  const brand = findMerchantBrand(normalized);
  if (brand && MERCHANT_ELIGIBILITY.test(normalized)) {
    return {
      kind: "merchants",
      benefitType: brand.benefitType,
      query: brand.brand,
    };
  }

  if (DASHBOARD_QUESTION.test(normalized)) {
    return { kind: "dashboard", categoryId: category?.id };
  }

  const mentionsClaimWord = /\bclaims?\b/.test(normalized);
  const asksAboutClaimCollection =
    CLAIM_QUESTION.test(normalized) ||
    (/\bclaims\b/.test(normalized) &&
      /\b(my|approved|pending|rejected|recent|latest|history|past|previous|show|list|many|status)\b/.test(
        normalized,
      )) ||
    // "fuel claim", "meal claims", "status of my driver claim", etc. — unless
    // the phrasing is asking the policy rather than for the employee's records.
    (Boolean(category) &&
      mentionsClaimWord &&
      !(
        POLICY_INTENT_HINT.test(normalized) &&
        !CLAIM_LISTING_HINT.test(normalized)
      )) ||
    // "why was my claim rejected", "is my claim approved" — a named status
    // makes the intent unambiguous even in the singular.
    (mentionsClaimWord && findClaimStatus(normalized) !== undefined);
  if (asksAboutClaimCollection) {
    return {
      kind: "claims",
      categoryId: category?.id,
      status: findClaimStatus(normalized),
    };
  }

  if (activeContext?.kind === "claims" && CLAIM_FOLLOW_UP.test(normalized)) {
    return {
      kind: "claims",
      categoryId: category?.id ?? activeContext.categoryId,
      status: findClaimStatus(normalized),
    };
  }

  if (
    activeContext?.kind === "dashboard" &&
    DASHBOARD_FOLLOW_UP.test(normalized)
  ) {
    return {
      kind: "dashboard",
      categoryId: category?.id ?? activeContext.categoryId,
    };
  }

  return null;
}

function claimsForResolution(
  resolution: Extract<AppDataResolution, { kind: "claims" }>,
): AssistantClaim[] {
  let claims = [...ASSISTANT_CLAIMS];

  if (resolution.claimId) {
    claims = claims.filter((claim) => claim.id === resolution.claimId);
  }

  if (resolution.categoryId) {
    claims = claims.filter(
      (claim) => claim.categoryId === resolution.categoryId,
    );
  }

  if (resolution.status) {
    const status = resolution.status;
    claims = claims.filter((claim) => matchesClaimStatus(claim, status));
  }

  return claims;
}

export function buildGroundedAppData(
  resolution: AppDataResolution,
): GroundedAppData {
  if (resolution.kind === "wallets") {
    return buildWalletOverview();
  }

  if (resolution.kind === "rules") {
    return buildClaimRules(resolution.categoryId);
  }

  if (resolution.kind === "merchants") {
    return buildMerchantSource(resolution.benefitType, resolution.query);
  }

  if (resolution.kind === "dashboard" && resolution.categoryId) {
    const dashboard = getBenefitClaimsDashboard(resolution.categoryId);
    const benefit = getEmployerBenefit(resolution.categoryId);
    return {
      kind: "category_dashboard",
      financialYear: BENEFIT_DASHBOARD_FY_LABEL,
      dashboard,
      claimRules: benefit.claimRules,
      claimSummary: summarizeAssistantClaims(
        ASSISTANT_CLAIMS.filter(
          (claim) => claim.categoryId === resolution.categoryId,
        ),
      ),
    };
  }

  if (resolution.kind === "dashboard") {
    return {
      kind: "claims_dashboard",
      overview: {
        financialYear: FY_LABEL,
        availableLimit: AVAILABLE_LIMIT,
        utilizedAmount: UTILIZED_AMOUNT,
        financialYearLimit: FY_LIMIT,
      },
      categories: DASHBOARD_CATEGORIES.map(({ id, name, amount }) => ({
        id,
        name,
        amount,
      })),
    };
  }

  const claims = claimsForResolution(resolution);
  return {
    kind: "claims_history",
    filters: {
      categoryId: resolution.categoryId,
      claimId: resolution.claimId,
      status: resolution.status,
    },
    summary: summarizeAssistantClaims(claims),
    claims,
    ...(resolution.categoryId
      ? { claimRules: getEmployerBenefit(resolution.categoryId).claimRules }
      : {}),
  };
}

function describeClaims(claims: AssistantClaim[]): string {
  return claims
    .slice(0, 3)
    .map(
      (claim) =>
        `- **${claim.id}** — ${claim.title}, ${formatINR(claim.amount)}, ${claim.status}`,
    )
    .join("\n");
}

export function createAppDataFallbackSummary(
  question: string,
  resolution: AppDataResolution,
): string {
  const normalized = normalizeAssistantText(question);

  if (resolution.kind === "wallets") {
    const overview = buildWalletOverview();
    const lines = overview.wallets
      .map(
        (wallet) =>
          `- **${wallet.name}:** ${formatINR(wallet.available)} available of ${formatINR(wallet.allocation)}`,
      )
      .join("\n");
    return `**Your wallets (${overview.financialYear})**\n\n${lines}\n\n**Total available:** ${formatINR(overview.totals.available)}`;
  }

  if (resolution.kind === "rules") {
    const rules = buildClaimRules(resolution.categoryId);
    const lines = rules.categories
      .map(
        (category) =>
          `- **${category.name}:** ${category.proofRequired}${
            category.submissionDeadlineDay
              ? `, submit by the ${category.submissionDeadlineDay}th of the next month`
              : ""
          }`,
      )
      .join("\n");
    return `**What a claim needs to pass**\n\nEvery claim is checked for required fields, a valid amount and bill date, available balance, attached proof, duplicates, and the submission deadline.\n\n${lines}`;
  }

  if (resolution.kind === "merchants") {
    const source = buildMerchantSource(resolution.benefitType, resolution.query);
    const lines = source.networks
      .map((network) => {
        const list = network.matches.length > 0 ? network.matches : network.brands;
        return `- **${network.benefitType === "meal" ? "Meal" : "Fuel"}:** ${list.slice(0, 8).join(", ")}`;
      })
      .join("\n");
    return `**Allowed merchants**\n\n${lines}\n\n${source.note}`;
  }

  if (resolution.kind === "dashboard" && resolution.categoryId) {
    const dashboard = getBenefitClaimsDashboard(resolution.categoryId);
    if (/\b(pending|approved|total)\b/.test(normalized)) {
      return `**${dashboard.title} (${dashboard.monthLabel})**\n\n- **Total claims:** ${formatINR(dashboard.monthTotal)}\n- **Approved:** ${formatINR(dashboard.monthApproved)}\n- **Pending:** ${formatINR(dashboard.monthPending)}\n- **Available:** ${formatINR(dashboard.availableLimit)}`;
    }

    return `**${dashboard.title}**\n\n- **Available:** ${formatINR(dashboard.availableLimit)}\n- **Utilized:** ${formatINR(dashboard.utilized)} of ${formatINR(dashboard.accrued)} accrued (${BENEFIT_DASHBOARD_FY_LABEL})\n- **${dashboard.monthLabel} claims:** ${formatINR(dashboard.monthTotal)}`;
  }

  if (resolution.kind === "dashboard") {
    return `**Claims dashboard (${FY_LABEL})**\n\n- **Available:** ${formatINR(AVAILABLE_LIMIT)}\n- **Utilized:** ${formatINR(UTILIZED_AMOUNT)}\n- **FY limit:** ${formatINR(FY_LIMIT)}\n- **Categories:** ${DASHBOARD_CATEGORIES.length}`;
  }

  const claims = claimsForResolution(resolution);
  const summary = summarizeAssistantClaims(claims);
  if (claims.length === 0) {
    const filter = resolution.status?.toLowerCase() ?? "matching";
    return `There are no ${filter} claims in your current app data.`;
  }

  if (resolution.claimId) {
    const claim = claims[0];
    return `**Claim ${claim.id}**\n\n- **Title:** ${claim.title}\n- **Status:** ${claim.status}\n- **Amount:** ${formatINR(claim.amount)}\n- **Date:** ${claim.date}`;
  }

  const filterLabel = resolution.status
    ? `${resolution.status.toLowerCase()} `
    : "";
  return `**Your ${filterLabel}claims**\n\n- **Count:** ${summary.totalCount}\n- **Total:** ${formatINR(summary.totalAmount)}\n- **Approved:** ${summary.approvedCount}\n- **Pending:** ${summary.pendingCount}\n- **Needs info:** ${summary.needsInfoCount}\n- **Rejected:** ${summary.rejectedCount}\n- **Revoked:** ${summary.revokedCount}\n\n**Latest**\n${describeClaims(claims)}`;
}

function numericFacts(value: string): string[] {
  return Array.from(
    value.matchAll(/\d[\d,]*(?:\.\d+)?(?:\(\d+\))?%?(?:st|nd|rd|th)?/gi),
    (match) => match[0].toLowerCase().replaceAll(",", ""),
  );
}

function claimIds(value: string): string[] {
  return Array.from(value.matchAll(/\bCLM-\d{5}\b/gi), (match) =>
    match[0].toUpperCase(),
  );
}

export type GroundingCheck = {
  grounded: boolean;
  /** Facts the model asserted that are absent from the supplied source. */
  offendingFacts: string[];
  offendingClaimIds: string[];
  reason?: "empty" | "too_long" | "ungrounded";
};

/**
 * Reports *why* an answer was rejected rather than just that it was, so a
 * silently discarded model answer is diagnosable instead of invisible.
 */
export function checkAppDataGrounding(
  answer: string,
  source: GroundedAppData,
): GroundingCheck {
  const trimmed = answer.trim();
  if (!trimmed) {
    return { grounded: false, offendingFacts: [], offendingClaimIds: [], reason: "empty" };
  }
  if (trimmed.length > 1600) {
    return { grounded: false, offendingFacts: [], offendingClaimIds: [], reason: "too_long" };
  }

  const serialized = JSON.stringify(source);
  const allowedFacts = new Set(numericFacts(serialized));
  const allowedClaimIds = new Set(claimIds(serialized));

  const offendingFacts = numericFacts(trimmed).filter(
    (fact) => !allowedFacts.has(fact),
  );
  const offendingClaimIds = claimIds(trimmed).filter(
    (claimId) => !allowedClaimIds.has(claimId),
  );
  const grounded = offendingFacts.length === 0 && offendingClaimIds.length === 0;

  return {
    grounded,
    offendingFacts,
    offendingClaimIds,
    reason: grounded ? undefined : "ungrounded",
  };
}

export function isGroundedAppDataAnswer(
  answer: string,
  source: GroundedAppData,
): boolean {
  return checkAppDataGrounding(answer, source).grounded;
}

export function createAppDataPrompt(
  question: string,
  source: GroundedAppData,
  history: AssistantTurn[] = [],
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return [
    {
      role: "system",
      content:
        "You are a private claims assistant. Answer only with facts present in the supplied app data JSON. Do not invent claims, IDs, statuses, amounts, dates, limits, categories, explanations, or a CTA. Every number you write must already appear in the JSON — never add, subtract, or convert amounts yourself; the JSON already contains any total, count, or percentage you need. If the data does not contain the answer, say so. Format the reply like a helpful chat answer using short markdown: a bold title line, then bullet lists for amounts, statuses, claim IDs, and dates. Keep it concise (about 80-160 words). Respond in the user's language.",
    },
    ...history,
    {
      role: "user",
      content: `Question: ${question}\n\nApp data JSON:\n${JSON.stringify(source)}`,
    },
  ];
}

export function appDataContextForResolution(
  resolution: AppDataResolution,
): AppDataContext {
  return {
    kind: resolution.kind,
    categoryId:
      resolution.kind === "dashboard" ||
      resolution.kind === "claims" ||
      resolution.kind === "rules"
        ? resolution.categoryId
        : undefined,
  };
}

export function appDataPayloadForResolution(
  resolution: AppDataResolution,
): AppDataAnswerPayload {
  if (resolution.kind === "wallets") {
    return { target: "dashboard" };
  }

  if (resolution.kind === "merchants") {
    return { target: "none" };
  }

  if (resolution.kind === "rules") {
    return resolution.categoryId
      ? { target: "policy", categoryId: resolution.categoryId }
      : { target: "none" };
  }

  if (resolution.kind === "dashboard") {
    return {
      target: resolution.categoryId ? "category_dashboard" : "dashboard",
      categoryId: resolution.categoryId,
    };
  }

  if (resolution.claimId) {
    return { target: "claim", claimId: resolution.claimId };
  }

  if (resolution.categoryId) {
    return {
      target: "category_dashboard",
      categoryId: resolution.categoryId,
    };
  }

  return { target: "claims_history" };
}
