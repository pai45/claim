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
    hasCompletedOnboarding: true,
    isCardActivated: true,
  };
}
