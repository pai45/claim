import { describe, expect, it } from "vitest";
import { normalizeDlText, parseDl } from "./parseDl";

describe("parseDl", () => {
  it("parses spaced Indian DL numbers", () => {
    expect(parseDl("DL No: MH01 20110012345").dlNumber).toBe(
      "MH01 20110012345",
    );
  });

  it("parses compact Indian DL numbers", () => {
    expect(parseDl("Licence MH0120110012345 Valid").dlNumber).toBe(
      "MH01 20110012345",
    );
  });

  it("rejects unknown state codes", () => {
    expect(parseDl("XX01 20110012345").dlNumber).toBeUndefined();
  });

  it("normalizes punctuation", () => {
    expect(normalizeDlText("mh-01/2011-0012345")).toContain("MH");
  });
});
