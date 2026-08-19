import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ConfidenceScorePayload } from "@/features/chat/types";
import { ConfidenceScoreCard } from "./ConfidenceScoreCard";

// Far enough in the past that the card renders its settled state, which is what
// a rehydrated transcript shows.
const SETTLED_AT = 0;

function render(payload: ConfidenceScorePayload) {
  return renderToStaticMarkup(
    createElement(ConfidenceScoreCard, { payload, createdAt: SETTLED_AT }),
  );
}

describe("ConfidenceScoreCard", () => {
  it("announces auto approval for a clean, confident scan", () => {
    const html = render({ score: 96, eligible: true, reason: "eligible" });

    // The scan result and the score share one bubble.
    expect(html).toContain("Bill scanned");
    expect(html).toContain("Vendor detected");
    expect(html).toContain("Confidence score");
    expect(html).toContain("96%");
    expect(html).toContain("Eligible for auto approval");
    expect(html).toContain("bg-success-soft");
    // The headline carries the whole message; no subline under it.
    expect(html).not.toContain("No manual review needed");
  });

  it("explains a score below the threshold", () => {
    const html = render({ score: 42, eligible: false, reason: "low_confidence" });

    expect(html).toContain("42%");
    expect(html).toContain("Needs manual review");
    expect(html).toContain("Confidence is below 90%");
    expect(html).toContain("bg-warning-tint");
    expect(html).not.toContain("Eligible for auto approval");
  });

  it("blocks auto approval when policy checks fail despite a high score", () => {
    const html = render({ score: 95, eligible: false, reason: "checks_failed" });

    expect(html).toContain("95%");
    expect(html).toContain("Needs manual review");
    expect(html).toContain("Some policy checks need attention");
    expect(html).not.toContain("Eligible for auto approval");
  });

  it("renders settled for a rehydrated message instead of replaying the sweep", () => {
    const html = render({ score: 100, eligible: true, reason: "eligible" });

    // A full ring means zero remaining dash offset.
    expect(html).toContain('stroke-dashoffset="0"');
    expect(html).toContain("100%");
  });
});
