import {
  getBenefitClaimsDashboard,
  type BenefitClaimItem,
} from "@/features/dashboard/benefitClaims";
import { DASHBOARD_CATEGORIES } from "@/features/dashboard/constants";
import {
  CLAIM_HISTORY_ITEMS,
  type ClaimHistoryItem,
  type ClaimStatus,
} from "@/features/claims-history/constants";
import {
  getEmployerBenefit,
  type PolicyTabId,
} from "@/features/policy/constants";

/**
 * The app keeps claims in two places: per-benefit dashboards
 * (`features/dashboard/benefitClaims`) and the claims-history screen
 * (`features/claims-history/constants`). They use different status vocabularies
 * and the history rows carry their own category labels ("Telephone & Internet"
 * where the catalog says "Mobile & Internet"). The assistant needs one list, so
 * this module normalizes both into a single indexed view. Neither screen's data
 * is modified — this is a read-only projection.
 */

export type AssistantClaimStatus =
  | "Approved"
  | "Pending"
  | "Under review"
  | "Needs info"
  | "Rejected";

/** The status values a user can filter on. "Pending" covers anything in flight. */
export type ClaimAnswerStatus =
  | "Approved"
  | "Pending"
  | "Needs info"
  | "Rejected";

export type AssistantClaim = {
  id: string;
  title: string;
  categoryId: PolicyTabId;
  category: string;
  amount: number;
  date: string;
  status: AssistantClaimStatus;
};

const HISTORY_STATUS: Record<ClaimStatus, AssistantClaimStatus> = {
  approved: "Approved",
  under_review: "Under review",
  needs_info: "Needs info",
  rejected: "Rejected",
};

function sortKey(date: string): number {
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function fromDashboard(
  claim: BenefitClaimItem,
  categoryId: PolicyTabId,
): AssistantClaim {
  return {
    id: claim.id,
    title: claim.title,
    categoryId,
    category: getEmployerBenefit(categoryId).display.label,
    amount: claim.amount,
    date: claim.date,
    status: claim.status,
  };
}

function fromHistory(claim: ClaimHistoryItem): AssistantClaim {
  // The history rows' own `category` string drifts from the catalog label, but
  // `icon` is always one of the dashboard-enabled benefit ids.
  const categoryId = claim.icon as PolicyTabId;
  return {
    id: claim.id,
    title: `${claim.merchant} - ${claim.date}`,
    categoryId,
    category: getEmployerBenefit(categoryId).display.label,
    amount: claim.amount,
    date: claim.date,
    status: HISTORY_STATUS[claim.status],
  };
}

function buildIndex(): AssistantClaim[] {
  const byId = new Map<string, AssistantClaim>();

  for (const category of DASHBOARD_CATEGORIES) {
    for (const claim of getBenefitClaimsDashboard(category.id).claims) {
      byId.set(claim.id, fromDashboard(claim, category.id));
    }
  }

  // Dashboard rows win on the (currently empty) intersection — they carry the
  // richer title and are what the per-benefit screens render.
  for (const claim of CLAIM_HISTORY_ITEMS) {
    if (byId.has(claim.id)) continue;
    byId.set(claim.id, fromHistory(claim));
  }

  return [...byId.values()].sort(
    (left, right) => sortKey(right.date) - sortKey(left.date),
  );
}

/** Every claim the assistant can talk about, newest first. */
export const ASSISTANT_CLAIMS: AssistantClaim[] = buildIndex();

export function findAssistantClaim(claimId: string): AssistantClaim | undefined {
  const normalized = claimId.trim().toUpperCase();
  return ASSISTANT_CLAIMS.find((claim) => claim.id === normalized);
}

export function matchesClaimStatus(
  claim: AssistantClaim,
  filter: ClaimAnswerStatus,
): boolean {
  if (filter === "Pending") {
    return claim.status === "Pending" || claim.status === "Under review";
  }
  return claim.status === filter;
}

export type ClaimSummary = {
  totalCount: number;
  totalAmount: number;
  approvedCount: number;
  approvedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  needsInfoCount: number;
  rejectedCount: number;
  rejectedAmount: number;
};

export function summarizeAssistantClaims(
  claims: AssistantClaim[],
): ClaimSummary {
  const sum = (items: AssistantClaim[]) =>
    items.reduce((total, claim) => total + claim.amount, 0);
  const approved = claims.filter((claim) => claim.status === "Approved");
  const pending = claims.filter((claim) =>
    matchesClaimStatus(claim, "Pending"),
  );
  const needsInfo = claims.filter((claim) => claim.status === "Needs info");
  const rejected = claims.filter((claim) => claim.status === "Rejected");

  return {
    totalCount: claims.length,
    totalAmount: sum(claims),
    approvedCount: approved.length,
    approvedAmount: sum(approved),
    pendingCount: pending.length,
    pendingAmount: sum(pending),
    needsInfoCount: needsInfo.length,
    rejectedCount: rejected.length,
    rejectedAmount: sum(rejected),
  };
}
