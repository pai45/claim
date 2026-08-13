import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);
const receiptStyles = readFileSync(
  join(process.cwd(), "components/scan-pay/scanPay.css"),
  "utf8",
);
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);

describe("PlusPay home hero", () => {
  it("keeps the supplied wallet artwork with the revised corporate message", () => {
    expect(html).toMatch(
      /class="pluspay-corporate-message"[\s\S]*Corporate Payments[\s\S]*With <strong>Pluspay<\/strong>[\s\S]*assets\/pluspay\/hero-wallet\.png/,
    );
    expect(html).not.toContain("Your Corporate Payments");
  });

  it("orders the UPI identity before the labelled payment actions", () => {
    expect(html).toMatch(
      /class="pluspay-payment-surface"[\s\S]*class="upi-panel"[\s\S]*data-upi-id-card[\s\S]*class="pluspay-actions-panel"[\s\S]*UPI payments[\s\S]*data-send-money-open[\s\S]*data-scan-pay-open/,
    );
    expect(html).toContain('data-pluspay-text="UPI ID:"');
  });

  it("reuses the established payment action icons", () => {
    expect(html).toMatch(
      /data-send-money-open[\s\S]*assets\/payments\/send-money\.svg[\s\S]*Send Money/,
    );
    expect(html).toMatch(
      /class="pluspay-action-icon" aria-hidden="true">\s*<img src="\.\.\/assets\/payments\/send-money\.svg" alt="" \/>\s*<\/span>/,
    );
    expect(html).toMatch(
      /data-scan-pay-open[\s\S]*pluspay-action-icon--scanner[\s\S]*#icon-scan-qr[\s\S]*Scan &amp; Pay/,
    );
    expect(styles).toMatch(
      /\.pluspay-action-icon svg,[\s\S]*\.pluspay-action-icon img \{[\s\S]*width: 24px;[\s\S]*height: 24px/,
    );
    expect(styles).toMatch(
      /\.pluspay-action-icon--scanner svg \{[\s\S]*width: 28px;[\s\S]*height: 28px/,
    );
    expect(styles).toMatch(
      /\.pluspay-action-icon \{[\s\S]*width: 48px;[\s\S]*height: 48px;[\s\S]*radial-gradient\([\s\S]*var\(--brand-700\);[\s\S]*color: #ffffff/,
    );
    expect(styles).toMatch(
      /\.pluspay-action-card\.is-highlight \.pluspay-action-icon \{[\s\S]*radial-gradient\([\s\S]*var\(--brand-900\);[\s\S]*color: #ffffff/,
    );
  });

  it("reuses the receipt hero's layered glow with a static pine palette", () => {
    const heroRule = [
      ...styles.matchAll(/body\.is-pluspay \.hero-panel \{[^}]*\}/g),
    ]
      .map(([rule]) => rule)
      .find((rule) => rule.includes("--pluspay-hero-a"));

    expect(heroRule).toBeDefined();
    expect(heroRule?.match(/radial-gradient\(/g)).toHaveLength(3);
    expect(heroRule).toContain("linear-gradient(");
    expect(heroRule).toContain("142deg");
    expect(heroRule).toContain("--pluspay-hero-a");
    expect(heroRule).toContain("--pluspay-hero-d");
    expect(heroRule).not.toContain("animation:");

    for (const sharedLayer of [
      "74% 62% at 18% 22%",
      "58% 68% at 82% 12%",
      "84% 84% at 76% 92%",
      "142deg",
    ]) {
      expect(receiptStyles).toContain(sharedLayer);
      expect(heroRule).toContain(sharedLayer);
    }
  });

  it("keeps the hero edge-to-edge with responsive display typography", () => {
    expect(styles).toMatch(
      /\.hero-panel \{[\s\S]*margin: 0 calc\(var\(--space-16\) \* -1\)/,
    );
    expect(styles).toMatch(
      /\.pluspay-corporate-message p \{[\s\S]*font-family: "PP Telegraf"[\s\S]*font-size: clamp\(var\(--text-18\), 5\.5vw, var\(--text-20\)\);[\s\S]*line-height: 1\.25/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay \.pluspay-corporate-message \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) clamp\(76px, 24vw, 104px\);[\s\S]*column-gap: var\(--space-8\)/,
    );
    expect(styles).toMatch(
      /\.pluspay-corporate-copy \{[\s\S]*transform: translateY\(calc\(var\(--space-20\) \* -1\)\)/,
    );
    expect(styles).toMatch(
      /\.pluspay-corporate-art \{[\s\S]*transform: translateY\(calc\(var\(--space-20\) \* -1\)\)/,
    );
  });

  it("blends the token-curved mint surface into the page background", () => {
    expect(styles).toMatch(
      /body\.is-pluspay \.pluspay-payment-surface \{[\s\S]*z-index: 2;[\s\S]*margin-top: calc\(var\(--space-20\) \* -1\);[\s\S]*border-radius: var\(--radius-20\) var\(--radius-20\) 0 0;[\s\S]*background:\s*linear-gradient\([\s\S]*var\(--bg-soft\)[\s\S]*var\(--bg\)/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-upi-created \.upi-card-id \.upi-copy small \{[\s\S]*font-size: var\(--text-12\);[\s\S]*font-weight: var\(--fw-semibold\)/,
    );
    expect(host).toContain("?v=pluspay-hero-v12");
  });
});
