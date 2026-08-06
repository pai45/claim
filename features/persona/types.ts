export type PersonaId = "returning" | "new_user";

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
};

export type PersonaConfig = {
  id: PersonaId;
  label: string;
  badge: string;
  description: string;
  profile: PersonaProfile;
  hasClaims: boolean;
  hasTransactions: boolean;
  hasCompletedOnboarding: boolean;
  hasRegisteredVehicle: boolean;
  isCardActivated: boolean;
  hasUpiId: boolean;
};
