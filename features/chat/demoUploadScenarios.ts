import type {
  BillExtract,
  BillUploadScenarioId,
  DlUploadScenarioId,
  DriverSalaryPayload,
  UploadOptionId,
} from "@/features/chat/types";
import { DEMO_DOCUMENT_ASSETS } from "@/lib/ui/assets";

export type BillScenarioGroup = "common" | "exceptions";

export type BillUploadScenario = {
  id: BillUploadScenarioId;
  label: string;
  description: string;
  group: BillScenarioGroup;
  asset: string;
  assistantMessage: string;
  referenceNow: string;
  extract: Omit<
    BillExtract,
    "demoScenarioId" | "previewAsset" | "rawText"
  >;
};

export type DlUploadScenario = {
  id: DlUploadScenarioId;
  label: string;
  description: string;
  asset: string;
  assistantMessage: string;
  payload: Omit<
    DriverSalaryPayload,
    "dlScenarioId" | "dlPreviewAsset"
  >;
};

const DEMO_REFERENCE_NOW = "2026-08-07T12:00:00+05:30";

export const BILL_UPLOAD_SCENARIOS: readonly BillUploadScenario[] = [
  {
    id: "driver_salary",
    label: "Driver Salary",
    description: "Monthly salary receipt",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billDriverSalary,
    assistantMessage:
      "I found a driver salary receipt. It is ready as a Driver Salary claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "driver-salary-august-2026.png",
      category: "Driver Salary",
      vendor: "Ramesh Kumar",
      amount: "12000",
      billDate: "2026-08-02",
      billingMonth: "2026-08",
      invoiceNo: "DRV-0802",
      confidence: 100,
    },
  },
  {
    id: "meal_missing",
    label: "Meal Bill — missing data",
    description: "Amount and date need review",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billMealMissing,
    assistantMessage:
      "Some meal bill details are missing. Add the amount and bill date to continue.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "lunchbox-meal-missing.jpg",
      category: "Meal Wallet",
      vendor: "Lunchbox Cafe",
      invoiceNo: "MEAL-0804",
      confidence: 42,
      manualReview: true,
      reviewFields: {
        amount: "missing",
        billDate: "missing",
      },
      warning:
        "The amount and bill date were not found in this demo. Enter them manually.",
    },
  },
  {
    id: "fuel",
    label: "Fuel Bill",
    description: "Complete fuel receipt",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billFuel,
    assistantMessage:
      "I found a Highway Fuel Point bill. It is ready as a Fuel & Maintenance claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "highway-fuel.jpg",
      category: "Fuel & Maintenance",
      vendor: "Highway Fuel Point",
      amount: "2800",
      billDate: "2026-08-03",
      billingMonth: "2026-08",
      invoiceNo: "FUEL-0803",
      confidence: 100,
    },
  },
  {
    id: "fuel_exceeding",
    label: "Fuel Bill — exceeding balance",
    description: "₹45,000 exceeds ₹42,000 available",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billFuelExceeding,
    assistantMessage:
      "This fuel bill is above the available Fuel & Maintenance balance. Review the amount before submitting.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "fuel-exceeding-balance.jpg",
      category: "Fuel & Maintenance",
      vendor: "Metro Auto Fuels",
      amount: "45000",
      billDate: "2026-08-03",
      billingMonth: "2026-08",
      invoiceNo: "FUEL-0803-X",
      confidence: 100,
    },
  },
  {
    id: "internet",
    label: "Internet Bill",
    description: "Monthly broadband invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billInternet,
    assistantMessage:
      "I found a MetroNet Broadband bill. It is ready as a Mobile & Internet claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "metronet-broadband.jpg",
      category: "Mobile & Internet",
      vendor: "MetroNet Broadband",
      amount: "1299",
      billDate: "2026-08-01",
      billingMonth: "2026-08",
      invoiceNo: "NET-0801",
      confidence: 100,
    },
  },
  {
    id: "mobile",
    label: "Mobile Postpaid Bill",
    description: "Monthly mobile invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billMobile,
    assistantMessage:
      "I found a Connect Mobile bill. It is ready as a Mobile & Internet claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "connect-mobile.jpg",
      category: "Mobile & Internet",
      vendor: "Connect Mobile",
      amount: "899",
      billDate: "2026-08-01",
      billingMonth: "2026-08",
      invoiceNo: "MOB-0801",
      confidence: 100,
    },
  },
  {
    id: "books",
    label: "Books & Periodicals",
    description: "Professional book invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billBooks,
    assistantMessage:
      "I found a Page & Prose invoice. It is ready as a Books & Periodicals claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "page-and-prose.jpg",
      category: "Books & Periodicals",
      vendor: "Page & Prose",
      amount: "2499",
      billDate: "2026-08-04",
      billingMonth: "2026-08",
      invoiceNo: "BOOK-0804",
      confidence: 100,
    },
  },
  {
    id: "professional",
    label: "Professional Development",
    description: "Role-related course invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.billProfessional,
    assistantMessage:
      "I found a SkillSpring Academy invoice. It is ready as a Professional Development claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "skillspring-course.jpg",
      category: "Professional Development",
      vendor: "SkillSpring Academy",
      amount: "12500",
      billDate: "2026-08-03",
      billingMonth: "2026-08",
      invoiceNo: "PRO-0803",
      confidence: 100,
    },
  },
  {
    id: "duplicate",
    label: "Duplicate Bill",
    description: "Matches an existing claim",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.billDuplicate,
    assistantMessage:
      "This course invoice appears to match an existing claim. Review the duplicate warning before continuing.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "duplicate-course.jpg",
      category: "Professional Development",
      vendor: "Coursera",
      amount: "7999",
      billDate: "2026-05-03",
      billingMonth: "2026-05",
      invoiceNo: "CR-0503-7999",
      confidence: 100,
    },
  },
  {
    id: "late",
    label: "Late Bill",
    description: "Outside the submission window",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.billLate,
    assistantMessage:
      "This fuel bill is outside the monthly submission window. Review the deadline before continuing.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "late-fuel.jpg",
      category: "Fuel & Maintenance",
      vendor: "Highway Fuel Point",
      amount: "1800",
      billDate: "2026-07-15",
      billingMonth: "2026-07",
      invoiceNo: "FUEL-0715",
      confidence: 100,
    },
  },
  {
    id: "other",
    label: "Other / HR Review",
    description: "Category needs HR review",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.billOther,
    assistantMessage:
      "This bill does not match a configured benefit category. Confirm it for HR review.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "other-hr-review.jpg",
      category: "Other / HR review",
      vendor: "City Services",
      amount: "2100",
      billDate: "2026-08-02",
      billingMonth: "2026-08",
      invoiceNo: "OTHER-0802",
      confidence: 100,
    },
  },
] as const;

export function getBillUploadScenariosForSource(
  source: UploadOptionId,
): readonly BillUploadScenario[] {
  if (source !== "camera") return BILL_UPLOAD_SCENARIOS;
  return BILL_UPLOAD_SCENARIOS.filter(
    (scenario) => scenario.id !== "meal_missing",
  );
}

export const DL_UPLOAD_SCENARIOS: readonly DlUploadScenario[] = [
  {
    id: "dl_found",
    label: "DL found",
    description: "Licence number is available",
    asset: DEMO_DOCUMENT_ASSETS.dlFound,
    assistantMessage:
      "I found the DL number in this demo. Please enter the driver name and confirm the DL number before continuing.",
    payload: {
      dlFileName: "demo-driver-licence.jpg",
      dlNumber: "DL-1420110012345",
      dlConfidence: 100,
    },
  },
  {
    id: "dl_not_found",
    label: "DL data not found",
    description: "Enter the licence number manually",
    asset: DEMO_DOCUMENT_ASSETS.dlNotFound,
    assistantMessage:
      "I couldn't find a DL number in this demo. Enter the driver name and DL number manually to continue.",
    payload: {
      dlFileName: "demo-driver-licence-unreadable.jpg",
      dlWarning:
        "The licence number is not available in this demo document. Enter it manually.",
    },
  },
] as const;

export function getBillUploadScenario(
  id: BillUploadScenarioId,
): BillUploadScenario {
  return BILL_UPLOAD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function getDlUploadScenario(id: DlUploadScenarioId): DlUploadScenario {
  return DL_UPLOAD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function buildBillExtractFromScenario(
  id: BillUploadScenarioId,
): BillExtract {
  const scenario = getBillUploadScenario(id);
  return {
    rawText: "",
    ...scenario.extract,
    demoScenarioId: id,
    previewAsset: scenario.asset,
    warningAcknowledged: false,
  };
}

export function buildDlPayloadFromScenario(
  id: DlUploadScenarioId,
): DriverSalaryPayload {
  const scenario = getDlUploadScenario(id);
  return {
    ...scenario.payload,
    dlRawText: "",
    dlScenarioId: id,
    dlPreviewAsset: scenario.asset,
  };
}

export function getDemoPrecheckDate(extract: BillExtract): Date | undefined {
  if (!extract.demoScenarioId) return undefined;
  const scenario = BILL_UPLOAD_SCENARIOS.find(
    ({ id }) => id === extract.demoScenarioId,
  );
  return scenario ? new Date(scenario.referenceNow) : undefined;
}
