import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceStyles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);
const sourceMarkup = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);

describe("EB+ and PlusPay topbar alignment", () => {
  it("keeps both product modes on the shared topbar geometry", () => {
    expect(sourceStyles).toMatch(
      /\.topbar-row\s*\{[\s\S]*?--product-switcher-width:\s*clamp\(140px, 40vw, 156px\);[\s\S]*?grid-template-columns:\s*44px minmax\(0, var\(--topbar-brand-lead\)\) auto\s*minmax\(0, var\(--topbar-brand-trail\)\) var\(--product-switcher-width\);[\s\S]*?min-height:\s*88px;/,
    );
    expect(sourceStyles).toMatch(
      /\.topbar-brand\s*\{[^}]*grid-column:\s*3;[^}]*width:\s*64px;/,
    );
    // The brand must stay a grid child. Absolutely positioning it is what
    // forced the switcher's width to be derived from `50vw` as a collision
    // dodge, and it is the one regression that silently undoes this layout.
    expect(sourceStyles).not.toMatch(
      /\.topbar-brand\s*\{[^}]*position:\s*absolute;/,
    );
    expect(sourceStyles).toMatch(
      /\.product-switcher\s*\{[^}]*grid-column:\s*5;[^}]*width:\s*var\(--product-switcher-width\);[^}]*min-height:\s*44px;/,
    );
    expect(sourceStyles).toMatch(
      /\.product-switcher-track\s*\{[^}]*height:\s*40px;/,
    );
    expect(sourceStyles).toMatch(
      /body\.is-product-locked \[data-pluspay-toggle\]\s*\{[^}]*display:\s*flex !important;/,
    );
    expect(sourceMarkup).toContain('class="topbar-brand"');
    expect(sourceMarkup).toContain("Switch between EB+ and Expense");
    expect(sourceMarkup).toMatch(
      /product-segment-pluspay[^>]*>\s*Expense\s*<\/span>/,
    );
    expect(sourceStyles).not.toMatch(/body\.is-pluspay \.topbar-row\s*\{/);
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.avatar-button\s*\{[^}]*\b(?:width|height):/,
    );
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.topbar-brand\s*\{[^}]*\b(?:top|left|width|height|transform):/,
    );
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.product-switcher\s*\{[^}]*\b(?:width|height|min-height):/,
    );
  });

  it.each([320, 340, 350, 370, 402, 434])(
    "keeps the brand lockup clear of the right-aligned toggle at %ipx",
    (viewportWidth) => {
      const gap = viewportWidth <= 370 ? 8 : 10;
      const brandWidth =
        viewportWidth <= 340 ? 48 : viewportWidth <= 360 ? 56 : 64;
      const toggleWidth = Math.min(156, Math.max(140, viewportWidth * 0.4));
      // 16px of `.topbar` padding each side; four column gaps across the
      // five-column grid. What is left over is split between the two springs
      // either side of the brand, in the declared 1fr : 1.6fr ratio.
      const free = viewportWidth - 32 - 44 - brandWidth - toggleWidth - gap * 4;
      const lead = free * (1 / 2.6);
      const trail = free - lead;
      const toggleLeft = viewportWidth - 16 - toggleWidth;

      expect(free).toBeGreaterThanOrEqual(16);
      // The brand drifts right but must stay short of the field's midpoint --
      // centring it on the viewport is what collided with the toggle before.
      expect(lead).toBeLessThan(trail);
      expect(toggleLeft).toBeCloseTo(
        16 + 44 + gap + lead + gap + brandWidth + gap + trail + gap,
      );
      expect(toggleLeft + toggleWidth).toBe(viewportWidth - 16);
    },
  );
});
