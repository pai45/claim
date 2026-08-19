import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildBillExtractFromScenario } from "@/features/chat/demoUploadScenarios";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import { ClaimReceiptCard } from "./ClaimReceiptCard";
import { DriverSalaryReceiptCard } from "./DriverSalaryReceiptCard";
import { VehicleClaimReceiptCard } from "./VehicleClaimReceiptCard";

describe("registration receipt cards", () => {
  it("does not render an Admin tag on vehicle registration submissions", () => {
    const lookupResult = buildVehicleLookup("KA011111", "Vishal Sharma");
    if (!lookupResult.ok) throw new Error("Expected vehicle lookup to succeed");

    const html = renderToStaticMarkup(
      createElement(VehicleClaimReceiptCard, {
        lookup: lookupResult.lookup,
        ownership: "self_owned",
        submittedAt: 0,
      }),
    );

    expect(html).toContain("Submitted to Admin");
    expect(html).not.toContain(">Admin<");
  });

  it("does not render an Admin tag on driver registration submissions", () => {
    const html = renderToStaticMarkup(
      createElement(DriverSalaryReceiptCard, {
        claimId: "CLM-87549",
        payload: { driverName: "Kai", salary: "15000" },
        submittedAt: 0,
      }),
    );

    expect(html).toContain("Submitted to Admin");
    expect(html).not.toContain(">Admin<");
  });

  it("does not render a status tag on bill upload submissions", () => {
    const html = renderToStaticMarkup(
      createElement(ClaimReceiptCard, {
        claimId: "CLM-87550",
        extract: {
          fileName: "internet-bill.pdf",
          rawText: "Internet bill",
          vendor: "Airtel",
          category: "Internet",
          amount: "1499",
        },
        submittedAt: 0,
      }),
    );

    expect(html).toContain("Claim submitted");
    expect(html).toContain("Category");
    expect(html).toContain("Internet");
    expect(html.indexOf("Category")).toBeLessThan(html.indexOf("Amount"));
    expect(html).not.toContain("Typical demo review");
    expect(html).not.toContain("local demo record");
    expect(html).not.toContain(
      "rounded-pill border border-success-border bg-white",
    );
  });

  it("labels clean bills for auto review and edited bills for manual review", () => {
    const cleanHtml = renderToStaticMarkup(
      createElement(ClaimReceiptCard, {
        claimId: "CLM-87551",
        extract: buildBillExtractFromScenario("fuel"),
        submittedAt: 0,
      }),
    );
    const editedHtml = renderToStaticMarkup(
      createElement(ClaimReceiptCard, {
        claimId: "CLM-87552",
        extract: {
          ...buildBillExtractFromScenario("fuel"),
          autoApprovalWaived: true,
        },
        submittedAt: 0,
      }),
    );

    expect(cleanHtml).toContain("Auto Review");
    expect(editedHtml).toContain("Manual Review");
  });
});
