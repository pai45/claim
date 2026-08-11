import { isEbPlusActivationComplete } from "@/features/onboarding/ebPlusActivation";
import type { PersonaId } from "./types";

/**
 * Rohan keeps his established PlusPay account, but the EB+ account created by
 * the activation journey starts with Aarav's fresh balances and top-ups.
 */
export function getBenefitsStatePersonaId(
  personaId: PersonaId,
  ebPlusActivated =
    personaId === "pluspay_only" && isEbPlusActivationComplete(),
): "returning" | "new_user" {
  if (personaId === "new_user") return "new_user";
  if (personaId === "pluspay_only" && ebPlusActivated) return "new_user";
  return "returning";
}
