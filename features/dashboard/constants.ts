import type { PolicyTabId } from "@/features/policy/constants";

export type DashboardCategory = {
  id: PolicyTabId;
  name: string;
  amount: number;
  iconBg: string;
  iconColor: string;
  icon: "fuel" | "mobile" | "driver" | "books" | "professional";
};

export const AVAILABLE_LIMIT = 93000;
export const UTILIZED_AMOUNT = 7000;
export const FY_LIMIT = 125000;
export const FY_LABEL = "FY 26/27";

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  {
    id: "fuel",
    name: "Fuel & Maintenance",
    amount: 25000,
    iconBg: "#FAFCFC",
    iconColor: "#005656",
    icon: "fuel",
  },
  {
    id: "mobile",
    name: "Mobile & Internet",
    amount: 25000,
    iconBg: "#FFFCF5",
    iconColor: "#B54708",
    icon: "mobile",
  },
  {
    id: "driver",
    name: "Driver Salary",
    amount: 25000,
    iconBg: "#FFFBFA",
    iconColor: "#745C53",
    icon: "driver",
  },
  {
    id: "books",
    name: "Books & Periodicals",
    amount: 25000,
    iconBg: "#F6FEF9",
    iconColor: "#166534",
    icon: "books",
  },
  {
    id: "professional",
    name: "Professional Development",
    amount: 25000,
    iconBg: "#F2F8FD",
    iconColor: "#1D4ED8",
    icon: "professional",
  },
];

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
