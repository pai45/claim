import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEMO_NEARBY_MEAL_MERCHANTS } from "@/lib/merchants/demoNearby";
import { MerchantResultsCard } from "./MerchantResultsCard";

describe("MerchantResultsCard", () => {
  it("renders all demo merchants without the network partner label", () => {
    const html = renderToStaticMarkup(
      createElement(MerchantResultsCard, {
        benefitType: "meal",
        results: DEMO_NEARBY_MEAL_MERCHANTS,
      }),
    );

    for (const merchant of DEMO_NEARBY_MEAL_MERCHANTS) {
      expect(html).toContain(merchant.name.replace("'", "&#x27;"));
    }
    expect(html.match(/<li/g)).toHaveLength(5);
    expect(html.match(/Allowed/g)).toHaveLength(5);
    expect(html).not.toContain("Network partner");
  });
});
