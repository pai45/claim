import {
  CLAIM_STATUS_STYLES,
  getClaimHistoryItem,
  type ClaimStatus,
} from "@/features/claims-history/constants";
import { ALL_BENEFIT_CLAIMS } from "@/features/dashboard/benefitClaims";

export type ClaimProgressStatus = "done" | "upcoming";

export type ClaimProgressStep = {
  id: string;
  title: string;
  detail: string;
  status: ClaimProgressStatus;
};

export type ClaimDetails = {
  id: string;
  vendor: string;
  status: string;
  category: string;
  amount: string;
  submittedAt: string;
  currentStatus: string;
  notifyNote: string;
  progress: ClaimProgressStep[];
};

export const SAMPLE_CLAIMS: Record<string, ClaimDetails> = {
  "CLM-43872": {
    id: "CLM-43872",
    vendor: "Amazon Books",
    status: "Under review",
    category: "Books & Periodicals",
    amount: "₹1,299",
    submittedAt: "12 May 2026, 10:30 AM",
    currentStatus: "Under review",
    notifyNote: "I'll notify you once it's approved.",
    progress: [
      {
        id: "submitted",
        title: "Submitted",
        detail: "12 May 2026",
        status: "done",
      },
      {
        id: "policy",
        title: "Policy checked",
        detail: "12 May 2026",
        status: "done",
      },
      {
        id: "review",
        title: "Under review",
        detail: "12 May 2026",
        status: "done",
      },
      {
        id: "reimbursed",
        title: "Reimbursed",
        detail: "Upcoming",
        status: "upcoming",
      },
    ],
  },
};

function buildProgress(
  dateLabel: string,
  statusLabel: string,
): ClaimProgressStep[] {
  const isApproved = statusLabel === "Approved";
  const isRejected = statusLabel === "Rejected";
  const isNeedsInfo = statusLabel === "Needs info";

  return [
    {
      id: "submitted",
      title: "Submitted",
      detail: dateLabel,
      status: "done",
    },
    {
      id: "policy",
      title: "Policy checked",
      detail: dateLabel,
      status: "done",
    },
    {
      id: "review",
      title: isApproved
        ? "Approved"
        : isRejected
          ? "Rejected"
          : isNeedsInfo
            ? "Needs info"
            : "Under review",
      detail: dateLabel,
      status: "done",
    },
    {
      id: "reimbursed",
      title: "Reimbursed",
      detail: isApproved ? dateLabel : "Upcoming",
      status: isApproved ? "done" : "upcoming",
    },
  ];
}

function formatClaimAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function notifyNoteForStatus(statusLabel: string): string {
  if (statusLabel === "Approved") return "This claim has been approved.";
  if (statusLabel === "Rejected") {
    return "This claim was rejected. Contact support if you need help.";
  }
  if (statusLabel === "Needs info") {
    return "Additional information is needed to process this claim.";
  }
  return "I'll notify you once it's approved.";
}

function statusLabelFromHistory(status: ClaimStatus): string {
  return CLAIM_STATUS_STYLES[status].label;
}

export function getClaimDetails(claimId: string): ClaimDetails {
  const normalized = claimId.trim().toUpperCase();

  const fromHistory = getClaimHistoryItem(normalized);
  if (fromHistory) {
    const status = statusLabelFromHistory(fromHistory.status);
    return {
      id: fromHistory.id,
      vendor: fromHistory.merchant,
      status,
      category: fromHistory.category,
      amount: formatClaimAmount(fromHistory.amount),
      submittedAt: `${fromHistory.date}, 10:30 AM`,
      currentStatus: status,
      notifyNote: notifyNoteForStatus(status),
      progress: buildProgress(fromHistory.date, status),
    };
  }

  const fromBenefit = ALL_BENEFIT_CLAIMS.find((item) => item.id === normalized);
  if (fromBenefit) {
    const status =
      fromBenefit.status === "Approved" ? "Approved" : "Under review";
    const vendor = fromBenefit.title.split(" - ")[0] ?? fromBenefit.title;

    return {
      id: fromBenefit.id,
      vendor,
      status,
      category: fromBenefit.category,
      amount: formatClaimAmount(fromBenefit.amount),
      submittedAt: `${fromBenefit.date}, 10:30 AM`,
      currentStatus: status,
      notifyNote: notifyNoteForStatus(status),
      progress: buildProgress(fromBenefit.date, fromBenefit.status),
    };
  }

  const known = SAMPLE_CLAIMS[normalized];
  if (known) return known;

  return {
    ...SAMPLE_CLAIMS["CLM-43872"],
    id: normalized || "CLM-43872",
  };
}

export function createClaimId(): string {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `CLM-${n}`;
}
