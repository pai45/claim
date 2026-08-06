export type KycStatus =
  | "idle"
  /** Handed off to the Pine Labs VKYC page; waiting for the user to come back. */
  | "awaiting_return"
  | "in_progress"
  | "completed";

export type OnboardingStep =
  | "intro"
  | "hub"
  | "identity-email"
  | "identity-details"
  | "kyc-intro"
  | "kyc-completed"
  | "card-choice"
  | "card-address"
  | "card-embossment"
  | "card-kit"
  | "ready";

export type IdentityForm = {
  email: string;
  emailVerified: boolean;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
};

export type AddressForm = {
  line1: string;
  line2: string;
  pinCode: string;
  sameAsKyc: boolean;
};

export type CardEmbossmentForm = {
  firstName: string;
  lastName: string;
};

export type OnboardingState = {
  version: 3;
  step: OnboardingStep;
  completed: boolean;
  identityDone: boolean;
  kycStatus: KycStatus;
  cardSetupDone: boolean;
  identity: IdentityForm;
  address: AddressForm;
  cardEmbossment: CardEmbossmentForm;
  kitNumber: string;
  onlineTransactions: boolean;
  tapToPay: boolean;
};

export type OnboardingAction =
  | { type: "hydrate"; state: OnboardingState }
  | { type: "go"; step: OnboardingStep }
  | { type: "set-email"; value: string }
  | { type: "email-verified" }
  | { type: "set-identity-field"; field: keyof IdentityForm; value: string | boolean }
  | { type: "identity-complete" }
  | { type: "kyc-handoff-started" }
  | { type: "kyc-verifying" }
  | { type: "kyc-mark-in-progress" }
  | { type: "kyc-complete" }
  | { type: "set-address-field"; field: keyof AddressForm; value: string | boolean }
  | { type: "autofill-kyc-address" }
  | { type: "set-card-embossment-field"; field: keyof CardEmbossmentForm; value: string }
  | { type: "set-kit-number"; value: string }
  | { type: "card-setup-complete" }
  | { type: "set-online-tx"; value: boolean }
  | { type: "set-tap-to-pay"; value: boolean }
  | { type: "finish" };
