import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VehicleNumberInputCard } from "./VehicleNumberInputCard";

describe("VehicleNumberInputCard", () => {
  it("collects vehicle ownership beside the vehicle number", () => {
    const html = renderToStaticMarkup(
      createElement(VehicleNumberInputCard, {
        onSubmit: () => undefined,
      }),
    );

    expect(html).toContain("Is this vehicle self owned or company leased?");
    expect(html).toContain("Self Owned");
    expect(html).toContain("Company Leased");
    expect(html).toContain("Vehicle ownership choices");
    expect(html).toContain("grid grid-cols-2 gap-2");
  });
});
