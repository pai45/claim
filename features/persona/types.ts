export type PersonaId =
  | "returning"
  | "rahul_onboarding"
  | "new_user"
  | "ebPlus_only"
  | "pluspay_only"
  | "ebPlus_no_upi";

export type ProductMode = "ebPlus" | "pluspay";

export type PersonaAccess = {
  products: {
    ebPlus: boolean;
    plusPay: boolean;
  };
  upiEnabled: boolean;
  defaultProduct: ProductMode;
};

export type PersonaProfile = {
  id: PersonaId;
  name: string;
  initials: string;
  email: string;
  memberSince: string;
  mobile: string;
  phone: string;
  employeeId: string;
  corporate: string;
  dateOfBirth?: string;
  dateOfBirthFormatted?: string;
};

export type PersonaConfig = {
  id: PersonaId;
  label: string;
  badge: string;
  description: string;
  profile: PersonaProfile;
  access: PersonaAccess;
  hasClaims: boolean;
  hasTransactions: boolean;
  hasCompletedOnboarding: boolean;
  hasRegisteredVehicle: boolean;
  isCardActivated: boolean;
  hasBenefitsUpiId: boolean;
  hasPlusPayUpiId: boolean;
};

export type EmployeeBenefitsPersonaPayload = {
  id: PersonaId;
  name: string;
  initials: string;
  access: PersonaAccess;
  hasTransactions: boolean;
  hasBenefitsUpiId: boolean;
  hasPlusPayUpiId: boolean;
};
