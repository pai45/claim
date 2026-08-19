import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeActionCards } from "./HomeActionCards";

function renderAlertCard(notificationCount: number) {
  return renderToStaticMarkup(
    createElement(HomeActionCards, {
      notificationCount,
      showNotifications: true,
      registration: null,
      onVehicleStart: () => undefined,
      onDriverStart: () => undefined,
    }),
  );
}

describe("HomeActionCards", () => {
  it("uses the singular alert label for one notification", () => {
    expect(renderAlertCard(1)).toContain("1</span> new alert");
  });

  it("uses the plural alerts label for multiple notifications", () => {
    expect(renderAlertCard(7)).toContain("7</span> new alerts");
  });
});
