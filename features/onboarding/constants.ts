import type { PersonaId } from "@/features/persona/types";
import type {
  AddressForm,
  CardEmbossmentForm,
  IdentityForm,
  OnboardingState,
} from "./types";

export const ONBOARDING_STORAGE_KEY = "eb-claims:onboarding";
/**
 * Bumped to 3 when card ordering gained the name-embossment step. State saved
 * partway through the former address-only flow is intentionally reset so it
 * cannot skip the new required cardholder-name details.
 */
export const ONBOARDING_STORAGE_VERSION = 3 as const;
export const ONBOARDING_SESSION_EVENT = "eb-claims:onboarding-changed";

export const DEMO_EMAIL = "vishal.sharma@infosys.com";
export const DEMO_KIT_NUMBER = "PKT20241234567";

/**
 * The shortest believable round trip out to the VKYC page and back. Below this,
 * a focus or visibility event so soon after the hand-off is the OS shuffling
 * windows, not the user returning from a finished demo.
 */
export const MIN_HANDOFF_AWAY_MS = 2500;

export const KYC_ADDRESS: AddressForm = {
  line1: "Apex Apartment",
  line2: "Nanjeevan Road",
  pinCode: "401305",
  sameAsKyc: false,
};

export const DEFAULT_CARD_EMBOSSMENT: CardEmbossmentForm = {
  firstName: "",
  lastName: "",
};

export const DEFAULT_IDENTITY: IdentityForm = {
  email: DEMO_EMAIL,
  emailVerified: false,
  title: "Mr.",
  firstName: "Vishal",
  middleName: "",
  lastName: "Sharma",
  dateOfBirth: "12/01/1992",
};

export const NEW_USER_IDENTITY: IdentityForm = {
  email: "aarav.patel@infosys.com",
  emailVerified: false,
  title: "Mr.",
  firstName: "Aarav",
  middleName: "",
  lastName: "Patel",
  dateOfBirth: "15/08/1995",
};

export const RAHUL_ONBOARDING_IDENTITY: IdentityForm = {
  email: "rahul.verma@infosys.com",
  emailVerified: false,
  title: "Mr.",
  firstName: "Rahul",
  middleName: "",
  lastName: "Verma",
  dateOfBirth: "15/03/1995",
};

const READY_PERSONA_IDENTITIES: Partial<Record<PersonaId, IdentityForm>> = {
  ebPlus_only: {
    email: "neha.kapoor@infosys.com",
    emailVerified: true,
    title: "Ms.",
    firstName: "Neha",
    middleName: "",
    lastName: "Kapoor",
    dateOfBirth: "10/09/1994",
  },
  pluspay_only: {
    email: "rohan.mehta@infosys.com",
    emailVerified: true,
    title: "Mr.",
    firstName: "Rohan",
    middleName: "",
    lastName: "Mehta",
    dateOfBirth: "22/11/1993",
  },
  ebPlus_no_upi: {
    email: "kavya.iyer@infosys.com",
    emailVerified: true,
    title: "Ms.",
    firstName: "Kavya",
    middleName: "",
    lastName: "Iyer",
    dateOfBirth: "05/06/1996",
  },
};

export function getIdentityForPersona(personaId: PersonaId = "returning"): IdentityForm {
  if (personaId === "new_user") return { ...NEW_USER_IDENTITY };
  if (personaId === "rahul_onboarding") return { ...RAHUL_ONBOARDING_IDENTITY };
  return { ...(READY_PERSONA_IDENTITIES[personaId] ?? DEFAULT_IDENTITY) };
}

export function createInitialOnboardingState(personaId: PersonaId = "returning"): OnboardingState {
  const identity = getIdentityForPersona(personaId);
  return {
    version: ONBOARDING_STORAGE_VERSION,
    step: "intro",
    completed: false,
    identityDone: false,
    kycStatus: "idle",
    cardSetupDone: false,
    identity,
    address: {
      line1: "",
      line2: "",
      pinCode: "",
      sameAsKyc: false,
    },
    cardEmbossment: { ...DEFAULT_CARD_EMBOSSMENT },
    kitNumber: "",
    onlineTransactions: false,
    tapToPay: false,
  };
}

export function createCompletedOnboardingState(personaId: PersonaId = "returning"): OnboardingState {
  const identity = getIdentityForPersona(personaId);
  return {
    version: ONBOARDING_STORAGE_VERSION,
    step: "hub",
    completed: true,
    identityDone: true,
    kycStatus: "completed",
    cardSetupDone: true,
    identity: {
      ...identity,
      emailVerified: true,
    },
    address: {
      line1: "Apex Apartment",
      line2: "Nanjeevan Road",
      pinCode: "401305",
      sameAsKyc: true,
    },
    cardEmbossment: {
      firstName: identity.firstName,
      lastName: identity.lastName,
    },
    kitNumber: DEMO_KIT_NUMBER,
    onlineTransactions: true,
    tapToPay: true,
  };
}

export const FEATURE_WALLETS = [
  {
    id: "meal",
    title: "Meal Wallet",
    description: "Daily dining and food expenses.",
    bg: "linear-gradient(180deg, #FFF2DA, #FFE7BF)",
    ink: "#AA5A08",
  },
  {
    id: "fuel",
    title: "Fuel Wallet",
    description: "Fuel up for your daily commute.",
    bg: "linear-gradient(180deg, #E5F4FF, #CFEAFF)",
    ink: "#1163A6",
  },
  {
    id: "reimbursement",
    title: "Reimbursement Wallet",
    description: "Flexible spending for eligible expenses.",
    bg: "linear-gradient(180deg, #ECECFF, #DDDAFE)",
    ink: "#5D50C6",
  },
  {
    id: "mobile",
    title: "Mobile & Internet",
    description: "Postpaid mobile and broadband expenses.",
    bg: "linear-gradient(180deg, #E3F7EA, #CAEFD9)",
    ink: "#1C8D59",
  },
] as const;

export const HUB_STEPS = [
  {
    id: "identity" as const,
    title: "Identity Verification",
    description:
      "Confirm your identity details as provided by your employer to continue.",
  },
  {
    id: "kyc" as const,
    title: "KYC Verification",
    description: "Let's verify your KYC to continue.",
  },
  {
    id: "card" as const,
    title: "Card Setup",
    description: "Get your benefits card in a few steps.",
  },
] as const;
