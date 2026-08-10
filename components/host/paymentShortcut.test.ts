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
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);

describe("Pay to Anyone bridge", () => {
  it("replaces the EB+ Tap & Pay shortcut with a UPI-aware send action", () => {
    expect(html).toMatch(
      /data-send-money-open[\s\S]*data-upi-created-only[\s\S]*send-money\.svg[\s\S]*Pay to<br \/>Anyone/,
    );
    expect(html.match(/assets\/payments\/send-money\.svg/g)).toHaveLength(2);
  });

  it("sends and preserves the active benefits or PlusPay mode", () => {
    expect(sourceApp).toContain('type: "employee-benefits:open-send-money"');
    expect(sourceApp).toMatch(/is-pluspay[\s\S]*\? "pluspay"[\s\S]*: "benefits"/);
    expect(host).toContain("/send-money/?mode=${mode}");
  });
});
