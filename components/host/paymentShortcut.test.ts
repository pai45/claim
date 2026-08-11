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
  it("groups Scan QR code and the created UPI ID card in one home row", () => {
    expect(html).not.toContain('class="payment-shortcuts"');
    expect(html).toMatch(
      /class="upi-panel"[\s\S]*class="home-scan-card"[\s\S]*data-scan-pay-open[\s\S]*Scan<br \/>QR code[\s\S]*class="upi-card upi-card-id"/,
    );
    expect(styles).toMatch(
      /body:not\(\.is-pluspay\)\.is-upi-created \.upi-panel[\s\S]*grid-template-columns: minmax\(0, 0\.8fr\) minmax\(0, 1\.2fr\)/,
    );
    expect(html).toContain("UPI ID:");
    expect(sourceApp).toContain('const CREATED_UPI_ID = "8646721579@pinelabs"');
    expect(styles).toMatch(
      /\.home-scan-card strong[\s\S]*font-size: 14px[\s\S]*white-space: nowrap/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 370px\)[\s\S]*body:not\(\.is-pluspay\)\.is-upi-created \.upi-panel[\s\S]*gap: 8px/,
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

  it("moves Bank Transfer and the renamed UPI payment action into Reimbursement Wallet", () => {
    expect(html).not.toContain("Pay to<br />Anyone");
    expect(html).toMatch(
      /data-reimbursement-actions[\s\S]*data-bank-transfer-open[\s\S]*Bank<br \/>Transfer[\s\S]*data-send-money-open[\s\S]*data-upi-created-only[\s\S]*Pay<br \/>UPI ID/,
    );
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
