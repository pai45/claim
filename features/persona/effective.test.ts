import { describe, expect, it } from "vitest";
import { getPersonaConfig } from "./constants";
import { resolveEffectivePersona } from "./effective";

describe("effective persona access", () => {
  it("upgrades completed Rohan and makes EB+ the default", () => {
    const persona = resolveEffectivePersona(
      getPersonaConfig("pluspay_only"),
      true,
    );

    expect(persona.access.products).toEqual({
      ebPlus: true,
      plusPay: true,
    });
    expect(persona.access.defaultProduct).toBe("ebPlus");
    expect(persona.hasClaims).toBe(false);
    expect(persona.hasTransactions).toBe(true);
    expect(persona.hasRegisteredVehicle).toBe(false);
    expect(persona.isCardActivated).toBe(true);
    expect(persona.hasBenefitsUpiId).toBe(false);
    expect(persona.hasPlusPayUpiId).toBe(true);
  });

  it("does not upgrade Rohan before completion or alter other personas", () => {
    const rohan = getPersonaConfig("pluspay_only");
    const vishal = getPersonaConfig("returning");

    expect(resolveEffectivePersona(rohan, false)).toBe(rohan);
    expect(resolveEffectivePersona(vishal, true)).toBe(vishal);
  });
});
