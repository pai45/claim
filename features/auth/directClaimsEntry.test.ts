import { describe, expect, it } from "vitest";
import { isDirectClaimsEntry } from "./directClaimsEntry";

describe("direct Benefits Assistant entry", () => {
  it("recognizes the direct /#claims deep link", () => {
    expect(isDirectClaimsEntry("#claims", "")).toBe(true);
    expect(isDirectClaimsEntry("#CLAIMS", "")).toBe(true);
  });

  it("does not enable the bypass for other hashes or query variants", () => {
    expect(isDirectClaimsEntry("", "")).toBe(false);
    expect(isDirectClaimsEntry("#scan-pay", "")).toBe(false);
    expect(isDirectClaimsEntry("#claims", "?mode=benefits")).toBe(false);
  });
});
