import { describe, expect, it } from "vitest";
import { distributeOtpPaste, isOtpComplete, verifyOtp } from "./otp";

const empty = () => ["", "", "", "", "", ""];

describe("verifyOtp", () => {
  it("accepts the demo code", () => {
    expect(verifyOtp("123456")).toEqual({ ok: true });
  });

  it.each(["111111", "000000", "654321"])("rejects %s", (value) => {
    const result = verifyOtp(value);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).not.toBe("");
  });

  it("rejects an incomplete code", () => {
    // Guards against a prefix ever passing by accident.
    expect(verifyOtp("12345").ok).toBe(false);
  });
});

describe("distributeOtpPaste", () => {
  it("fills every box from the start", () => {
    expect(distributeOtpPaste(empty(), 0, "123456")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("fills only from the given index", () => {
    expect(distributeOtpPaste(empty(), 2, "34")).toEqual([
      "",
      "",
      "3",
      "4",
      "",
      "",
    ]);
  });

  it("strips separators", () => {
    expect(distributeOtpPaste(empty(), 0, "12 34-56")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("truncates rather than overflowing", () => {
    expect(distributeOtpPaste(empty(), 4, "123456")).toEqual([
      "",
      "",
      "",
      "",
      "1",
      "2",
    ]);
  });

  it("leaves the digits untouched when the paste has no numbers", () => {
    const digits = ["9", "", "", "", "", ""];
    expect(distributeOtpPaste(digits, 0, "abc")).toEqual(digits);
  });
});

describe("isOtpComplete", () => {
  it("is true only when all six boxes are filled", () => {
    expect(isOtpComplete(["1", "2", "3", "4", "5", "6"])).toBe(true);
    expect(isOtpComplete(["1", "2", "3", "4", "5", ""])).toBe(false);
    expect(isOtpComplete(empty())).toBe(false);
  });
});
