import type { PersonaConfig } from "./types";

export function resolveEffectivePersona(
  persona: PersonaConfig,
  ebPlusActivated: boolean,
): PersonaConfig {
  if (persona.id !== "pluspay_only" || !ebPlusActivated) return persona;

  return {
    ...persona,
    access: {
      ...persona.access,
      products: { ebPlus: true, plusPay: true },
      defaultProduct: "ebPlus",
    },
    // EB+ is a newly created account. Rohan's established PlusPay account,
    // including its history and UPI ID, remains unchanged.
    hasClaims: false,
    hasCompletedOnboarding: true,
    hasRegisteredVehicle: false,
    isCardActivated: true,
    hasBenefitsUpiId: false,
    hasPlusPayUpiId: persona.hasPlusPayUpiId,
  };
}
