export type BenefitType = "meal" | "fuel";

export type MerchantResult = {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  distanceMeters?: number;
  placeTypes: string[];
  allowed: boolean;
  networkPartner: boolean;
};

export type MerchantsApiResponse = {
  results: MerchantResult[];
  error?: string;
};
