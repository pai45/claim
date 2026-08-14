import { describe, expect, it } from "vitest";
import {
  buildTransactionDetailsHref,
  resolveTransactionDetailsReturnTo,
} from "@/features/transactions/navigation";

describe("transaction details navigation", () => {
  it("builds an encoded details URL with explicit return context", () => {
    expect(
      buildTransactionDetailsHref({
        transactionId: "txn / 42",
        mode: "benefits",
        returnTo: "/wallet-statement/?wallet=meal&month=2026-08",
      }),
    ).toBe(
      "/transaction-details/?id=txn+%2F+42&mode=benefits&returnTo=%2Fwallet-statement%2F%3Fwallet%3Dmeal%26month%3D2026-08",
    );
  });

  it("accepts each supported local source route", () => {
    const routes = [
      "/?mode=benefits",
      "/?mode=benefits&resumePayment=12345#scan-pay",
      "/transactions/?mode=pluspay&month=2026-08",
      "/wallet-statement/?wallet=fuel&month=2026-07",
      "/send-money/?mode=benefits&payee=anjali-kumar",
      "/bank-transfer/?beneficiary=bank-hdfc0001234-123456789012",
    ];

    for (const route of routes) {
      expect(resolveTransactionDetailsReturnTo(route, "benefits")).toBe(route);
    }
  });

  it("normalizes supported routes to their trailing-slash form", () => {
    expect(
      resolveTransactionDetailsReturnTo(
        "/transactions?mode=benefits&wallet=meal",
        "benefits",
      ),
    ).toBe("/transactions/?mode=benefits&wallet=meal");
  });

  it.each([
    "https://example.com/",
    "//example.com/",
    "/\\example.com/",
    "/profile/",
    "/transactions/?redirect=https://example.com",
    "/transactions/?mode=admin",
    "/#claims",
  ])("rejects unsafe or unsupported return target %s", (returnTo) => {
    expect(resolveTransactionDetailsReturnTo(returnTo, "pluspay")).toBe(
      "/transactions/?mode=pluspay",
    );
  });

  it("uses the product-specific history fallback for missing context", () => {
    expect(resolveTransactionDetailsReturnTo(null, "benefits")).toBe(
      "/transactions/?mode=benefits",
    );
  });
});
