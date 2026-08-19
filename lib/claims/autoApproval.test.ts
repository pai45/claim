import { describe, expect, it } from "vitest";
import type { ClaimExtract, ClaimPrecheck } from "@/features/chat/types";
import {
  AUTO_APPROVAL_CONFIDENCE_THRESHOLD,
  evaluateAutoApproval,
} from "./autoApproval";

function precheckWith(status: ClaimPrecheck["status"]): ClaimPrecheck {
  return { status, checks: [], requiresAcknowledgement: status === "warning" };
}

function extractWith(overrides: Partial<ClaimExtract> = {}): ClaimExtract {
  return { fileName: "claim.jpg", rawText: "", confidence: 96, ...overrides };
}

describe("evaluateAutoApproval", () => {
  it("clears a confident claim whose checks all pass", () => {
    expect(evaluateAutoApproval(extractWith(), precheckWith("pass"))).toEqual({
      score: 96,
      eligible: true,
      reason: "eligible",
    });
  });

  it("holds back a claim below the confidence threshold", () => {
    const verdict = evaluateAutoApproval(
      extractWith({ confidence: AUTO_APPROVAL_CONFIDENCE_THRESHOLD - 1 }),
      precheckWith("pass"),
    );
    expect(verdict).toEqual({ score: 89, eligible: false, reason: "low_confidence" });
  });

  it("accepts a claim sitting exactly on the threshold", () => {
    const verdict = evaluateAutoApproval(
      extractWith({ confidence: AUTO_APPROVAL_CONFIDENCE_THRESHOLD }),
      precheckWith("pass"),
    );
    expect(verdict.eligible).toBe(true);
  });

  it("holds back a confident claim whose policy checks did not pass", () => {
    for (const status of ["warning", "blocked"] as const) {
      expect(evaluateAutoApproval(extractWith(), precheckWith(status))).toEqual({
        score: 96,
        eligible: false,
        reason: "checks_failed",
      });
    }
  });

  it("reports an edit ahead of every other reason", () => {
    const verdict = evaluateAutoApproval(
      extractWith({ confidence: 20, autoApprovalWaived: true }),
      precheckWith("blocked"),
    );
    expect(verdict).toEqual({ score: 20, eligible: false, reason: "edited" });
  });

  it("clamps and rounds the reported score", () => {
    expect(evaluateAutoApproval(extractWith({ confidence: 95.6 }), precheckWith("pass")).score).toBe(96);
    expect(evaluateAutoApproval(extractWith({ confidence: 140 }), precheckWith("pass")).score).toBe(100);
    expect(evaluateAutoApproval(extractWith({ confidence: undefined }), precheckWith("pass")).score).toBe(0);
  });
});
