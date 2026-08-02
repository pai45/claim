import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  type PolicyTabId,
} from "@/features/policy/constants";
import { DASHBOARD_CATEGORIES } from "./constants";

export type BenefitClaimStatus = "Approved" | "Pending" | "Under review";

export type BenefitClaimItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: BenefitClaimStatus;
};

export type BenefitClaimsDashboard = {
  categoryId: PolicyTabId;
  title: string;
  availableLimit: number;
  utilized: number;
  accrued: number;
  frequencyLabel: string;
  monthLabel: string;
  monthTotal: number;
  monthApproved: number;
  monthPending: number;
  claims: BenefitClaimItem[];
};

const FY = EMPLOYER_BENEFITS_CATALOG.financialYear;

function booksDashboard(): BenefitClaimsDashboard {
  return {
    categoryId: "books",
    title: "Books & Periodicals",
    availableLimit: 48000,
    utilized: 7000,
    accrued: 32000,
    frequencyLabel: "Annually",
    monthLabel: "July 2026",
    monthTotal: 13500,
    monthApproved: 13000,
    monthPending: 500,
    claims: [
      {
        id: "CLM-43872",
        title: "Amazon Books - May 2026",
        category: "Books & Periodicals",
        amount: 1450,
        date: "08 May 2026",
        status: "Approved",
      },
      {
        id: "CLM-43810",
        title: "Flipkart Books - Apr 2026",
        category: "Books & Periodicals",
        amount: 890,
        date: "22 Apr 2026",
        status: "Approved",
      },
      {
        id: "CLM-43790",
        title: "Kindle Store - Apr 2026",
        category: "Books & Periodicals",
        amount: 660,
        date: "15 Apr 2026",
        status: "Approved",
      },
      {
        id: "CLM-43755",
        title: "Crossword - Apr 2026",
        category: "Books & Periodicals",
        amount: 1000,
        date: "02 Apr 2026",
        status: "Pending",
      },
    ],
  };
}

function fuelDashboard(): BenefitClaimsDashboard {
  return {
    categoryId: "fuel",
    title: "Fuel & Maintenance",
    availableLimit: 42000,
    utilized: 18000,
    accrued: 60000,
    frequencyLabel: "Monthly",
    monthLabel: "July 2026",
    monthTotal: 18500,
    monthApproved: 15000,
    monthPending: 3500,
    claims: [
      {
        id: "CLM-44120",
        title: "Indian Oil - July 2026",
        category: "Fuel & Maintenance",
        amount: 4500,
        date: "10 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44088",
        title: "HP Petrol Pump - July 2026",
        category: "Fuel & Maintenance",
        amount: 3200,
        date: "04 July 2026",
        status: "Pending",
      },
      {
        id: "CLM-44012",
        title: "Bosch Service - June 2026",
        category: "Fuel & Maintenance",
        amount: 6800,
        date: "22 June 2026",
        status: "Approved",
      },
      {
        id: "CLM-43980",
        title: "MRF Tyres - June 2026",
        category: "Fuel & Maintenance",
        amount: 4000,
        date: "12 June 2026",
        status: "Approved",
      },
    ],
  };
}

function mobileDashboard(): BenefitClaimsDashboard {
  return {
    categoryId: "mobile",
    title: "Mobile & Internet",
    availableLimit: 22000,
    utilized: 8000,
    accrued: 30000,
    frequencyLabel: "Monthly",
    monthLabel: "July 2026",
    monthTotal: 3200,
    monthApproved: 2700,
    monthPending: 500,
    claims: [
      {
        id: "CLM-44201",
        title: "Airtel Postpaid - July 2026",
        category: "Mobile & Internet",
        amount: 999,
        date: "05 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44185",
        title: "Jio Fiber - July 2026",
        category: "Mobile & Internet",
        amount: 1299,
        date: "03 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44140",
        title: "Airtel Broadband - June 2026",
        category: "Mobile & Internet",
        amount: 500,
        date: "28 June 2026",
        status: "Pending",
      },
      {
        id: "CLM-44090",
        title: "Airtel Postpaid - June 2026",
        category: "Mobile & Internet",
        amount: 999,
        date: "05 June 2026",
        status: "Approved",
      },
    ],
  };
}

function driverDashboard(): BenefitClaimsDashboard {
  return {
    categoryId: "driver",
    title: "Driver Salary",
    availableLimit: 55000,
    utilized: 35000,
    accrued: 90000,
    frequencyLabel: "Monthly",
    monthLabel: "July 2026",
    monthTotal: 15000,
    monthApproved: 15000,
    monthPending: 0,
    claims: [
      {
        id: "CLM-44300",
        title: "Driver Salary - July 2026",
        category: "Driver Salary",
        amount: 15000,
        date: "01 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44250",
        title: "Driver Salary - June 2026",
        category: "Driver Salary",
        amount: 15000,
        date: "01 June 2026",
        status: "Approved",
      },
      {
        id: "CLM-44200",
        title: "Driver Salary - May 2026",
        category: "Driver Salary",
        amount: 15000,
        date: "01 May 2026",
        status: "Approved",
      },
    ],
  };
}

function professionalDashboard(): BenefitClaimsDashboard {
  return {
    categoryId: "professional",
    title: "Professional Development",
    availableLimit: 38000,
    utilized: 12000,
    accrued: 50000,
    frequencyLabel: "Annually",
    monthLabel: "July 2026",
    monthTotal: 8500,
    monthApproved: 6500,
    monthPending: 2000,
    claims: [
      {
        id: "CLM-44410",
        title: "Coursera Certificate - July 2026",
        category: "Professional Development",
        amount: 4500,
        date: "09 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44388",
        title: "Udemy Course - July 2026",
        category: "Professional Development",
        amount: 2000,
        date: "02 July 2026",
        status: "Approved",
      },
      {
        id: "CLM-44340",
        title: "AWS Exam Fee - June 2026",
        category: "Professional Development",
        amount: 2000,
        date: "18 June 2026",
        status: "Pending",
      },
    ],
  };
}

const DASHBOARDS: Record<string, BenefitClaimsDashboard> = {
  books: booksDashboard(),
  fuel: fuelDashboard(),
  mobile: mobileDashboard(),
  driver: driverDashboard(),
  professional: professionalDashboard(),
};

/** Flat list of all sample benefit claims (for claim-details lookup). */
export const ALL_BENEFIT_CLAIMS: BenefitClaimItem[] = Object.values(
  DASHBOARDS,
).flatMap((dashboard) => dashboard.claims);

export const BENEFIT_DASHBOARD_FY_LABEL = FY;

export function getBenefitClaimsDashboard(
  categoryId: string,
): BenefitClaimsDashboard {
  const known = DASHBOARDS[categoryId];
  if (known) {
    const policy = getEmployerBenefit(known.categoryId);
    return {
      ...known,
      availableLimit: policy.balance.available,
      utilized: policy.balance.utilized,
      accrued: policy.balance.allocation,
    };
  }

  const fallback =
    DASHBOARD_CATEGORIES.find((item) => item.id === categoryId) ??
    DASHBOARD_CATEGORIES[0];

  return {
    ...booksDashboard(),
    categoryId: fallback.id,
    title: fallback.name,
  };
}

export function isDashboardCategoryId(value: string): boolean {
  return DASHBOARD_CATEGORIES.some((item) => item.id === value);
}

export function statusStyles(status: BenefitClaimStatus): {
  bg: string;
  border: string;
  text: string;
} {
  if (status === "Approved") {
    return { bg: "#ECFDF3", border: "#A9EFC5", text: "#085D3A" };
  }
  if (status === "Pending") {
    return { bg: "#FFFAEB", border: "#FEDF89", text: "#B37727" };
  }
  return { bg: "#F3FCF6", border: "#D1F3DF", text: "#279E6C" };
}
