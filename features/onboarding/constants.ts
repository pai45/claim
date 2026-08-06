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
/** How long "Verifying your KYC" shows before the completed screen. */
export const KYC_AUTO_COMPLETE_MS = 2000;

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

export function getIdentityForPersona(personaId: PersonaId = "returning"): IdentityForm {
  return personaId === "new_user" ? { ...NEW_USER_IDENTITY } : { ...DEFAULT_IDENTITY };
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
    id: "gift",
    title: "Gift Wallet",
    description: "Rewards, vouchers, and gifting.",
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
