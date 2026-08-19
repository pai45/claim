import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildBillExtractFromScenario } from "@/features/chat/demoUploadScenarios";
import { billDraftFingerprint } from "@/features/chat/drafts";
import { AutoApprovalEditSheet } from "./AutoApprovalEditSheet";
import { BillExtractCard } from "./BillExtractCard";

describe("BillExtractCard", () => {
  it("shows an automatically saved draft as a right-aligned status, not an action", () => {
    const scanned = buildBillExtractFromScenario("fuel");
    const extract = {
      ...scanned,
      draftId: "draft-1",
      draftSavedAt: 1,
      draftSavedFingerprint: billDraftFingerprint(scanned),
    };

    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "bill-1",
        extract,
      }),
    );

    expect(html).toContain("Claim details ready");
    expect(html).toContain("Draft saved");
    expect(html).toContain("flex items-start justify-between gap-2");
    expect(html).toContain("ml-auto shrink-0 rounded-pill");
    expect(html).not.toContain(">Draft</button>");
    expect(html).not.toContain("Update draft");
  });

  it("credits a confident, clean scan as eligible for auto approval", () => {
    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "bill-1",
        extract: buildBillExtractFromScenario("fuel"),
      }),
    );

    expect(html).toContain("Confidence 96% · Eligible for auto approval");
  });

  it("downgrades the header once the scanned details have been edited", () => {
    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "bill-1",
        extract: {
          ...buildBillExtractFromScenario("fuel"),
          autoApprovalWaived: true,
        },
      }),
    );

    expect(html).toContain("Manual review — edited after scan");
    expect(html).not.toContain("Eligible for auto approval");
  });

  it("withholds auto approval when a policy check fails despite a high score", () => {
    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "bill-1",
        extract: buildBillExtractFromScenario("fuel_exceeding"),
      }),
    );

    expect(html).toContain("Confidence 95% · Manual review");
    expect(html).not.toContain("Eligible for auto approval");
  });

  it("does not leave the edit warning mounted inside the claim card", () => {
    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "bill-1",
        extract: buildBillExtractFromScenario("fuel"),
      }),
    );

    expect(html).not.toContain("Editing turns off auto approval");
  });

  it("renders the edit warning only as an open bottom sheet", () => {
    const closedHtml = renderToStaticMarkup(
      createElement(AutoApprovalEditSheet, {
        open: false,
        score: 96,
        onConfirm: () => undefined,
        onClose: () => undefined,
      }),
    );
    const openHtml = renderToStaticMarkup(
      createElement(AutoApprovalEditSheet, {
        open: true,
        score: 96,
        onConfirm: () => undefined,
        onClose: () => undefined,
      }),
    );

    expect(closedHtml).toBe("");
    expect(openHtml).toContain("Editing turns off auto approval");
    expect(openHtml).toContain(">Continue</button>");
    expect(openHtml).toContain(">Cancel</button>");
    expect(openHtml).toContain("animate-sheet-rise");
  });
});
