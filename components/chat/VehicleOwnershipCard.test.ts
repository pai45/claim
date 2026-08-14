import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VehicleOwnershipCard } from "./VehicleOwnershipCard";

describe("VehicleOwnershipCard", () => {
  it("offers both ownership choices", () => {
    const html = renderToStaticMarkup(
      createElement(VehicleOwnershipCard, {
        onSelect: () => undefined,
      }),
    );

    expect(html).toContain("Self Owned");
    expect(html).toContain("Company Leased");
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html.match(/w-fit/g)).toHaveLength(2);
    expect(html.match(/px-4/g)).toHaveLength(2);
  });

  it("shows and locks the selected ownership", () => {
    const html = renderToStaticMarkup(
      createElement(VehicleOwnershipCard, {
        selected: "company_leased",
        onSelect: () => undefined,
      }),
    );

    expect(html).toContain("border-pine-primary bg-surface-tint-strong");
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
