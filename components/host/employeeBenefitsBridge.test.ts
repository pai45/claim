import { describe, expect, it } from "vitest";

const CLAIMS_HASH = "#claims";
const OPEN_TRANSACTIONS_MESSAGE = "employee-benefits:open-transactions";
const OPEN_MANAGE_LIMITS_MESSAGE = "employee-benefits:open-manage-limits";
const OPEN_PROFILE_MESSAGE = "employee-benefits:open-profile";
const OPEN_SPEND_ANALYTICS_MESSAGE = "employee-benefits:open-spend-analytics";
const OPEN_UPI_SETTINGS_MESSAGE = "employee-benefits:open-upi-settings";
const OPEN_SEND_MONEY_MESSAGE = "employee-benefits:open-send-money";
const OPEN_BENEFITS_MESSAGE = "employee-benefits:open-benefits-assistant";
const VERIFY_MPIN_MESSAGE = "employee-benefits:verify-mpin";
const MPIN_VERIFIED_MESSAGE = "employee-benefits:mpin-verified";
const MPIN_CANCELLED_MESSAGE = "employee-benefits:mpin-cancelled";
const CARD_MPIN_INTENTS = ["activate-card", "set-card-pin"] as const;

function isClaimsHash(hash: string) {
  return hash.toLowerCase() === CLAIMS_HASH;
}

describe("Employee Benefits claims bridge", () => {
  it("recognizes the Claims deep link case-insensitively", () => {
    expect(isClaimsHash("#claims")).toBe(true);
    expect(isClaimsHash("#CLAIMS")).toBe(true);
    expect(isClaimsHash("#scan-pay")).toBe(false);
  });

  it("uses distinct message types for Benefits and Transactions", () => {
    expect(OPEN_BENEFITS_MESSAGE).toBe(
      "employee-benefits:open-benefits-assistant",
    );
    expect(OPEN_TRANSACTIONS_MESSAGE).toBe(
      "employee-benefits:open-transactions",
    );
    expect(OPEN_BENEFITS_MESSAGE).not.toBe(OPEN_TRANSACTIONS_MESSAGE);
  });

  it("uses a distinct message type for Manage Limits", () => {
    expect(OPEN_MANAGE_LIMITS_MESSAGE).toBe(
      "employee-benefits:open-manage-limits",
    );
    expect(OPEN_MANAGE_LIMITS_MESSAGE).not.toBe(OPEN_TRANSACTIONS_MESSAGE);
  });

  it("uses a distinct message type for Profile", () => {
    expect(OPEN_PROFILE_MESSAGE).toBe("employee-benefits:open-profile");
    expect(OPEN_PROFILE_MESSAGE).not.toBe(OPEN_MANAGE_LIMITS_MESSAGE);
  });

  it("uses a dedicated message type for tab-aware UPI settings", () => {
    expect(OPEN_UPI_SETTINGS_MESSAGE).toBe(
      "employee-benefits:open-upi-settings",
    );
    expect(OPEN_UPI_SETTINGS_MESSAGE).not.toBe(OPEN_MANAGE_LIMITS_MESSAGE);
    expect(OPEN_UPI_SETTINGS_MESSAGE).not.toBe(OPEN_PROFILE_MESSAGE);
  });

  it("uses a dedicated message type for Spend Analytics", () => {
    expect(OPEN_SPEND_ANALYTICS_MESSAGE).toBe(
      "employee-benefits:open-spend-analytics",
    );
    expect(OPEN_SPEND_ANALYTICS_MESSAGE).not.toBe(
      OPEN_TRANSACTIONS_MESSAGE,
    );
  });

  it("uses a dedicated message type for Send Money", () => {
    expect(OPEN_SEND_MONEY_MESSAGE).toBe("employee-benefits:open-send-money");
    expect(OPEN_SEND_MONEY_MESSAGE).not.toBe(OPEN_TRANSACTIONS_MESSAGE);
    expect(OPEN_SEND_MONEY_MESSAGE).not.toBe(OPEN_UPI_SETTINGS_MESSAGE);
  });

  it("uses a dedicated request/result contract for card MPIN verification", () => {
    expect(VERIFY_MPIN_MESSAGE).toBe("employee-benefits:verify-mpin");
    expect(MPIN_VERIFIED_MESSAGE).toBe("employee-benefits:mpin-verified");
    expect(MPIN_CANCELLED_MESSAGE).toBe("employee-benefits:mpin-cancelled");
    expect(
      new Set([
        VERIFY_MPIN_MESSAGE,
        MPIN_VERIFIED_MESSAGE,
        MPIN_CANCELLED_MESSAGE,
      ]).size,
    ).toBe(3);
    expect(CARD_MPIN_INTENTS).toEqual(["activate-card", "set-card-pin"]);
  });
});
