import { describe, expect, it } from "vitest";
import {
  canUseAutoPay,
  canUseCollectRequests,
  getPersonaConfig,
} from "./constants";
import { hasPersonaAccess } from "@/components/shared/PersonaAccessGate";
import { getAllowedUpiTabs } from "@/components/upi-settings/UpiSettingsScreen";

describe("persona product access", () => {
  it.each(["returning", "pluspay_only"] as const)(
    "enables PlusPay profile actions for %s",
    (id) => {
      const persona = getPersonaConfig(id);
      expect(canUseAutoPay(persona)).toBe(true);
      expect(canUseCollectRequests(persona)).toBe(true);
    },
  );

  it.each(["new_user", "ebPlus_only", "ebPlus_no_upi"] as const)(
    "removes PlusPay profile actions for %s",
    (id) => {
      const persona = getPersonaConfig(id);
      expect(canUseAutoPay(persona)).toBe(false);
      expect(canUseCollectRequests(persona)).toBe(false);
    },
  );

  it("blocks UPI and PlusPay routes for EB+ without UPI", () => {
    const persona = getPersonaConfig("ebPlus_no_upi");
    expect(hasPersonaAccess(persona, { requireUpi: true })).toBe(false);
    expect(hasPersonaAccess(persona, { requirePlusPay: true })).toBe(false);
    expect(hasPersonaAccess(persona, { requireEbPlus: true })).toBe(true);
  });

  it("exposes only product-owned UPI tabs", () => {
    expect(getAllowedUpiTabs(true, true)).toEqual(["benefits", "pluspay"]);
    expect(getAllowedUpiTabs(true, false)).toEqual(["benefits"]);
    expect(getAllowedUpiTabs(false, true)).toEqual(["pluspay"]);
  });
});
