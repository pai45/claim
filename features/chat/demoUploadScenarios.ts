import type {
  ClaimExtract,
  ClaimUploadScenarioId,
  DlUploadScenarioId,
  DriverSalaryPayload,
  UploadOptionId,
} from "@/features/chat/types";
import { DEMO_DOCUMENT_ASSETS } from "@/lib/ui/assets";

export type ClaimScenarioGroup = "common" | "exceptions";

export type ClaimUploadScenario = {
  id: ClaimUploadScenarioId;
  label: string;
  description: string;
  group: ClaimScenarioGroup;
  asset: string;
  assistantMessage: string;
  referenceNow: string;
  extract: Omit<
    ClaimExtract,
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

export const CLAIM_UPLOAD_SCENARIOS: readonly ClaimUploadScenario[] = [
  {
    id: "driver_salary",
    label: "Driver Salary",
    description: "Monthly salary receipt",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimDriverSalary,
    assistantMessage:
      "I found a driver salary receipt. It is ready as a Driver Salary claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "driver-salary-august-2026.png",
      category: "Driver Salary",
      vendor: "Ramesh Kumar",
      amount: "12000",
      claimDate: "2026-08-02",
      claimMonth: "2026-08",
      invoiceNo: "DRV-0802",
      confidence: 94,
    },
  },
  {
    id: "meal_missing",
    label: "Meal Claim — missing data",
    description: "Amount and date need review",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimMealMissing,
    assistantMessage:
      "Some meal claim details are missing. Add the amount and claim date to continue.",
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
        claimDate: "missing",
      },
      warning:
        "The amount and claim date were not found in this demo. Enter them manually.",
    },
  },
  {
    id: "fuel",
    label: "Fuel Claim",
    description: "Complete fuel receipt",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimFuel,
    assistantMessage:
      "I found a Highway Fuel Point receipt. It is ready as a Fuel & Maintenance claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "highway-fuel.jpg",
      category: "Fuel & Maintenance",
      vendor: "Highway Fuel Point",
      amount: "2800",
      claimDate: "2026-08-03",
      claimMonth: "2026-08",
      invoiceNo: "FUEL-0803",
      confidence: 96,
    },
  },
  {
    id: "fuel_low_confidence",
    label: "Fuel Claim — low confidence",
    description: "Same receipt, read at 70%",
    group: "common",
    // Deliberately the same artwork as `fuel`: the demo contrast is the quality
    // of the read, not a different document.
    asset: DEMO_DOCUMENT_ASSETS.claimFuel,
    assistantMessage:
      "I read this Highway Fuel Point receipt at 70% confidence. Check the amount and claim date against the image before submitting — HR will verify this claim manually.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "highway-fuel-blurred.jpg",
      category: "Fuel & Maintenance",
      vendor: "Highway Fuel Point",
      amount: "2800",
      claimDate: "2026-08-03",
      claimMonth: "2026-08",
      invoiceNo: "FUEL-0803",
      confidence: 70,
      reviewFields: {
        amount: "review",
        claimDate: "review",
      },
    },
  },
  {
    id: "fuel_exceeding",
    label: "Fuel Claim — exceeding balance",
    description: "₹45,000 exceeds ₹42,000 available",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimFuelExceeding,
    assistantMessage:
      "This fuel claim is above the available Fuel & Maintenance balance. Review the amount before submitting.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "fuel-exceeding-balance.jpg",
      category: "Fuel & Maintenance",
      vendor: "Metro Auto Fuels",
      amount: "45000",
      claimDate: "2026-08-03",
      claimMonth: "2026-08",
      invoiceNo: "FUEL-0803-X",
      confidence: 95,
    },
  },
  {
    id: "internet",
    label: "Internet Claim",
    description: "Monthly broadband invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimInternet,
    assistantMessage:
      "I found a MetroNet Broadband invoice. It is ready as a Mobile & Internet claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "metronet-broadband.jpg",
      category: "Mobile & Internet",
      vendor: "MetroNet Broadband",
      amount: "1299",
      claimDate: "2026-08-01",
      claimMonth: "2026-08",
      invoiceNo: "NET-0801",
      confidence: 97,
    },
  },
  {
    id: "mobile",
    label: "Mobile Postpaid Claim",
    description: "Monthly mobile invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimMobile,
    assistantMessage:
      "I found a Connect Mobile invoice. It is ready as a Mobile & Internet claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "connect-mobile.jpg",
      category: "Mobile & Internet",
      vendor: "Connect Mobile",
      amount: "899",
      claimDate: "2026-08-01",
      claimMonth: "2026-08",
      invoiceNo: "MOB-0801",
      confidence: 93,
    },
  },
  {
    id: "books",
    label: "Books & Periodicals",
    description: "Professional book invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimBooks,
    assistantMessage:
      "I found a Page & Prose invoice. It is ready as a Books & Periodicals claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "page-and-prose.jpg",
      category: "Books & Periodicals",
      vendor: "Page & Prose",
      amount: "2499",
      claimDate: "2026-08-04",
      claimMonth: "2026-08",
      invoiceNo: "BOOK-0804",
      confidence: 92,
    },
  },
  {
    id: "professional",
    label: "Professional Development",
    description: "Role-related course invoice",
    group: "common",
    asset: DEMO_DOCUMENT_ASSETS.claimProfessional,
    assistantMessage:
      "I found a SkillSpring Academy invoice. It is ready as a Professional Development claim.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "skillspring-course.jpg",
      category: "Professional Development",
      vendor: "SkillSpring Academy",
      amount: "12500",
      claimDate: "2026-08-03",
      claimMonth: "2026-08",
      invoiceNo: "PRO-0803",
      confidence: 95,
    },
  },
  {
    id: "duplicate",
    label: "Duplicate Claim",
    description: "Matches an existing claim",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.claimDuplicate,
    assistantMessage:
      "This course invoice appears to match an existing claim. Review the duplicate warning before continuing.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "duplicate-course.jpg",
      category: "Professional Development",
      vendor: "Coursera",
      amount: "7999",
      claimDate: "2026-05-03",
      claimMonth: "2026-05",
      invoiceNo: "CR-0503-7999",
      confidence: 94,
    },
  },
  {
    id: "late",
    label: "Late Claim",
    description: "Outside the submission window",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.claimLate,
    assistantMessage:
      "This fuel claim is outside the monthly submission window. Review the deadline before continuing.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "late-fuel.jpg",
      category: "Fuel & Maintenance",
      vendor: "Highway Fuel Point",
      amount: "1800",
      claimDate: "2026-07-15",
      claimMonth: "2026-07",
      invoiceNo: "FUEL-0715",
      confidence: 96,
    },
  },
  {
    id: "other",
    label: "Other / HR Review",
    description: "Category needs HR review",
    group: "exceptions",
    asset: DEMO_DOCUMENT_ASSETS.claimOther,
    assistantMessage:
      "This claim does not match a configured benefit category. Confirm it for HR review.",
    referenceNow: DEMO_REFERENCE_NOW,
    extract: {
      fileName: "other-hr-review.jpg",
      category: "Other / HR review",
      vendor: "City Services",
      amount: "2100",
      claimDate: "2026-08-02",
      claimMonth: "2026-08",
      invoiceNo: "OTHER-0802",
      confidence: 91,
    },
  },
] as const;

export function getClaimUploadScenariosForSource(
  source: UploadOptionId,
): readonly ClaimUploadScenario[] {
  if (source !== "camera") return CLAIM_UPLOAD_SCENARIOS;
  return CLAIM_UPLOAD_SCENARIOS.filter(
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
      "I read the driving licence in this demo. Please review the driver name, DL number, and validity before continuing.",
    payload: {
      dlFileName: "demo-driver-licence.jpg",
      driverName: "Ramesh Kumar",
      dlNumber: "DL-1420110012345",
      dlValidity: "2032-11-14",
      dlConfidence: 100,
    },
  },
  {
    id: "dl_not_found",
    label: "DL data not found",
    description: "Enter the licence number manually",
    asset: DEMO_DOCUMENT_ASSETS.dlNotFound,
    assistantMessage:
      "I couldn't read this licence in this demo. Enter the driver name, DL number, and validity manually to continue.",
    payload: {
      dlFileName: "demo-driver-licence-unreadable.jpg",
      dlWarning:
        "The licence details are not readable in this demo document. Enter them manually.",
    },
  },
] as const;

export function getClaimUploadScenario(
  id: ClaimUploadScenarioId,
): ClaimUploadScenario {
  return CLAIM_UPLOAD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function getDlUploadScenario(id: DlUploadScenarioId): DlUploadScenario {
  return DL_UPLOAD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function buildClaimExtractFromScenario(
  id: ClaimUploadScenarioId,
): ClaimExtract {
  const scenario = getClaimUploadScenario(id);
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

export function getDemoPrecheckDate(extract: ClaimExtract): Date | undefined {
  if (!extract.demoScenarioId) return undefined;
  const scenario = CLAIM_UPLOAD_SCENARIOS.find(
    ({ id }) => id === extract.demoScenarioId,
  );
  return scenario ? new Date(scenario.referenceNow) : undefined;
}
