import { matchAllowlistBrand } from "./allowlist";
import type { BenefitType, MerchantResult } from "./types";

const MEAL_PLACE_TYPES = new Set([
  "restaurant",
  "cafe",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
  "food",
  "food_court",
  "fast_food",
  "coffee_shop",
  "fast_food_restaurant",
  "hamburger_restaurant",
  "pizza_restaurant",
  "sandwich_shop",
  "ice_cream_shop",
  "indian_restaurant",
]);

const FUEL_PLACE_TYPES = new Set(["gas_station", "fuel"]);

export function placesTypesAllowed(
  placeTypes: string[],
  benefitType: BenefitType,
): boolean {
  const allowed =
    benefitType === "meal" ? MEAL_PLACE_TYPES : FUEL_PLACE_TYPES;
  return placeTypes.some((type) => allowed.has(type));
}

export function enrichMerchantEligibility(
  partial: Omit<MerchantResult, "allowed" | "networkPartner">,
  benefitType: BenefitType,
): MerchantResult {
  const networkPartner = Boolean(
    matchAllowlistBrand(partial.name, benefitType),
  );
  const allowed =
    networkPartner || placesTypesAllowed(partial.placeTypes, benefitType);

  return {
    ...partial,
    networkPartner,
    allowed,
  };
}

export function allowlistOnlyResult(
  brand: string,
  benefitType: BenefitType,
): MerchantResult {
  return enrichMerchantEligibility(
    {
      id: `allowlist-${benefitType}-${normalizeId(brand)}`,
      name: brand,
      address: "Network partner (location via OpenStreetMap when available)",
      placeTypes: benefitType === "meal" ? ["restaurant"] : ["gas_station"],
    },
    benefitType,
  );
}

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
