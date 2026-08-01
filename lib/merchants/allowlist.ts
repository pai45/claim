import type { BenefitType } from "./types";

/** India-focused brand seeds for meal and fuel network matching. */
export const MERCHANT_ALLOWLIST: Record<BenefitType, string[]> = {
  meal: [
    "McDonald's",
    "Mcdonalds",
    "Domino's",
    "Dominos",
    "Subway",
    "Cafe Coffee Day",
    "CCD",
    "Starbucks",
    "Haldiram's",
    "Haldirams",
    "Pizza Hut",
    "KFC",
    "Burger King",
    "Wow Momo",
    "Barbeque Nation",
    "Biryani Blues",
    "Faasos",
    "Behrouz Biryani",
    "Chai Point",
    "Costa Coffee",
    "Dunkin",
    "Wendy's",
    "Taco Bell",
    "Sagar Ratna",
    "Bikanervala",
  ],
  fuel: [
    "Indian Oil",
    "IOCL",
    "HPCL",
    "Hindustan Petroleum",
    "BPCL",
    "Bharat Petroleum",
    "Reliance",
    "Reliance Petroleum",
    "Jio-bp",
    "Shell",
    "Nayara",
    "Essar",
    "HP Petrol",
    "IndianOil",
  ],
};

export function normalizeMerchantName(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchAllowlistBrand(
  name: string,
  benefitType: BenefitType,
): string | null {
  const normalized = normalizeMerchantName(name);
  if (!normalized) return null;

  for (const brand of MERCHANT_ALLOWLIST[benefitType]) {
    const brandNorm = normalizeMerchantName(brand);
    if (!brandNorm) continue;
    if (normalized.includes(brandNorm) || brandNorm.includes(normalized)) {
      return brand;
    }
  }

  return null;
}

export function findAllowlistMatches(
  query: string,
  benefitType: BenefitType,
): string[] {
  const normalized = normalizeMerchantName(query);
  if (!normalized) return [];

  const seen = new Set<string>();
  const matches: string[] = [];

  for (const brand of MERCHANT_ALLOWLIST[benefitType]) {
    const brandNorm = normalizeMerchantName(brand);
    if (!brandNorm) continue;
    if (brandNorm.includes(normalized) || normalized.includes(brandNorm)) {
      const key = brandNorm;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push(brand);
    }
  }

  return matches;
}
