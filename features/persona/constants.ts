import type { PersonaConfig, PersonaId } from "./types";

export const PERSONA_STORAGE_KEY = "eb-claims:active-persona";
export const PERSONA_CHANGED_EVENT = "eb-claims:persona-changed";

export const DEFAULT_PERSONA_ID: PersonaId = "returning";

export const RETURNING_PERSONA: PersonaConfig = {
  id: "returning",
  label: "Returning User",
  badge: "Active User",
  description: "Vishal Sharma • Onboarding done, active claims, transactions & used limits",
  profile: {
    id: "returning",
    name: "Vishal Sharma",
    initials: "V",
    email: "vishal.sharma@infosys.com",
    memberSince: "UPI Member since January 2022",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    employeeId: "EMP-10492",
    corporate: "Infosys Technologies Ltd.",
    dateOfBirth: "15/03/1995",
    dateOfBirthFormatted: "15 March 1995",
  },
  hasClaims: true,
  hasTransactions: true,
  hasCompletedOnboarding: true,
  hasRegisteredVehicle: false,
  isCardActivated: true,
  hasUpiId: true,
};

export const NEW_USER_PERSONA: PersonaConfig = {
  id: "new_user",
  label: "Brand New User",
  badge: "Fresh Start",
  description: "Aarav Patel • 0 claims, 0 txns, 100% full funds, no setup done",
  profile: {
    id: "new_user",
    name: "Aarav Patel",
    initials: "A",
    email: "aarav.patel@infosys.com",
    memberSince: "UPI Member since July 2026",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    employeeId: "EMP-84920",
    corporate: "Infosys Technologies Ltd.",
    dateOfBirth: "15/08/1995",
    dateOfBirthFormatted: "15 August 1995",
  },
  hasClaims: false,
  hasTransactions: false,
  hasCompletedOnboarding: false,
  hasRegisteredVehicle: false,
  isCardActivated: false,
  hasUpiId: false,
};

export const PERSONAS: Record<PersonaId, PersonaConfig> = {
  returning: RETURNING_PERSONA,
  new_user: NEW_USER_PERSONA,
};

export function getPersonaConfig(id: PersonaId): PersonaConfig {
  return PERSONAS[id] ?? RETURNING_PERSONA;
}

export function isPersonaId(value: unknown): value is PersonaId {
  return value === "returning" || value === "new_user";
}
