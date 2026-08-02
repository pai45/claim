import {
  EMPLOYER_BENEFITS_CATALOG,
  type PolicyTabId,
} from "@/features/policy/constants";

export type DashboardCategory = {
  id: PolicyTabId;
  name: string;
  amount: number;
  utilized: number;
  allocation: number;
  iconBg: string;
  iconColor: string;
  icon: "fuel" | "mobile" | "driver" | "books" | "professional";
};

export const DASHBOARD_CATEGORIES: DashboardCategory[] =
  EMPLOYER_BENEFITS_CATALOG.benefits
    .filter(
      (benefit) =>
        benefit.display.dashboardEnabled && benefit.display.dashboardIcon,
    )
    .map((benefit) => ({
      id: benefit.id,
      name: benefit.display.label,
      amount: benefit.balance.available,
      utilized: benefit.balance.utilized,
      allocation: benefit.balance.allocation,
      iconBg: benefit.display.iconBg,
      iconColor: benefit.display.iconTone,
      icon: benefit.display.dashboardIcon as DashboardCategory["icon"],
    }));

export const AVAILABLE_LIMIT = DASHBOARD_CATEGORIES.reduce(
  (total, category) => total + category.amount,
  0,
);
export const UTILIZED_AMOUNT = DASHBOARD_CATEGORIES.reduce(
  (total, category) => total + category.utilized,
  0,
);
export const FY_LIMIT = DASHBOARD_CATEGORIES.reduce(
  (total, category) => total + category.allocation,
  0,
);
export const FY_LABEL = EMPLOYER_BENEFITS_CATALOG.financialYear;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
