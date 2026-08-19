import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import { BillExtractCard } from "./BillExtractCard";
import { DriverSalaryReviewCard } from "./DriverSalaryReviewCard";
import { RegistrationDeclaration } from "./RegistrationDeclaration";
import { VehicleDetailsCard } from "./VehicleDetailsCard";

describe("registration declarations", () => {
  it.each(["claim", "vehicle", "driver"] as const)(
    "renders the confirmed %s declaration",
    (subject) => {
      const html = renderToStaticMarkup(
        createElement(RegistrationDeclaration, { subject }),
      );

      expect(html).toContain(
        "I declare that the information provided by me is valid and true and as per the company policy",
      );
      expect(html).toContain("bg-pine-primary");
      expect(html).toContain("h-5 w-5");
      expect(html).toContain("rounded-checkbox");
      expect(html).toContain("text-caption");
      expect(html).toContain("<svg");
    },
  );

  it("requires a declaration before a claim can be submitted", () => {
    const html = renderToStaticMarkup(
      createElement(BillExtractCard, {
        messageId: "claim-review",
        extract: {
          fileName: "internet-bill.pdf",
          rawText: "Internet bill",
          category: "Internet",
          vendor: "Airtel",
          amount: "1499",
          billDate: "2026-08-01",
          billingMonth: "2026-08",
          invoiceNo: "INV-123",
        },
      }),
    );

    expect(html).toContain(
      "I declare that the information provided by me is valid and true and as per the company policy",
    );
    expect(html.indexOf("I declare")).toBeLessThan(html.indexOf(">Submit<"));
    expect(html).toContain('disabled=""');
  });

  it("includes the declaration in the driver review bubble", () => {
    const html = renderToStaticMarkup(
      createElement(DriverSalaryReviewCard, {
        payload: {
          driverName: "Kai",
          dlNumber: "DL-1420110012345",
          dlValidity: "2028-08-08",
          vehicleClaimId: "CLM-87549",
        },
        onSubmit: () => undefined,
      }),
    );

    expect(html).toContain("Review driver details");
    expect(html).toContain(
      "I declare that the information provided by me is valid and true and as per the company policy",
    );
    expect(html.indexOf("I declare")).toBeLessThan(
      html.indexOf("Submit to Admin"),
    );
    expect(html).not.toContain(">Salary<");
    expect(html).not.toContain(">Start date<");
  });

  it("includes the declaration in the vehicle review bubble", () => {
    const result = buildVehicleLookup("KA011111", "Vishal Sharma");
    if (!result.ok) throw new Error("Expected the demo vehicle lookup to pass");

    const html = renderToStaticMarkup(
      createElement(VehicleDetailsCard, {
        messageId: "vehicle-review",
        payload: { lookup: result.lookup, ownership: "company_leased" },
      }),
    );

    expect(html).toContain("Review vehicle details");
    expect(html).toContain("Company Leased");
    expect(html).toContain("KA 01 1111");
    expect(html).toContain('alt="Tata Altroz Hatchback"');
    expect(html).toContain(
      "Vehicle image is for representation purposes only.",
    );
    expect(html).toContain('type="checkbox"');
    expect(html).toContain(
      "I declare that the information provided by me is valid and true and as per the company policy",
    );
    expect(html.indexOf("I declare")).toBeLessThan(
      html.indexOf("Submit to Admin"),
    );
    expect(html).toContain('disabled=""');
    expect(html).not.toContain(">Fuel<");
    expect(html).not.toContain(">Chassis<");
    expect(html).not.toContain(">Engine no.<");
    expect(html).not.toContain(">RTO<");
  });

  it("does not render a separate vehicle-found chat card", () => {
    const result = buildVehicleLookup("KA011111", "Vishal Sharma");
    if (!result.ok) throw new Error("Expected the demo vehicle lookup to pass");

    const html = renderToStaticMarkup(
      createElement(VehicleDetailsCard, {
        messageId: "vehicle-review-only",
        payload: {
          lookup: result.lookup,
          ownership: "self_owned",
        },
      }),
    );

    expect(html).toContain("Review vehicle details");
    expect(html).toContain("KA 01 1111");
    expect(html).toContain("Self Owned");
    expect(html).not.toContain("Vehicle Found");
    expect(html).toContain("Submit to Admin");
    expect(html).toContain('alt="Tata Altroz Hatchback"');
    expect(html).toContain(
      "Vehicle image is for representation purposes only.",
    );
    expect(html).toContain(">Ownership<");
    expect(html).toContain(">Owner<");
    expect(html).toContain(">Engine<");
    expect(html).toContain(">Capacity<");
    expect(html).not.toContain(">Fuel<");
    expect(html).not.toContain(">Chassis<");
    expect(html).not.toContain(">Engine no.<");
    expect(html).not.toContain(">RTO<");
  });
});
