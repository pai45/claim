import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { EbBottomNav } from "./EbBottomNav";

describe("EbBottomNav", () => {
  it("renders Benefits as the default center action", () => {
    const markup = renderToStaticMarkup(createElement(EbBottomNav));

    expect(markup).toContain('aria-label="Benefits"');
    expect(markup).toContain('data-walkthrough="benefits-nav"');
    // The nudge's halo anchor: the circle, not the 139px-tall tab around it.
    expect(markup).toContain("data-benefits-fab");
    expect(markup).toContain("/assets/benefits-logo-v2.gif");
    expect(markup).not.toContain('aria-label="Scan &amp; Pay"');
  });

  it("renders the animated Scan & Pay action for PlusPay", () => {
    const markup = renderToStaticMarkup(
      createElement(EbBottomNav, { variant: "pluspay" }),
    );

    expect(markup).toContain('aria-label="Scan &amp; Pay"');
    expect(markup).not.toContain('data-walkthrough="benefits-nav"');
    // Nothing may point a Benefits nudge at Scan & Pay.
    expect(markup).not.toContain("data-benefits-fab");
    expect(markup).toContain("/assets/scan.gif");
    expect(markup).toMatch(/<a[^>]+aria-label="Scan &amp; Pay"/);
    expect(markup).toContain("text-caption font-normal leading-[1.2]");
    expect(markup).not.toContain('aria-label="Benefits"');
    expect(markup).toContain('href="/?mode=pluspay"');
    expect(markup).toContain('href="/?mode=pluspay#scan-pay"');
    expect(markup).toContain('href="/transactions?mode=pluspay"');
  });

  it("keeps the Benefits transaction destination explicit", () => {
    const markup = renderToStaticMarkup(createElement(EbBottomNav));

    expect(markup).toContain('href="/transactions?mode=benefits"');
  });
});
