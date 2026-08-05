import { CLAIM_HISTORY_ITEMS } from "@/features/claims-history/constants";
import {
  EMPLOYER_BENEFITS_CATALOG,
  type EmployerBenefit,
} from "@/features/policy/constants";
import type {
  BillExtract,
  ClaimCheckStatus,
  ClaimFieldName,
  ClaimFieldReviewState,
  ClaimPrecheck,
} from "@/features/chat/types";

function normalize(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseClaimAmount(value?: string): number | null {
  const parsed = Number.parseFloat((value ?? "").replace(/,/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseClaimDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function findBenefitForClaim(category?: string): EmployerBenefit | undefined {
  const candidate = normalize(category);
  if (!candidate) return undefined;
  return EMPLOYER_BENEFITS_CATALOG.benefits.find((benefit) => {
    const labels = [
      benefit.display.label,
      benefit.tabLabel,
      benefit.title,
      ...benefit.aliases,
    ];
    return labels.some((label) => normalize(label) === candidate);
  });
}

function worstStatus(statuses: ClaimCheckStatus[]): ClaimCheckStatus {
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("warning")) return "warning";
  return "pass";
}

function isPossibleDuplicate(extract: BillExtract, amount: number | null): boolean {
  if (extract.editClaimId) return false;
  if (!amount || !extract.vendor || !extract.billDate) return false;
  const date = parseClaimDate(extract.billDate);
  return CLAIM_HISTORY_ITEMS.some((claim) => {
    const claimDate = parseClaimDate(claim.date);
    return (
      normalize(claim.merchant) === normalize(extract.vendor) &&
      claim.amount === amount &&
      Boolean(date && claimDate && date.toDateString() === claimDate.toDateString())
    );
  });
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function evaluateClaimPrecheck(
  extract: BillExtract,
  now = new Date(),
): ClaimPrecheck {
  const benefit = findBenefitForClaim(extract.category);
  const amount = parseClaimAmount(extract.amount);
  const billDate = parseClaimDate(extract.billDate);
  const requiredFields = benefit?.claimRules.requiredFields ?? [
    "category",
    "vendor",
    "amount",
    "billDate",
  ];
  const missing = requiredFields.filter((field) => !extract[field]?.trim());
  const checks: ClaimPrecheck["checks"] = [
    {
      id: "details",
      label: "Required details",
      detail:
        missing.length > 0
          ? `Add ${missing.join(", ")}.`
          : "All required claim details are present.",
      status: missing.length > 0 ? "blocked" : "pass",
    },
    {
      id: "amount",
      label: "Claim amount",
      detail: amount ? `${formatINR(amount)} is a valid positive amount.` : "Enter a valid amount greater than zero.",
      status: amount ? "pass" : "blocked",
    },
    {
      id: "bill-date",
      label: "Bill date",
      detail: billDate
        ? "The bill date is valid."
        : "Enter a valid bill date.",
      status: billDate ? "pass" : "blocked",
    },
    {
      id: "policy",
      label: "Demo policy match",
      detail: benefit
        ? `Matched to ${benefit.display.label} under policy ${EMPLOYER_BENEFITS_CATALOG.policyVersion}.`
        : "This category is not configured in the demo policy and needs HR review.",
      status: benefit ? "pass" : "warning",
    },
  ];

  if (benefit && amount) {
    checks.push({
      id: "allowance",
      label: "Available demo allowance",
      detail:
        amount <= benefit.balance.available
          ? `${formatINR(benefit.balance.available)} is available in this category.`
          : `This exceeds the available ${formatINR(benefit.balance.available)} demo allowance.`,
      status: amount <= benefit.balance.available ? "pass" : "blocked",
    });
  }

  checks.push({
    id: "proof",
    label: "Proof",
    detail: extract.fileName
      ? benefit?.claimRules.proofRequired ?? "A bill is attached for HR review."
      : "Attach a bill before submitting.",
    status: extract.fileName ? "pass" : "blocked",
  });

  const duplicate = isPossibleDuplicate(extract, amount);
  checks.push({
    id: "duplicate",
    label: "Possible duplicate",
    detail: duplicate
      ? "A claim with the same vendor, amount, and date already exists. Review before submitting."
      : "No matching demo claim was found.",
    status: duplicate ? "warning" : "pass",
  });

  if (extract.editClaimId && billDate) {
    checks.push({
      id: "deadline",
      label: "Submission deadline",
      detail: "This is an existing claim, so corrections remain available after submission.",
      status: "pass",
    });
  } else if (benefit?.claimRules.submissionDeadlineDay && billDate) {
    const deadline = new Date(
      billDate.getFullYear(),
      billDate.getMonth() + 1,
      benefit.claimRules.submissionDeadlineDay,
      23,
      59,
      59,
    );
    const expired = now.getTime() > deadline.getTime();
    checks.push({
      id: "deadline",
      label: "Submission deadline",
      detail: expired
        ? `The configured deadline was ${deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`
        : `Submit by ${deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
      status: expired ? "blocked" : "pass",
    });
  } else if (benefit) {
    checks.push({
      id: "deadline",
      label: "Submission deadline",
      detail: "No exact deadline is configured for this demo benefit; HR will review the policy window.",
      status: "warning",
    });
  }

  const status = worstStatus(checks.map((check) => check.status));
  return {
    status,
    benefitId: benefit?.id,
    checks,
    requiresAcknowledgement: checks.some((check) => check.status === "warning"),
  };
}

export function claimFieldReviewState(
  field: ClaimFieldName,
  extract: BillExtract,
): ClaimFieldReviewState {
  if (!extract[field]?.trim()) return "missing";
  if ((extract.confidence ?? 0) < 60) return "review";
  return "confirmed";
}
