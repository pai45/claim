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
const sourceScript = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);

describe("EB+ and PlusPay topbar alignment", () => {
  it("centres the wordmark between two equal end controls", () => {
    // Three-up row: avatar, wordmark, bell. The two end columns must stay the
    // same width -- an asymmetric pair is what pushes the centred wordmark off
    // the viewport's midpoint, which is the whole point of this layout.
    expect(sourceStyles).toMatch(
      /\.topbar-row\s*\{[\s\S]*?grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;/,
    );
    expect(sourceStyles).toMatch(
      /\.topbar-brand\s*\{[^}]*grid-column:\s*2;[^}]*justify-self:\s*center;/,
    );
    // The brand must stay a grid child. Absolutely positioning it is what
    // forced the switcher's width to be derived from `50vw` back when the two
    // shared a row, and it is the one regression that silently undoes this
    // layout.
    expect(sourceStyles).not.toMatch(
      /\.topbar-brand\s*\{[^}]*position:\s*absolute;/,
    );
    expect(sourceStyles).toMatch(
      /\.avatar-button\s*\{[^}]*grid-column:\s*1;[^}]*width:\s*44px;[^}]*height:\s*44px;/,
    );
    expect(sourceStyles).toMatch(
      /\.topbar-notify\s*\{[^}]*grid-column:\s*3;[^}]*width:\s*44px;[^}]*height:\s*44px;[^}]*justify-self:\s*end;/,
    );
  });

  it("gives the switcher its own full-width row", () => {
    expect(sourceMarkup).toContain('class="topbar-switch-row"');
    expect(sourceStyles).toMatch(
      /\.product-switcher\s*\{[^}]*width:\s*100%;[^}]*min-height:\s*44px;/,
    );
    expect(sourceStyles).toMatch(
      /\.product-switcher-track\s*\{[^}]*height:\s*40px;/,
    );
    // Nothing in the switcher may re-enter the brand's row.
    expect(sourceStyles).not.toMatch(
      /\.product-switcher\s*\{[^}]*grid-column:/,
    );
    expect(sourceStyles).not.toMatch(/--product-switcher-width/);
  });

  it("expands the active segment in both product modes", () => {
    // `flex-grow` is the animated property: growing one segment against the
    // other both widens the pill and slides the boundary between the labels.
    // If these collapse to equal halves the switch stops animating entirely.
    expect(sourceStyles).toMatch(
      /body:not\(\.is-pluspay\) \.product-segment-lens,\s*body\.is-pluspay \.product-segment-pluspay\s*\{[^}]*flex-grow:\s*1\.85;/,
    );
    expect(sourceStyles).toMatch(
      /\.product-segment\s*\{[\s\S]*?transition:[^;]*flex-grow\s+320ms/,
    );
    // The dot marks the selection, so it has to move with it.
    expect(sourceStyles).toMatch(
      /body:not\(\.is-pluspay\) \.product-segment-lens \.product-segment-dot,\s*body\.is-pluspay \.product-segment-pluspay \.product-segment-dot\s*\{[^}]*opacity:\s*1;/,
    );
  });

  it("retires the S-curve seam machinery", () => {
    // The seam's two clipped fill layers were replaced by the expanding pill.
    // Reintroducing either would stack a second, non-animating paint over it.
    expect(sourceStyles).not.toMatch(/switcher-fill|switcher-seam/);
    expect(sourceMarkup).not.toMatch(/switcher-fill|switcher-seam/);
  });

  it("keeps the switcher present and inert for locked personas", () => {
    expect(sourceStyles).toMatch(
      /body\.is-product-locked \[data-pluspay-toggle\]\s*\{[^}]*display:\s*flex !important;/,
    );
    // Cancels the expanding pill so the lone visible label sits at its
    // natural width instead of stretching across the row.
    expect(sourceStyles).toMatch(
      /body\.is-product-locked \.product-segment\s*\{[^}]*flex:\s*0 0 auto;/,
    );
  });

  it("renders the bell against the existing sprite symbol", () => {
    expect(sourceMarkup).toContain('class="topbar-notify"');
    expect(sourceMarkup).toContain('aria-label="Open notifications"');
    expect(sourceMarkup).toContain('href="#icon-bell"');
    expect(sourceMarkup).toContain("data-notifications-open");
    expect(sourceMarkup).toMatch(/<symbol id="icon-bell"/);
  });

  it("keeps the switcher labelled and reachable", () => {
    expect(sourceMarkup).toContain("Switch between EB+ and Expense");
    expect(sourceMarkup).toMatch(
      /product-segment-pluspay[^>]*>[\s\S]*?Expense\s*<\/span>/,
    );
    expect(sourceStyles).not.toMatch(/body\.is-pluspay \.topbar-row\s*\{/);
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.avatar-button[^{]*\{[^}]*\b(?:width|height):/,
    );
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.topbar-brand\s*\{[^}]*\b(?:top|left|width|height|transform):/,
    );
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.product-switcher\s*\{[^}]*\b(?:width|height|min-height):/,
    );
  });

  it("suppresses switch motion on first paint and under reduced motion", () => {
    // `applyMode` runs before paint, so an unguarded pill animates in from the
    // wrong side on load.
    expect(sourceMarkup).toMatch(/<body class="is-booting">/);
    expect(sourceStyles).toMatch(
      /body\.is-booting \.product-segment,[\s\S]*?transition:\s*none;/,
    );
    expect(sourceScript).toMatch(/classList\.remove\("is-booting"\)/);
    // The stylesheet carries several reduced-motion blocks; the switcher only
    // needs to be covered by one of them.
    const reducedMotionBlocks = sourceStyles
      .split("@media (prefers-reduced-motion: reduce)")
      .slice(1)
      .map((chunk) => chunk.slice(0, chunk.indexOf("\n}")));
    expect(reducedMotionBlocks.length).toBeGreaterThan(0);
    expect(
      reducedMotionBlocks.some((block) => block.includes(".product-segment,")),
    ).toBe(true);
    expect(
      reducedMotionBlocks.some((block) =>
        block.includes(".product-segment-dot"),
      ),
    ).toBe(true);
  });
});
