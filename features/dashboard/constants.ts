import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  type PolicyTabId,
} from "@/features/policy/constants";
import type { PersonaId } from "@/features/persona/types";

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

export function getDashboardCategories(
  personaId?: PersonaId,
): DashboardCategory[] {
  return DASHBOARD_CATEGORIES.map((category) => {
    const benefit = getEmployerBenefit(category.id, personaId);
    return {
      ...category,
      amount: benefit.balance.available,
      utilized: benefit.balance.utilized,
      allocation: benefit.balance.allocation,
    };
  });
}

export function getDashboardTotals(personaId?: PersonaId): {
  availableLimit: number;
  utilizedAmount: number;
  financialYearLimit: number;
} {
  const categories = getDashboardCategories(personaId);
  return categories.reduce(
    (totals, category) => ({
      availableLimit: totals.availableLimit + category.amount,
      utilizedAmount: totals.utilizedAmount + category.utilized,
      financialYearLimit: totals.financialYearLimit + category.allocation,
    }),
    { availableLimit: 0, utilizedAmount: 0, financialYearLimit: 0 },
  );
}

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
