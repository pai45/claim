import { describe, expect, it } from "vitest";

const CLAIMS_HASH = "#claims";

function isClaimsHash(hash: string) {
  return hash.toLowerCase() === CLAIMS_HASH;
}

describe("Employee Benefits claims bridge", () => {
  it("recognizes the Claims deep link case-insensitively", () => {
    expect(isClaimsHash("#claims")).toBe(true);
    expect(isClaimsHash("#CLAIMS")).toBe(true);
    expect(isClaimsHash("#scan-pay")).toBe(false);
  });
});
