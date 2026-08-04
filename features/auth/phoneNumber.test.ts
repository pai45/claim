import { describe, expect, it } from "vitest";
import { formatMobileInput, isValidMobile, maskMobile } from "./phoneNumber";

describe("formatMobileInput", () => {
  it("strips separators and letters", () => {
    expect(formatMobileInput("98765-43210")).toBe("9876543210");
    expect(formatMobileInput("98765 43210")).toBe("9876543210");
    expect(formatMobileInput("9876abc543210")).toBe("9876543210");
  });

  it("caps at ten digits", () => {
    expect(formatMobileInput("98765432109999")).toBe("9876543210");
  });

  it("strips a pasted country code", () => {
    // Without this the +91 would eat the cap and yield a different number.
    expect(formatMobileInput("+91 98765 43210")).toBe("9876543210");
    expect(formatMobileInput("919876543210")).toBe("9876543210");
  });

  it("strips a leading trunk zero", () => {
    expect(formatMobileInput("09876543210")).toBe("9876543210");
  });

  it("keeps a bare number starting with 91 intact", () => {
    // "9198765432" is itself a valid 10-digit number; only strip when longer.
    expect(formatMobileInput("9198765432")).toBe("9198765432");
  });

  it("returns an empty string for input with no digits", () => {
    expect(formatMobileInput("abc")).toBe("");
  });
});

describe("isValidMobile", () => {
  it.each(["6876543210", "7876543210", "8876543210", "9876543210"])(
    "accepts %s",
    (value) => {
      expect(isValidMobile(value)).toBe(true);
    },
  );

  it.each(["987654321", "98765432101", "5876543210", "0876543210", ""])(
    "rejects %s",
    (value) => {
      expect(isValidMobile(value)).toBe(false);
    },
  );
});

describe("maskMobile", () => {
  it("masks all but the last four digits", () => {
    expect(maskMobile("9876543210")).toBe("+91 **** 3210");
  });

  it("does not throw on a partial number", () => {
    expect(() => maskMobile("98")).not.toThrow();
    expect(maskMobile("")).toBe("+91 **** ");
  });
});
