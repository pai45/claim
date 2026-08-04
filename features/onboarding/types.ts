export type KycStatus = "idle" | "in_progress" | "completed";

export type OnboardingStep =
  | "intro"
  | "hub"
  | "identity-email"
  | "identity-details"
  | "kyc-intro"
  | "kyc-consent"
  | "kyc-auth"
  | "kyc-completed"
  | "card-choice"
  | "card-address"
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

export type OnboardingState = {
  version: 1;
  step: OnboardingStep;
  completed: boolean;
  identityDone: boolean;
  kycStatus: KycStatus;
  cardSetupDone: boolean;
  identity: IdentityForm;
  address: AddressForm;
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
  | { type: "kyc-start" }
  | { type: "kyc-mark-in-progress" }
  | { type: "kyc-complete" }
  | { type: "set-address-field"; field: keyof AddressForm; value: string | boolean }
  | { type: "autofill-kyc-address" }
  | { type: "set-kit-number"; value: string }
  | { type: "card-setup-complete" }
  | { type: "set-online-tx"; value: boolean }
  | { type: "set-tap-to-pay"; value: boolean }
  | { type: "finish" };
