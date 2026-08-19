import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DriverDlExtractCard } from "./DriverDlExtractCard";

describe("DriverDlExtractCard", () => {
  it("keeps the licence step focused on driving licence details", () => {
    const html = renderToStaticMarkup(
      createElement(DriverDlExtractCard, {
        payload: {
          driverName: "Ramesh Kumar",
          dlNumber: "MH0120110012345",
          dlValidity: "2030-01-01",
        },
        onConfirm: () => undefined,
      }),
    );

    expect(html).toContain("Driving licence details");
    expect(html).not.toContain("Monthly salary");
    expect(html).not.toContain("Start date");
  });
});
