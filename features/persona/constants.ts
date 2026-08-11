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
  access: {
    products: { ebPlus: true, plusPay: true },
    upiEnabled: true,
    defaultProduct: "ebPlus",
  },
  hasClaims: true,
  hasTransactions: true,
  hasCompletedOnboarding: true,
  hasRegisteredVehicle: false,
  isCardActivated: true,
  hasUpiId: true,
};

export const RAHUL_ONBOARDING_PERSONA: PersonaConfig = {
  ...RETURNING_PERSONA,
  id: "rahul_onboarding",
  label: "Fresh Onboarding",
  badge: "Setup Journey",
  description:
    "Rahul Verma • Vishal-style account with fresh MPIN and onboarding",
  profile: {
    ...RETURNING_PERSONA.profile,
    id: "rahul_onboarding",
    name: "Rahul Verma",
    initials: "R",
    email: "rahul.verma@infosys.com",
    employeeId: "EMP-20493",
  },
  hasCompletedOnboarding: false,
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
  access: {
    products: { ebPlus: true, plusPay: true },
    upiEnabled: true,
    defaultProduct: "ebPlus",
  },
  hasClaims: false,
  hasTransactions: false,
  hasCompletedOnboarding: false,
  hasRegisteredVehicle: false,
  isCardActivated: false,
  hasUpiId: false,
};

export const EBPLUS_ONLY_PERSONA: PersonaConfig = {
  id: "ebPlus_only",
  label: "EB+ Only",
  badge: "EB+ Plan",
  description: "Neha Kapoor • EB+ benefits with UPI, without PlusPay",
  profile: {
    id: "ebPlus_only",
    name: "Neha Kapoor",
    initials: "N",
    email: "neha.kapoor@infosys.com",
    memberSince: "EB+ member since April 2023",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    employeeId: "EMP-31587",
    corporate: "Infosys Technologies Ltd.",
    dateOfBirth: "10/09/1994",
    dateOfBirthFormatted: "10 September 1994",
  },
  access: {
    products: { ebPlus: true, plusPay: false },
    upiEnabled: true,
    defaultProduct: "ebPlus",
  },
  hasClaims: true,
  hasTransactions: true,
  hasCompletedOnboarding: true,
  hasRegisteredVehicle: false,
  isCardActivated: true,
  hasUpiId: true,
};

export const PLUSPAY_ONLY_PERSONA: PersonaConfig = {
  id: "pluspay_only",
  label: "PlusPay Only",
  badge: "PlusPay Plan",
  description: "Rohan Mehta • PlusPay payments without EB+ benefits",
  profile: {
    id: "pluspay_only",
    name: "Rohan Mehta",
    initials: "R",
    email: "rohan.mehta@infosys.com",
    memberSince: "PlusPay member since February 2024",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    employeeId: "EMP-62841",
    corporate: "Infosys Technologies Ltd.",
    dateOfBirth: "22/11/1993",
    dateOfBirthFormatted: "22 November 1993",
  },
  access: {
    products: { ebPlus: false, plusPay: true },
    upiEnabled: true,
    defaultProduct: "pluspay",
  },
  hasClaims: false,
  hasTransactions: true,
  hasCompletedOnboarding: true,
  hasRegisteredVehicle: false,
  isCardActivated: true,
  hasUpiId: true,
};

export const EBPLUS_NO_UPI_PERSONA: PersonaConfig = {
  id: "ebPlus_no_upi",
  label: "EB+ Without UPI",
  badge: "Card Only",
  description: "Kavya Iyer • EB+ card benefits without UPI or PlusPay",
  profile: {
    id: "ebPlus_no_upi",
    name: "Kavya Iyer",
    initials: "K",
    email: "kavya.iyer@infosys.com",
    memberSince: "EB+ member since September 2024",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    employeeId: "EMP-73624",
    corporate: "Infosys Technologies Ltd.",
    dateOfBirth: "05/06/1996",
    dateOfBirthFormatted: "5 June 1996",
  },
  access: {
    products: { ebPlus: true, plusPay: false },
    upiEnabled: false,
    defaultProduct: "ebPlus",
  },
  hasClaims: true,
  hasTransactions: true,
  hasCompletedOnboarding: true,
  hasRegisteredVehicle: false,
  isCardActivated: true,
  hasUpiId: false,
};

export const PERSONAS: Record<PersonaId, PersonaConfig> = {
  returning: RETURNING_PERSONA,
  rahul_onboarding: RAHUL_ONBOARDING_PERSONA,
  new_user: NEW_USER_PERSONA,
  ebPlus_only: EBPLUS_ONLY_PERSONA,
  pluspay_only: PLUSPAY_ONLY_PERSONA,
  ebPlus_no_upi: EBPLUS_NO_UPI_PERSONA,
};

export const PERSONA_OPTIONS: PersonaConfig[] = [
  RETURNING_PERSONA,
  RAHUL_ONBOARDING_PERSONA,
  NEW_USER_PERSONA,
  EBPLUS_ONLY_PERSONA,
  PLUSPAY_ONLY_PERSONA,
  EBPLUS_NO_UPI_PERSONA,
];

export function getPersonaConfig(id: PersonaId): PersonaConfig {
  return PERSONAS[id] ?? RETURNING_PERSONA;
}

export function isPersonaId(value: unknown): value is PersonaId {
  return (
    value === "returning" ||
    value === "rahul_onboarding" ||
    value === "new_user" ||
    value === "ebPlus_only" ||
    value === "pluspay_only" ||
    value === "ebPlus_no_upi"
  );
}

export function hasReturningAccountState(personaId: PersonaId): boolean {
  return personaId === "returning" || personaId === "rahul_onboarding";
}

export function canUseAutoPay(persona: PersonaConfig): boolean {
  return persona.access.products.plusPay;
}

export function canUseCollectRequests(persona: PersonaConfig): boolean {
  return persona.access.products.plusPay;
}
