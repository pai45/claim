import type {
  AutoApprovalVerdict,
  BillExtract,
  ClaimPrecheck,
} from "@/features/chat/types";

/**
 * Demo threshold from the workflow blueprint: at or above this the extraction is
 * trusted without a human re-reading the bill. Below it sits the manual band.
 */
export const AUTO_APPROVAL_CONFIDENCE_THRESHOLD = 90;

/**
 * Confidence alone never authorizes reimbursement. A bill can be read perfectly
 * and still be a duplicate, past its deadline, or over the remaining allowance,
 * so the precheck verdict gates auto approval alongside the score.
 *
 * Precedence is deliberate: an edit is reported as an edit even when the claim
 * would also have failed a check, because that is the change the user just made.
 */
export function evaluateAutoApproval(
  extract: BillExtract,
  precheck: ClaimPrecheck,
): AutoApprovalVerdict {
  const score = Math.round(Math.max(0, Math.min(100, extract.confidence ?? 0)));

  if (extract.autoApprovalWaived) {
    return { score, eligible: false, reason: "edited" };
  }
  if (score < AUTO_APPROVAL_CONFIDENCE_THRESHOLD) {
    return { score, eligible: false, reason: "low_confidence" };
  }
  if (precheck.status !== "pass") {
    return { score, eligible: false, reason: "checks_failed" };
  }
  return { score, eligible: true, reason: "eligible" };
}
