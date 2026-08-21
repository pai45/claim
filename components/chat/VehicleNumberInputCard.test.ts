import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VehicleNumberInputCard } from "./VehicleNumberInputCard";

describe("VehicleNumberInputCard", () => {
  it("collects vehicle ownership beside the vehicle number with radio buttons", () => {
    const html = renderToStaticMarkup(
      createElement(VehicleNumberInputCard, {
        onSubmit: () => undefined,
      }),
    );

    expect(html).toContain("Is this vehicle self owned or company leased?");
    expect(html).toContain("Self Owned");
    expect(html).toContain("Company Leased");
    expect(html).toContain('type="radio"');
    expect(html).toContain('name="vehicle-ownership"');
    expect(html).toContain('checked="" value="self_owned"');
    expect(html).toContain("border-t border-border-line pt-4");
  });
});
