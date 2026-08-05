import type { ClaimOverrides } from "@/features/claims/store";

export type ClaimStatus =
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected"
  | "revoked";

export type ClaimCategoryIcon = "fuel" | "mobile" | "professional";

export type ClaimHistoryItem = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  status: ClaimStatus;
  icon: ClaimCategoryIcon;
  iconBg: string;
  iconColor: string;
};

export type ClaimStatusFilter = "all" | ClaimStatus;

export const CLAIM_STATUS_TABS: { id: ClaimStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_info", label: "Needs info" },
  { id: "under_review", label: "Under review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "revoked", label: "Revoked" },
];

/** Token-based chip classes — keep aligned with `@theme` status colors in app/globals.css */
export const CLAIM_STATUS_STYLES: Record<
  ClaimStatus,
  { label: string; className: string }
> = {
  under_review: {
    label: "Under review",
    className: "border-success-border bg-success-soft text-success",
  },
  needs_info: {
    label: "Needs info",
    className: "border-warning-border bg-warning-soft text-warning",
  },
  approved: {
    label: "Approved",
    className: "border-success-border bg-success-tint text-pine-dark",
  },
  rejected: {
    label: "Rejected",
    className: "border-transparent bg-danger-soft text-danger",
  },
  revoked: {
    label: "Revoked",
    className: "border-transparent bg-danger-soft text-danger",
  },
};

export const CLAIM_HISTORY_ITEMS: ClaimHistoryItem[] = [
  {
    id: "CLM-124",
    merchant: "Jio Fiber",
    category: "Telephone & Internet",
    amount: 899,
    date: "05 Jul 2026",
    status: "rejected",
    icon: "mobile",
    iconBg: "#FFF8E8",
    iconColor: "#B25E00",
  },
  {
    id: "CLM-45201",
    merchant: "Airtel Broadband",
    category: "Telephone & Internet",
    amount: 1299,
    date: "12 May 2026",
    status: "under_review",
    icon: "mobile",
    iconBg: "#FFF8E8",
    iconColor: "#B25E00",
  },
  {
    id: "CLM-45188",
    merchant: "Indian Oil",
    category: "Fuel & Maintenance",
    amount: 3400,
    date: "11 May 2026",
    status: "needs_info",
    icon: "fuel",
    iconBg: "#EAF3F0",
    iconColor: "#005656",
  },
  {
    id: "CLM-45140",
    merchant: "Coursera",
    category: "Professional Development",
    amount: 7999,
    date: "03 May 2026",
    status: "approved",
    icon: "professional",
    iconBg: "#E7F6EF",
    iconColor: "#003434",
  },
  {
    id: "CLM-45092",
    merchant: "HP Petrol Kothrud",
    category: "Fuel & Maintenance",
    amount: 600,
    date: "28 Apr 2026",
    status: "approved",
    icon: "fuel",
    iconBg: "#EAF3F0",
    iconColor: "#005656",
  },
  {
    id: "CLM-45071",
    merchant: "Jio Fiber",
    category: "Telephone & Internet",
    amount: 899,
    date: "25 Apr 2026",
    status: "approved",
    icon: "mobile",
    iconBg: "#FFF8E8",
    iconColor: "#B25E00",
  },
  {
    id: "CLM-45033",
    merchant: "Shell Aundh",
    category: "Fuel & Maintenance",
    amount: 1100,
    date: "20 Apr 2026",
    status: "rejected",
    icon: "fuel",
    iconBg: "#EAF3F0",
    iconColor: "#005656",
  },
  {
    id: "CLM-44990",
    merchant: "Udemy",
    category: "Professional Development",
    amount: 2499,
    date: "15 Apr 2026",
    status: "approved",
    icon: "professional",
    iconBg: "#E7F6EF",
    iconColor: "#003434",
  },
];

export function getClaimHistoryItem(claimId: string): ClaimHistoryItem | undefined {
  const normalized = claimId.trim().toUpperCase();
  return CLAIM_HISTORY_ITEMS.find((item) => item.id === normalized);
}

export function applyClaimHistoryOverrides(
  claims: ClaimHistoryItem[],
  overrides: ClaimOverrides,
): ClaimHistoryItem[] {
  return claims.map((claim) => {
    const override = overrides[claim.id];
    if (!override) return claim;
    const status: ClaimStatus =
      override.status === "Revoked"
        ? "revoked"
        : override.status === "Needs info"
          ? "needs_info"
          : override.status === "Under review" || override.status === "Pending"
            ? "under_review"
            : override.status === "Approved"
              ? "approved"
              : override.status === "Rejected"
                ? "rejected"
                : claim.status;
    return {
      ...claim,
      merchant: override.vendor ?? claim.merchant,
      category: override.category ?? claim.category,
      amount: override.amount ?? claim.amount,
      status,
    };
  });
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isClaimStatusFilter(
  value: string | null | undefined,
): value is ClaimStatusFilter {
  return (
    value === "all" ||
    value === "needs_info" ||
    value === "under_review" ||
    value === "approved" ||
    value === "rejected" ||
    value === "revoked"
  );
}
