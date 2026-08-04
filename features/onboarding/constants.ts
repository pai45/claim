import type { AddressForm, IdentityForm, OnboardingState } from "./types";

export const ONBOARDING_STORAGE_KEY = "eb-claims:onboarding";
export const ONBOARDING_STORAGE_VERSION = 1 as const;
export const ONBOARDING_SESSION_EVENT = "eb-claims:onboarding-changed";

export const DEMO_EMAIL = "alex.morgan@infosys.com";
export const DEMO_KIT_NUMBER = "PKT20241234567";
export const KYC_AUTO_COMPLETE_MS = 2500;

export const KYC_ADDRESS: AddressForm = {
  line1: "Apex Apartment",
  line2: "Nanjeevan Road",
  pinCode: "401305",
  sameAsKyc: false,
};

export const DEFAULT_IDENTITY: IdentityForm = {
  email: DEMO_EMAIL,
  emailVerified: false,
  title: "Mr.",
  firstName: "Alex",
  middleName: "Justin",
  lastName: "Morgan",
  dateOfBirth: "",
};

export function createInitialOnboardingState(): OnboardingState {
  return {
    version: ONBOARDING_STORAGE_VERSION,
    step: "intro",
    completed: false,
    identityDone: false,
    kycStatus: "idle",
    cardSetupDone: false,
    identity: { ...DEFAULT_IDENTITY },
    address: {
      line1: "",
      line2: "",
      pinCode: "",
      sameAsKyc: false,
    },
    kitNumber: "",
    onlineTransactions: false,
    tapToPay: false,
  };
}

export const FEATURE_WALLETS = [
  {
    id: "meal",
    title: "Meal Wallet",
    description: "Daily dining and food expenses.",
    bg: "#FFF4DB",
    ink: "#8A5A00",
  },
  {
    id: "fuel",
    title: "Fuel Wallet",
    description: "Fuel up for your daily commute.",
    bg: "#E5F3FF",
    ink: "#0B5CAD",
  },
  {
    id: "reimbursement",
    title: "Reimbursement Wallet",
    description: "Flexible spending for eligible expenses.",
    bg: "#ECE9FF",
    ink: "#4B3FA8",
  },
  {
    id: "gift",
    title: "Gift Wallet",
    description: "Rewards, vouchers, and gifting.",
    bg: "#E8F8EE",
    ink: "#0F3F37",
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
