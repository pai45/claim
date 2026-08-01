export type ClaimStatus =
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected";

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
];

export const CLAIM_STATUS_STYLES: Record<
  ClaimStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  under_review: {
    label: "Under review",
    bg: "#F3FCF6",
    border: "#D1F3DF",
    text: "#279E6C",
  },
  needs_info: {
    label: "Needs info",
    bg: "#FFFAEB",
    border: "#FEDF89",
    text: "#B37727",
  },
  approved: {
    label: "Approved",
    bg: "#ECFDF3",
    border: "#A9EFC5",
    text: "#085D3A",
  },
  rejected: {
    label: "Rejected",
    bg: "#FEF3F2",
    border: "#FECDCA",
    text: "#912018",
  },
};

export const CLAIM_HISTORY_ITEMS: ClaimHistoryItem[] = [
  {
    id: "CLM-45201",
    merchant: "Airtel Broadband",
    category: "Telephone & Internet",
    amount: 1299,
    date: "12 May 2026",
    status: "under_review",
    icon: "mobile",
    iconBg: "#FFFCF5",
    iconColor: "#B54708",
  },
  {
    id: "CLM-45188",
    merchant: "Indian Oil",
    category: "Fuel & Maintenance",
    amount: 3400,
    date: "11 May 2026",
    status: "needs_info",
    icon: "fuel",
    iconBg: "#FAFCFC",
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
    iconBg: "#F2F8FD",
    iconColor: "#1D4ED8",
  },
  {
    id: "CLM-45092",
    merchant: "HP Petrol Kothrud",
    category: "Fuel & Maintenance",
    amount: 600,
    date: "28 Apr 2026",
    status: "approved",
    icon: "fuel",
    iconBg: "#FAFCFC",
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
    iconBg: "#FFFCF5",
    iconColor: "#B54708",
  },
  {
    id: "CLM-45033",
    merchant: "Shell Aundh",
    category: "Fuel & Maintenance",
    amount: 1100,
    date: "20 Apr 2026",
    status: "rejected",
    icon: "fuel",
    iconBg: "#FAFCFC",
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
    iconBg: "#F2F8FD",
    iconColor: "#1D4ED8",
  },
];

export function getClaimHistoryItem(claimId: string): ClaimHistoryItem | undefined {
  const normalized = claimId.trim().toUpperCase();
  return CLAIM_HISTORY_ITEMS.find((item) => item.id === normalized);
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
    value === "rejected"
  );
}
