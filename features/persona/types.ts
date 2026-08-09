export type PersonaId =
  | "returning"
  | "new_user"
  | "lens_only"
  | "pluspay_only"
  | "lens_no_upi";

export type ProductMode = "lens" | "pluspay";

export type PersonaAccess = {
  products: {
    lens: boolean;
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
  hasUpiId: boolean;
};

export type EmployeeBenefitsPersonaPayload = {
  id: PersonaId;
  name: string;
  initials: string;
  access: PersonaAccess;
  hasTransactions: boolean;
  hasUpiId: boolean;
};
