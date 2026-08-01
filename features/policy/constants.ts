export type PolicyTabId =
  | "meal"
  | "gift"
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

export const POLICY_LIST_ITEMS: PolicyListItem[] = [
  { id: "meal", label: "Meal Wallet", iconBg: "#FFE6BC", iconTone: "#B65400" },
  { id: "gift", label: "Gift Wallet", iconBg: "#DAF7E7", iconTone: "#039258" },
  {
    id: "fuel",
    label: "Fuel & Maintenance",
    iconBg: "#FAFCFC",
    iconTone: "#005656",
  },
  {
    id: "mobile",
    label: "Mobile & Internet",
    iconBg: "#FFFCF5",
    iconTone: "#B54708",
  },
  {
    id: "driver",
    label: "Driver Salary",
    iconBg: "#FFFBFA",
    iconTone: "#7F1D1D",
  },
  {
    id: "books",
    label: "Books & Periodicals",
    iconBg: "#F6FEF9",
    iconTone: "#166534",
  },
  {
    id: "professional",
    label: "Professional Development",
    iconBg: "#F2F8FD",
    iconTone: "#1D4ED8",
  },
];

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
        title: "Tax Savings",
        detail: "Structured as a tax-efficient meal allowance",
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
        title: "Get Tax Benefit",
        detail: "Approved meal reimbursements are processed tax-efficiently in payroll.",
      },
    ],
  },
  {
    id: "gift",
    aliases: ["gift", "gifts", "voucher", "festival gift", "gift wallet"],
    tabLabel: "Gift Wallet",
    title: "Gift Wallet Benefit",
    whatIsHeading: "What is Gift Wallet Benefit?",
    description:
      "Employers commonly provide festival or occasion gift benefits through vouchers or reimbursements. This wallet helps you claim eligible gift spends under your company's gift policy.",
    notes: [
      "Eligible mainly for festival / employer-approved gift occasions",
      "Cash gifts and personal lifestyle purchases are not covered",
      "Gift vouchers or invoices must clearly show merchant and amount",
      "Unused gift balance usually lapses as per company policy",
    ],
    benefits: [
      {
        title: "Tax Treatment",
        detail: "As per company gift policy / Form 12BA practices",
        icon: "tax",
      },
      {
        title: "Annual Limit",
        detail: "₹5,000",
        icon: "limit",
      },
      {
        title: "Proof Required",
        detail: "Gift voucher / purchase invoices",
        icon: "proof",
      },
      {
        title: "Claim Frequency",
        detail: "As incurred (festival window)",
        icon: "frequency",
      },
    ],
    covered: [
      "Festival gift vouchers",
      "Employer gift cards",
      "Approved retail gift invoices",
      "Diwali / Holi gift packs",
      "Team celebration gifts",
      "Company-listed merchants",
    ],
    steps: [
      {
        title: "Check Gift Window",
        detail: "Confirm the festival or occasion window announced by HR.",
      },
      {
        title: "Buy Eligible Gift",
        detail: "Purchase from approved categories or voucher partners.",
      },
      {
        title: "Upload Proof",
        detail: "Submit voucher or invoice details in the claims assistant.",
      },
      {
        title: "Receive Benefit",
        detail: "Approved gift claims are reimbursed as per policy.",
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
    ],
    tabLabel: "Fuel & Maintenance",
    title: "Fuel & Maintenance Benefit",
    whatIsHeading: "What is Fuel & Maintenance Benefit?",
    description:
      "This employer reimbursement covers vehicle costs. Under Section 10(14) of the Income Tax Act, it's fully tax-exempt with valid bills.",
    notes: [
      "The vehicle must be registered in the employee's name",
      "Fuel bills must match the fuel type (Petrol/Diesel) declared",
      "Original printed GST invoices are required",
      "All monthly claims must be submitted before the 5th of subsequent month",
    ],
    benefits: [
      {
        title: "Tax Savings",
        detail: "Save up to 30% tax (Section 10(14))",
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
        title: "Get Tax Benefit",
        detail: "Reimbursements are credited tax-free in your salary.",
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
        title: "Tax Savings",
        detail: "Save tax under Section 10(14) communication allowance",
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
        title: "Get Tax Benefit",
        detail: "Approved communication expenses are reimbursed tax-efficiently.",
      },
    ],
  },
  {
    id: "driver",
    aliases: ["driver", "chauffeur", "driver salary"],
    tabLabel: "Driver Salary",
    title: "Driver Salary Benefits",
    eyebrow: "Reimbursement Wallet",
    whatIsHeading: "What is Driver Salary Benefit?",
    description:
      "Your company offers a driver salary allowance in your CTC, enabling tax exemption under Section 10(14) of the Income Tax Act.",
    notes: [
      "Driver must have a valid driving licence",
      "Salary must be paid via bank transfer or cheque",
      "Claims must be submitted before the 5th of next month",
      "Unused allowance cannot be carried forward",
    ],
    benefits: [
      {
        title: "Tax Savings",
        detail: "Save up to 30% tax (Section 10(14))",
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
        title: "Get Tax Benefit",
        detail: "The claimed amount is exempted from your taxable income",
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
        title: "Tax Savings",
        detail: "Save up to 30% tax (Section 10(14))",
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
        title: "Get Tax Benefit",
        detail: "Approved reimbursements reduce your taxable income",
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

export function isPolicyTabId(value: string): value is PolicyTabId {
  return POLICY_LIST_ITEMS.some((item) => item.id === value);
}

export function getPolicyCategory(id: PolicyTabId): PolicyCategory {
  return (
    POLICY_CATEGORIES.find((item) => item.id === id) ?? POLICY_CATEGORIES[0]
  );
}
