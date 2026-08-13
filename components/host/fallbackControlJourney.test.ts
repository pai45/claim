import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FALLBACK_CONTROL_STATE,
  FALLBACK_CONTROL_STORAGE_KEY,
} from "@/features/fallback-control/store";
import { calculateScanPayFunding } from "@/features/scan-pay/funding";
import { createScanPayTransaction } from "@/features/scan-pay/fixtures";
import { receiptRows } from "@/features/scan-pay/receipt";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);

const balances = { meal: 100, fuel: 80, misc: 200 };

describe("Fallback Control journey", () => {
  it("restores the Manage Cards entry point with both controls on by default", () => {
    expect(html).toMatch(
      /data-fallback-open[\s\S]*fallback-control\.svg[\s\S]*Fallback<br \/>Control/,
    );
    expect(html.match(/data-fallback-toggle="(?:meal|fuel)"/g)).toHaveLength(2);
    expect(html.match(/aria-checked="true"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(DEFAULT_FALLBACK_CONTROL_STATE).toEqual({ meal: true, fuel: true });
  });

  it("shares one persisted contract between the controls and Scan & Pay", () => {
    expect(sourceApp).toContain(
      `const FALLBACK_STORAGE_KEY = "${FALLBACK_CONTROL_STORAGE_KEY}"`,
    );
    expect(sourceApp).toContain("const fallbackState = { meal: true, fuel: true }");
    expect(sourceApp).toContain("version: FALLBACK_STORAGE_VERSION");
    expect(html).not.toMatch(/split[ -]?pay/i);
    expect(sourceApp).not.toMatch(/split[ -]?pay/i);
  });

  it("splits a low-balance payment when on and blocks it when off", () => {
    const enabledPlan = calculateScanPayFunding({
      amount: 160,
      walletId: "meal",
      mode: "benefits",
      merchantType: "meal",
      balances,
      fallback: DEFAULT_FALLBACK_CONTROL_STATE,
    });
    const disabledPlan = calculateScanPayFunding({
      amount: 160,
      walletId: "meal",
      mode: "benefits",
      merchantType: "meal",
      balances,
      fallback: { meal: false, fuel: true },
    });

    expect(enabledPlan).toMatchObject({
      status: "split",
      allocations: [
        { walletId: "meal", amount: 100 },
        { walletId: "misc", amount: 60 },
      ],
    });
    expect(disabledPlan).toMatchObject({
      status: "fallback-disabled",
      allocations: [],
      shortfall: 60,
    });
  });

  it("carries the split into the payment receipt", () => {
    const transaction = createScanPayTransaction({
      amount: 160,
      walletId: "meal",
      categoryId: null,
      subcategoryId: null,
      note: "",
      outcome: "success",
      mode: "benefits",
      merchantType: "meal",
      fundingAllocations: [
        { walletId: "meal", walletLabel: "Meal Wallet", amount: 100 },
        {
          walletId: "misc",
          walletLabel: "Reimbursement Wallet",
          amount: 60,
        },
      ],
    });

    expect(receiptRows(transaction)).toEqual(
      expect.arrayContaining([
        ["Paid from Meal Wallet", "₹100"],
        ["Paid from Reimbursement Wallet", "₹60"],
      ]),
    );
  });
});
