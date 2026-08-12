import { getActivePersonaId } from "@/features/persona/store";
import { getBenefitsStatePersonaId } from "@/features/persona/benefitsState";
import type { PersonaId } from "@/features/persona/types";
import { getMobileClaimDebit } from "@/features/transactions/financialState";

export type PolicyTabId =
  | "meal"
  | "fuel"
  | "mobile"
  | "driver"
  | "books"
  | "professional";

export type PolicyListIconId = PolicyTabId;

export type PolicyListItem = {
  id: PolicyTabId;
  label: string;
  iconBg: string;
  iconTone: string;
};

export type PolicyBenefit = {
  title: string;
  detail: string;
  icon: "tax" | "limit" | "proof" | "frequency";
};

export type PolicyStep = {
  title: string;
  detail: string;
};

export type PolicyCategory = {
  id: PolicyTabId;
  aliases: string[];
  tabLabel: string;
  title: string;
  eyebrow?: string;
  whatIsHeading: string;
  description: string;
  notes: string[];
  benefits: PolicyBenefit[];
  covered?: string[];
  steps: PolicyStep[];
};

export type BenefitBalance = {
  allocation: number;
  utilized: number;
  available: number;
};

export type BenefitTaxTreatment = {
  label: string;
  summary: string;
  qualifier: string;
  disclaimer: string;
};

export type BenefitClaimRules = {
  proofRequired: string;
  submissionDeadlineDay?: number;
  requiredFields: Array<
    "category" | "vendor" | "amount" | "billDate" | "invoiceNo"
  >;
};

export type EmployerBenefit = PolicyCategory & {
  display: PolicyListItem & {
    dashboardEnabled: boolean;
    dashboardIcon?: "fuel" | "mobile" | "driver" | "books" | "professional";
  };
  balance: BenefitBalance;
  claimRules: BenefitClaimRules;
  taxTreatment: BenefitTaxTreatment;
};

export type BenefitsPrivacyConfig = {
  retentionDays: number;
  processingLocation: "device";
  originalFilesPersisted: false;
  rawOcrPersisted: false;
  recipients: string[];
  demoSubmissionOnly: true;
};

export const POLICY_CATEGORIES: PolicyCategory[] = [
  {
    id: "meal",
    aliases: [
      "meal",
      "meals",
      "food",
      "restaurant",
      "cafeteria",
      "meal wallet",
      "dining",
      "lunch",
      "dinner",
      "swiggy",
      "zomato",
    ],
    tabLabel: "Meal Wallet",
    title: "Meal Wallet Benefit",
    whatIsHeading: "What is Meal Wallet Benefit?",
    description:
      "Your meal wallet supports food expenses as part of CTC flexible benefits. With valid bills, reimbursements can be structured under common employer meal voucher practices aligned to Section 10(14) style allowances.",
    notes: [
      "Claims are for employee food and meal expenses only",
      "Restaurant or food invoices must be in the employee's name where applicable",
      "Alcohol and personal entertainment spends are not eligible",
      "All monthly claims must be submitted before the 5th of subsequent month",
    ],
    benefits: [
      {
        title: "Potential Tax Treatment",
        detail: "Eligibility depends on employer policy and your applicable tax regime",
        icon: "tax",
      },
      {
        title: "Monthly Limit",
        detail: "₹2,500",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "GST food / restaurant invoices",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "Monthly",
        icon: "frequency",
      },
    ],
    covered: [
      "Restaurant bills",
      "Cloud kitchen invoices",
      "Office cafeteria spends",
      "Grocery meal kits",
      "Meal card top-ups",
      "Working lunch expenses",
    ],
    steps: [
      {
        title: "Spend on Eligible Meals",
        detail: "Use your meal wallet for food purchases within the monthly limit.",
      },
      {
        title: "Collect Invoices",
        detail: "Keep GST invoices or meal receipts for every claim.",
      },
      {
        title: "Submit Monthly Claims",
        detail: "Upload bills on the portal before the monthly deadline.",
      },
      {
        title: "Payroll Review",
        detail: "Approved meal reimbursements are processed according to employer payroll policy.",
      },
    ],
  },
  {
    id: "fuel",
    aliases: [
      "fuel",
      "petrol",
      "diesel",
      "vehicle maintenance",
      "car maintenance",
      "fuel and maintenance",
      "fuel wallet",
      "gas",
      "mileage",
    ],
    tabLabel: "Fuel & Maintenance",
    title: "Fuel & Maintenance Benefit",
    whatIsHeading: "What is Fuel & Maintenance Benefit?",
    description:
      "This employer reimbursement can cover eligible vehicle costs when your company policy, documentation, and payroll review requirements are met.",
    notes: [
      "The vehicle must be registered in the employee's name",
      "Fuel bills must match the fuel type (Petrol/Diesel) declared",
      "Original printed GST invoices are required",
      "All monthly claims must be submitted before the 5th of subsequent month",
    ],
    benefits: [
      {
        title: "Potential Tax Treatment",
        detail: "Eligibility depends on employer policy and your applicable tax regime",
        icon: "tax",
      },
      {
        title: "Monthly Limit",
        detail: "₹15,000",
        icon: "limit",
      },
      {
        title: "Fuel Cover",
        detail: "Bills, invoices, servicing & tyres",
        icon: "proof",
      },
      {
        title: "Reimbursement Frequency",
        detail: "Monthly",
        icon: "frequency",
      },
    ],
    covered: [
      "Fuel & Lubricants",
      "Regular Vehicle Servicing",
      "Tyre & Battery Replacement",
      "Car Insurance Premium",
      "Pollution Certificate (PUC)",
      "Parking Charges & Tolls",
    ],
    steps: [
      {
        title: "Register Vehicle",
        detail: "Submit vehicle details and RC book under your name.",
      },
      {
        title: "Track Expenses",
        detail: "Keep original tax invoices of fuel & maintenance.",
      },
      {
        title: "Submit Monthly Claims",
        detail: "Upload bills on the portal before monthly deadline.",
      },
      {
        title: "Payroll Review",
        detail: "Approved reimbursements are processed according to employer payroll policy.",
      },
    ],
  },
  {
    id: "mobile",
    aliases: [
      "mobile",
      "phone",
      "telephone",
      "internet",
      "broadband",
      "wifi",
      "wi-fi",
      "data plan",
      "cellular",
      "recharge",
      "mobile wallet",
    ],
    tabLabel: "Mobile & Internet",
    title: "Mobile & Internet Benefit",
    whatIsHeading: "What is Mobile & Internet Benefit?",
    description:
      "Telephone and internet reimbursements are a common Section 10(14) style allowance in Indian CTC structures, covering official communication needs with valid postpaid or broadband bills.",
    notes: [
      "Bills must be in the employee's name",
      "Only postpaid mobile / broadband / data plans are typically eligible",
      "Device purchase EMIs are usually not covered under this wallet",
      "All monthly claims must be submitted before the 5th of subsequent month",
    ],
    benefits: [
      {
        title: "Potential Tax Treatment",
        detail: "Eligibility depends on employer policy and your applicable tax regime",
        icon: "tax",
      },
      {
        title: "Monthly Limit",
        detail: "₹3,000",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "Postpaid / broadband GST invoices",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "Monthly",
        icon: "frequency",
      },
    ],
    covered: [
      "Mobile postpaid bills",
      "Home broadband",
      "Dongle / data cards",
      "Official ISD / STD usage",
      "Wi-Fi router rental plans",
      "Work-from-home internet",
    ],
    steps: [
      {
        title: "Keep Plan Active",
        detail: "Maintain a postpaid mobile or broadband connection in your name.",
      },
      {
        title: "Download Monthly Bill",
        detail: "Save the operator GST invoice every billing cycle.",
      },
      {
        title: "Submit Claim",
        detail: "Upload the bill before the monthly reimbursement cutoff.",
      },
      {
        title: "Payroll Review",
        detail: "Approved communication expenses are processed according to employer payroll policy.",
      },
    ],
  },
  {
    id: "driver",
    aliases: ["driver", "chauffeur", "driver salary", "driver wallet"],
    tabLabel: "Driver Salary",
    title: "Driver Salary Benefits",
    eyebrow: "Reimbursement Wallet",
    whatIsHeading: "What is Driver Salary Benefit?",
    description:
      "Your company offers a driver salary allowance in your CTC. Eligibility and payroll treatment depend on company policy, documentation, and your applicable tax regime.",
    notes: [
      "Driver must have a valid driving licence",
      "Salary must be paid via bank transfer or cheque",
      "Claims must be submitted before the 5th of next month",
      "Unused allowance cannot be carried forward",
    ],
    benefits: [
      {
        title: "Potential Tax Treatment",
        detail: "Eligibility depends on employer policy and your applicable tax regime",
        icon: "tax",
      },
      {
        title: "Monthly Limit",
        detail: "₹15,000",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "Monthly salary receipts",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "Monthly",
        icon: "frequency",
      },
    ],
    steps: [
      {
        title: "Register Your Driver",
        detail:
          "Add your driver details including name, mobile number, and driving licence",
      },
      {
        title: "Set Monthly Salary",
        detail: "Define the monthly salary amount within your allowance limit",
      },
      {
        title: "Submit Monthly Claims",
        detail: "Upload salary payment proof each month through the app",
      },
      {
        title: "Payroll Review",
        detail: "Approved claims are processed according to employer payroll policy",
      },
    ],
  },
  {
    id: "books",
    aliases: [
      "book",
      "books",
      "periodical",
      "periodicals",
      "journal",
      "journals",
      "publication",
      "magazines",
      "books wallet",
    ],
    tabLabel: "Books & Periodicals",
    title: "Books & Periodicals Benefits",
    eyebrow: "Reimbursement Wallet",
    whatIsHeading: "What is Books & Periodicals Benefit?",
    description:
      "Reimburse professional books, journals, and periodicals purchased for skill development under your CTC wallet.",
    notes: [
      "Purchase must be for professional or educational use",
      "Invoice must clearly mention book or periodical details",
      "Claims must be submitted before the 5th of next month",
      "Unused allowance cannot be carried forward",
    ],
    benefits: [
      {
        title: "Potential Tax Treatment",
        detail: "Eligibility depends on employer policy and your applicable tax regime",
        icon: "tax",
      },
      {
        title: "Monthly Limit",
        detail: "₹5,000",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "Book / subscription invoices",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "Monthly",
        icon: "frequency",
      },
    ],
    steps: [
      {
        title: "Buy Eligible Content",
        detail: "Purchase books or periodicals related to your work",
      },
      {
        title: "Upload Invoice",
        detail: "Submit a clear invoice through the claims assistant",
      },
      {
        title: "Get Reviewed",
        detail: "Claims are checked against category rules and limits",
      },
      {
        title: "Payroll Review",
        detail: "Approved reimbursements are processed according to employer payroll policy",
      },
    ],
  },
  {
    id: "professional",
    aliases: [
      "professional development",
      "skill development",
      "learning",
      "course",
      "courses",
      "certification",
      "certifications",
      "workshop",
      "training",
      "conference",
      "upskilling",
      "l&d",
      "professional wallet",
    ],
    tabLabel: "Professional Development",
    title: "Professional Development Benefit",
    whatIsHeading: "What is Professional Development Benefit?",
    description:
      "Claim work-related learning spends such as courses, certifications, and workshops. Many employers offer this as a skill development reimbursement within CTC flexible benefits.",
    notes: [
      "Learning must be relevant to your current or future role",
      "Personal hobby courses are not eligible",
      "Invoice must be from a recognised institute or learning platform",
      "Submit claims within the policy window for the billing month",
    ],
    benefits: [
      {
        title: "Tax Treatment",
        detail: "As per employer L&D / Section 10(14) style policy",
        icon: "tax",
      },
      {
        title: "Annual Limit",
        detail: "₹50,000",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "Course / certification invoices",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "As incurred",
        icon: "frequency",
      },
    ],
    covered: [
      "Online courses",
      "Professional certifications",
      "Workshops & seminars",
      "Exam fees",
      "Conference tickets",
      "Role-related training",
    ],
    steps: [
      {
        title: "Choose Eligible Learning",
        detail: "Pick a course or certification aligned to your role.",
      },
      {
        title: "Complete Purchase",
        detail: "Pay and collect a detailed invoice from the provider.",
      },
      {
        title: "Submit Claim",
        detail: "Upload invoice and course details in the claims assistant.",
      },
      {
        title: "Get Reimbursed",
        detail: "Approved L&D spends are reimbursed as per company policy.",
      },
    ],
  },
];

const QUALIFIED_TAX_TREATMENT: BenefitTaxTreatment = {
  label: "Potential tax treatment",
  summary:
    "Eligible reimbursements may receive tax-efficient payroll treatment.",
  qualifier:
    "Eligibility depends on your employer policy, applicable tax regime, documentation, and payroll review.",
  disclaimer: "This is policy guidance, not tax advice.",
};

const BENEFIT_CONFIGURATION: Record<
  PolicyTabId,
  Pick<EmployerBenefit, "display" | "balance" | "claimRules">
> = {
  meal: {
    display: {
      id: "meal",
      label: "Meal Wallet",
      iconBg: "#FFE6BC",
      iconTone: "#B65400",
      dashboardEnabled: false,
    },
    balance: { allocation: 30000, utilized: 0, available: 30000 },
    claimRules: {
      proofRequired: "GST food or restaurant invoice",
      submissionDeadlineDay: 5,
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
  fuel: {
    display: {
      id: "fuel",
      label: "Fuel & Maintenance",
      iconBg: "#EAF3F0",
      iconTone: "#005656",
      dashboardEnabled: true,
      dashboardIcon: "fuel",
    },
    balance: { allocation: 60000, utilized: 18000, available: 42000 },
    claimRules: {
      proofRequired: "Original GST fuel or maintenance invoice",
      submissionDeadlineDay: 5,
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
  mobile: {
    display: {
      id: "mobile",
      label: "Mobile & Internet",
      iconBg: "#E6F7F0",
      iconTone: "#B25E00",
      dashboardEnabled: true,
      dashboardIcon: "mobile",
    },
    balance: { allocation: 2000, utilized: 0, available: 2000 },
    claimRules: {
      proofRequired: "Postpaid mobile or broadband GST invoice",
      submissionDeadlineDay: 5,
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
  driver: {
    display: {
      id: "driver",
      label: "Driver Salary",
      iconBg: "#F3EFED",
      iconTone: "#745C53",
      dashboardEnabled: true,
      dashboardIcon: "driver",
    },
    balance: { allocation: 90000, utilized: 45000, available: 45000 },
    claimRules: {
      proofRequired: "Monthly salary receipt and driver licence",
      submissionDeadlineDay: 5,
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
  books: {
    display: {
      id: "books",
      label: "Books & Periodicals",
      iconBg: "#EAF7EE",
      iconTone: "#279E6C",
      dashboardEnabled: true,
      dashboardIcon: "books",
    },
    balance: { allocation: 55000, utilized: 7000, available: 48000 },
    claimRules: {
      proofRequired: "Book or subscription invoice",
      submissionDeadlineDay: 5,
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
  professional: {
    display: {
      id: "professional",
      label: "Professional Development",
      iconBg: "#E8EFFF",
      iconTone: "#003434",
      dashboardEnabled: true,
      dashboardIcon: "professional",
    },
    balance: { allocation: 50000, utilized: 12000, available: 38000 },
    claimRules: {
      proofRequired: "Course or certification invoice",
      requiredFields: ["category", "vendor", "amount", "billDate"],
    },
  },
};

export const EMPLOYER_BENEFITS_CATALOG = {
  employerName: "Pine Labs",
  financialYear: "FY 26/27",
  policyVersion: "2026.1-demo",
  effectiveDate: "2026-04-01",
  reviewSla: "2–3 business days",
  privacy: {
    retentionDays: 7,
    processingLocation: "device",
    originalFilesPersisted: false,
    rawOcrPersisted: false,
    recipients: [],
    demoSubmissionOnly: true,
  } satisfies BenefitsPrivacyConfig,
  benefits: POLICY_CATEGORIES.map((policy): EmployerBenefit => ({
    ...policy,
    ...BENEFIT_CONFIGURATION[policy.id],
    taxTreatment: QUALIFIED_TAX_TREATMENT,
  })),
} as const;

export const POLICY_LIST_ITEMS: PolicyListItem[] =
  EMPLOYER_BENEFITS_CATALOG.benefits.map(({ display }) => ({
    id: display.id,
    label: display.label,
    iconBg: display.iconBg,
    iconTone: display.iconTone,
  }));

export function getEmployerBenefit(
  id: PolicyTabId,
  personaId?: PersonaId,
): EmployerBenefit {
  const activePersona = personaId ?? getActivePersonaId();
  const benefit =
    EMPLOYER_BENEFITS_CATALOG.benefits.find((b) => b.id === id) ??
    EMPLOYER_BENEFITS_CATALOG.benefits[0];

  const benefitsPersona = getBenefitsStatePersonaId(activePersona);
  const baseBalance = benefitsPersona === "new_user"
    ? {
      allocation: benefit.balance.allocation,
      utilized: 0,
      available: benefit.balance.allocation,
    }
    : benefit.balance;

  if (benefit.id === "mobile") {
    return {
      ...benefit,
      balance: {
        allocation: baseBalance.allocation,
        utilized: getMobileClaimDebit(activePersona),
        available: Math.max(
          0,
          baseBalance.allocation - getMobileClaimDebit(activePersona),
        ),
      },
    };
  }

  return benefitsPersona === "new_user"
    ? { ...benefit, balance: baseBalance }
    : benefit;
}

export function isPolicyTabId(value: string): value is PolicyTabId {
  return POLICY_LIST_ITEMS.some((item) => item.id === value);
}

export function getPolicyCategory(
  id: PolicyTabId,
  personaId?: PersonaId,
): PolicyCategory {
  return getEmployerBenefit(id, personaId);
}
