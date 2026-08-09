import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import { DriverSalaryReviewCard } from "./DriverSalaryReviewCard";
import { RegistrationDeclaration } from "./RegistrationDeclaration";
import { VehicleDetailsCard } from "./VehicleDetailsCard";

describe("registration declarations", () => {
  it.each(["vehicle", "driver"] as const)(
    "renders the confirmed %s declaration",
    (subject) => {
      const html = renderToStaticMarkup(
        createElement(RegistrationDeclaration, { subject }),
      );

      expect(html).toContain(
        `I declare that the ${subject} details provided are correct and valid.`,
      );
      expect(html).toContain("bg-pine-primary");
      expect(html).toContain("h-5 w-5");
      expect(html).toContain("text-caption");
      expect(html).toContain("<svg");
    },
  );

  it("includes the declaration in the driver review bubble", () => {
    const html = renderToStaticMarkup(
      createElement(DriverSalaryReviewCard, {
        payload: {
          driverName: "Kai",
          dlNumber: "DL-1420110012345",
          salary: "23000",
          startDate: "2026-08-08",
          vehicleClaimId: "CLM-87549",
        },
        onSubmit: () => undefined,
      }),
    );

    expect(html).toContain("Review driver details");
    expect(html).toContain(
      "I declare that the driver details provided are correct and valid.",
    );
    expect(html.indexOf("I declare")).toBeLessThan(html.indexOf("Submit to HR"));
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
    expect(html).toContain('type="checkbox"');
    expect(html).toContain(
      "I declare that the vehicle details provided are correct and valid.",
    );
    expect(html.indexOf("I declare")).toBeLessThan(html.indexOf("Submit to HR"));
    expect(html).toContain('disabled=""');
  });
});
