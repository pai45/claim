import { describe, expect, it } from "vitest";
import { getPersonaConfig } from "@/features/persona/constants";
import { resolveTransactionMode } from "@/features/transactions/mode";

describe("transaction product mode", () => {
  it("honors an accessible explicit product", () => {
    const access = getPersonaConfig("returning").access;

    expect(resolveTransactionMode("benefits", access)).toBe("benefits");
    expect(resolveTransactionMode("pluspay", access)).toBe("pluspay");
  });

  it("falls back to the only accessible product", () => {
    expect(
      resolveTransactionMode(
        "pluspay",
        getPersonaConfig("ebPlus_only").access,
      ),
    ).toBe("benefits");
    expect(
      resolveTransactionMode(
        "benefits",
        getPersonaConfig("pluspay_only").access,
      ),
    ).toBe("pluspay");
  });

  it("uses the persona default when no valid mode is requested", () => {
    expect(
      resolveTransactionMode(null, getPersonaConfig("returning").access),
    ).toBe("benefits");
    expect(
      resolveTransactionMode(null, getPersonaConfig("pluspay_only").access),
    ).toBe("pluspay");
  });
});
