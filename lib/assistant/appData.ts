import {
  ALL_BENEFIT_CLAIMS,
  BENEFIT_DASHBOARD_FY_LABEL,
  getBenefitClaimsDashboard,
  type BenefitClaimItem,
} from "@/features/dashboard/benefitClaims";
import {
  AVAILABLE_LIMIT,
  DASHBOARD_CATEGORIES,
  FY_LABEL,
  FY_LIMIT,
  UTILIZED_AMOUNT,
  formatINR,
} from "@/features/dashboard/constants";
import { getPolicyCategory, type PolicyTabId } from "@/features/policy/constants";
import type { AppDataAnswerPayload } from "@/features/chat/types";
import { normalizeAssistantText } from "./policy";

export type ClaimAnswerStatus = "Approved" | "Pending" | "Rejected";

export type AppDataContext = {
  kind: "dashboard" | "claims";
  categoryId?: PolicyTabId;
};

export type AppDataResolution =
  | {
      kind: "dashboard";
      categoryId?: PolicyTabId;
    }
  | {
      kind: "claims";
      categoryId?: PolicyTabId;
      claimId?: string;
      status?: ClaimAnswerStatus;
    };

export type GroundedAppData = Record<string, unknown>;

const CLAIM_QUESTION =
  /\b(claim history|claims history|my claims|past claims|previous claims|recent claims|latest claims|approved claims|pending claims|rejected claims|show claims|list claims|how many claims)\b/;
const DASHBOARD_QUESTION =
  /\b(dashboard|balance|balances|available balance|available limit|utilized|accrued|benefit balance|claim balance|fy limit|financial year limit|how much is left|remaining balance)\b/;
const CLAIM_FOLLOW_UP =
  /\b(approved|pending|rejected|under review|recent|latest|amount|how many|which ones|status)\b/;
const DASHBOARD_FOLLOW_UP =
  /\b(available|utilized|accrued|balance|limit|pending|approved|total|how much|left|remaining)\b/;

function includesPhrase(message: string, phrase: string): boolean {
  const normalizedPhrase = normalizeAssistantText(phrase);
  return (` ${message} `).includes(` ${normalizedPhrase} `);
}

function findDashboardCategory(message: string) {
  return DASHBOARD_CATEGORIES.find((category) =>
    getPolicyCategory(category.id).aliases.some((alias) =>
      includesPhrase(message, alias),
    ),
  );
}

function findClaimId(message: string): string | undefined {
  const match = message.match(/\bclm[-\s]?(\d{5})\b/i);
  return match ? `CLM-${match[1]}` : undefined;
}

function findClaimStatus(message: string): ClaimAnswerStatus | undefined {
  if (/\brejected\b/.test(message)) return "Rejected";
  if (/\b(pending|under review)\b/.test(message)) return "Pending";
  if (/\bapproved\b/.test(message)) return "Approved";
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
    return { kind: "claims", claimId };
  }

  if (DASHBOARD_QUESTION.test(normalized)) {
    return { kind: "dashboard", categoryId: category?.id };
  }

  const asksAboutClaimCollection =
    CLAIM_QUESTION.test(normalized) ||
    (/\bclaims\b/.test(normalized) &&
      /\b(my|approved|pending|rejected|recent|latest|history|past|previous|show|list|many|status)\b/.test(
        normalized,
      ));
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

function claimsForResolution(resolution: Extract<AppDataResolution, { kind: "claims" }>) {
  let claims = [...ALL_BENEFIT_CLAIMS];

  if (resolution.claimId) {
    claims = claims.filter((claim) => claim.id === resolution.claimId);
  }

  if (resolution.categoryId) {
    const title = getBenefitClaimsDashboard(resolution.categoryId).title;
    claims = claims.filter((claim) => claim.category === title);
  }

  if (resolution.status === "Approved") {
    claims = claims.filter((claim) => claim.status === "Approved");
  } else if (resolution.status === "Pending") {
    claims = claims.filter((claim) => claim.status !== "Approved");
  } else if (resolution.status === "Rejected") {
    claims = [];
  }

  return claims.sort(
    (left, right) => Date.parse(right.date) - Date.parse(left.date),
  );
}

function summarizeClaims(claims: BenefitClaimItem[]) {
  const approved = claims.filter((claim) => claim.status === "Approved");
  const pending = claims.filter((claim) => claim.status !== "Approved");
  const sum = (items: BenefitClaimItem[]) =>
    items.reduce((total, claim) => total + claim.amount, 0);

  return {
    totalCount: claims.length,
    totalAmount: sum(claims),
    approvedCount: approved.length,
    approvedAmount: sum(approved),
    pendingCount: pending.length,
    pendingAmount: sum(pending),
  };
}

export function buildGroundedAppData(
  resolution: AppDataResolution,
): GroundedAppData {
  if (resolution.kind === "dashboard" && resolution.categoryId) {
    const dashboard = getBenefitClaimsDashboard(resolution.categoryId);
    return {
      kind: "category_dashboard",
      financialYear: BENEFIT_DASHBOARD_FY_LABEL,
      dashboard,
      claimSummary: summarizeClaims(dashboard.claims),
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
    summary: summarizeClaims(claims),
    claims,
  };
}

function describeClaims(claims: BenefitClaimItem[]): string {
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

  if (resolution.kind === "dashboard" && resolution.categoryId) {
    const dashboard = getBenefitClaimsDashboard(resolution.categoryId);
    if (/\b(pending|approved|total)\b/.test(normalized)) {
      return `**${dashboard.title} (${dashboard.monthLabel})**\n\n- **Total claims:** ${formatINR(dashboard.monthTotal)}\n- **Approved:** ${formatINR(dashboard.monthApproved)}\n- **Pending:** ${formatINR(dashboard.monthPending)}\n- **Available:** ${formatINR(dashboard.availableLimit)}`;
    }

    return `**${dashboard.title}**\n\n- **Available:** ${formatINR(dashboard.availableLimit)}\n- **Utilized:** ${formatINR(dashboard.utilized)} of ${formatINR(dashboard.accrued)} accrued (${BENEFIT_DASHBOARD_FY_LABEL})\n- **${dashboard.monthLabel} claims:** ${formatINR(dashboard.monthTotal)}`;
  }

  if (resolution.kind === "dashboard") {
    return `**Claims dashboard (${FY_LABEL})**\n\n- **Available:** ${formatINR(AVAILABLE_LIMIT)}\n- **Utilized:** ${formatINR(UTILIZED_AMOUNT)}\n- **FY limit:** ${formatINR(FY_LIMIT)}\n- **Categories:** ${DASHBOARD_CATEGORIES.length} (each showing ${formatINR(DASHBOARD_CATEGORIES[0].amount)})`;
  }

  const claims = claimsForResolution(resolution);
  const summary = summarizeClaims(claims);
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
  return `**Your ${filterLabel}claims**\n\n- **Count:** ${summary.totalCount}\n- **Total:** ${formatINR(summary.totalAmount)}\n- **Approved:** ${summary.approvedCount}\n- **Pending:** ${summary.pendingCount}\n\n**Latest**\n${describeClaims(claims)}`;
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

export function isGroundedAppDataAnswer(
  answer: string,
  source: GroundedAppData,
): boolean {
  const trimmed = answer.trim();
  if (!trimmed || trimmed.length > 1600) return false;

  const serialized = JSON.stringify(source);
  const allowedFacts = new Set(numericFacts(serialized));
  const allowedClaimIds = new Set(claimIds(serialized));

  return (
    numericFacts(trimmed).every((fact) => allowedFacts.has(fact)) &&
    claimIds(trimmed).every((claimId) => allowedClaimIds.has(claimId))
  );
}

export function createAppDataPrompt(
  question: string,
  source: GroundedAppData,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content:
        "You are a private claims assistant. Answer only with facts present in the supplied app data JSON. Do not invent claims, IDs, statuses, amounts, dates, limits, categories, explanations, or a CTA. If the data does not contain the answer, say so. Format the reply like a helpful chat answer using short markdown: a bold title line, then bullet lists for amounts, statuses, claim IDs, and dates. Keep it concise (about 80-160 words). Respond in the user's language.",
    },
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
    categoryId: resolution.categoryId,
  };
}

export function appDataPayloadForResolution(
  resolution: AppDataResolution,
): AppDataAnswerPayload {
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
