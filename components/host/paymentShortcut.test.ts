import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);

describe("EB+ home payment actions", () => {
  it("groups the created UPI ID card and the scan tile in one home row", () => {
    expect(html).not.toContain('class="payment-shortcuts"');
    // UPI ID card first, scan tile last: DOM order matches the visual order so
    // keyboard focus travels left to right.
    expect(html).toMatch(
      /class="upi-panel"[\s\S]*class="upi-card upi-card-id"[\s\S]*class="home-scan-card"[\s\S]*data-scan-pay-open/,
    );
    expect(styles).toMatch(
      /body:not\(\.is-pluspay\)\.is-upi-created \.upi-panel \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) var\(--pay-row-h\)/,
    );
    expect(html).toContain("UPI ID");
    expect(sourceApp).toContain('const CREATED_UPI_ID = "8646721579@pinelabs"');
    expect(styles).toMatch(
      /@media \(max-width: 370px\)[\s\S]*body:not\(\.is-pluspay\)\.is-upi-created \.upi-panel[\s\S]*gap: 8px/,
    );
  });

  it("renders the scan shortcut as an icon-only square with no visible caption", () => {
    expect(html).not.toContain("Scan<br />QR code");
    const scanButton = html.match(
      /<button\s+class="home-scan-card"[\s\S]*?<\/button>/,
    );
    expect(scanButton).not.toBeNull();
    // The glyph is aria-hidden, so the button's accessible name rests entirely
    // on this label.
    expect(scanButton![0]).toContain('aria-label="Scan QR code"');
    expect(scanButton![0]).not.toContain("<strong>");
    // Square: one token drives both the tile and the UPI card's height.
    expect(styles).toMatch(
      /\.home-scan-card \{[\s\S]*width: var\(--pay-row-h\);[\s\S]*height: var\(--pay-row-h\)/,
    );
    // `body.is-upi-created [data-upi-created-only]` forces display:flex
    // !important on this button, and justify-items is a no-op in flexbox. The
    // glyph must therefore be centred with justify-content, not place-items,
    // or it snaps back to the left edge of the tile.
    const scanRule = styles.match(/\n\.home-scan-card \{[\s\S]*?\}/);
    expect(scanRule).not.toBeNull();
    // Strip comments so the prose explaining the bug is not mistaken for a
    // declaration.
    const scanDecls = scanRule![0].replace(/\/\*[\s\S]*?\*\//g, "");
    expect(scanDecls).toContain("justify-content: center");
    expect(scanDecls).not.toContain("place-items");
    expect(styles).toMatch(
      /body:not\(\.is-pluspay\)\.is-upi-created \.upi-card-id \{[\s\S]*height: var\(--pay-row-h\)/,
    );
  });

  it("removes the white Scan QR card from the PlusPay home", () => {
    expect(html).toMatch(
      /class="home-scan-card"[\s\S]*data-pluspay-hide[\s\S]*hidden/,
    );
    expect(sourceApp).toContain("homeScanCard.hidden = isPluspay");
    expect(styles).toMatch(
      /body\.is-pluspay \.home-scan-card \{[\s\S]*display: none !important/,
    );
  });

  it("gives PlusPay the full-width EB+ UPI identity card treatment", () => {
    expect(styles).toMatch(
      /body\.is-pluspay\.is-upi-created \.upi-card-id \{[\s\S]*grid-template-columns: 40px minmax\(0, 1fr\) 16px;[\s\S]*width: 100%;[\s\S]*height: 64px/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-upi-created \.upi-card-id \.upi-brand-badge \{[\s\S]*width: 40px;[\s\S]*height: 40px;[\s\S]*border: 1px solid var\(--line\)/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-upi-created \.upi-card-id \.upi-copy \{[\s\S]*display: contents/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-upi-created \.upi-card-id \.upi-copy-icon \{[\s\S]*display: none/,
    );
  });

  it("moves Bank Transfer and the renamed UPI payment action into Reimbursement Wallet", () => {
    expect(html).not.toContain("Pay to<br />Anyone");
    expect(html).toMatch(
      /data-reimbursement-actions[\s\S]*data-bank-transfer-open[\s\S]*Bank<br \/>Transfer[\s\S]*data-send-money-open[\s\S]*data-upi-created-only[\s\S]*Pay<br \/>UPI ID/,
    );
    // The PlusPay home CTA intentionally shares the Reimbursement Wallet's
    // Pay UPI ID asset, keeping the send-money affordance consistent.
    expect(html.match(/assets\/payments\/send-money\.svg/g)).toHaveLength(2);
    expect(sourceApp).toContain(
      'reimbursementActions.hidden = walletTone !== "misc"',
    );
    expect(styles).toMatch(
      /\.reimbursement-actions \{[\s\S]*grid-template-columns: minmax\(0, 1fr\)/,
    );
    expect(styles).toMatch(
      /body\.is-upi-created \.reimbursement-actions[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
    );
  });

  it("preserves the active benefits or PlusPay mode when sending", () => {
    expect(sourceApp).toContain('type: "employee-benefits:open-send-money"');
    expect(sourceApp).toMatch(/is-pluspay[\s\S]*\? "pluspay"[\s\S]*: "benefits"/);
    expect(host).toContain("/send-money/?mode=${mode}");
  });
});
