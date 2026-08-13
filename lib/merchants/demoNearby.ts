import type { MerchantResult } from "@/lib/merchants/types";

export const DEMO_NEARBY_MEAL_SEARCH_DELAY_MS = 5_000;

/**
 * Deterministic Bengaluru results used while live GPS/nearby-map lookup is
 * disabled for the product demo.
 */
export const DEMO_NEARBY_MEAL_MERCHANTS: MerchantResult[] = [
  {
    id: "demo-meal-starbucks-indiranagar",
    name: "Starbucks",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    distanceMeters: 320,
    placeTypes: ["cafe"],
    allowed: true,
    networkPartner: true,
  },
  {
    id: "demo-meal-cafe-coffee-day-indiranagar",
    name: "Cafe Coffee Day",
    address: "CMH Road, Indiranagar, Bengaluru",
    distanceMeters: 650,
    placeTypes: ["cafe"],
    allowed: true,
    networkPartner: true,
  },
  {
    id: "demo-meal-subway-domlur",
    name: "Subway",
    address: "Old Airport Road, Domlur, Bengaluru",
    distanceMeters: 1_100,
    placeTypes: ["restaurant", "fast_food_restaurant"],
    allowed: true,
    networkPartner: true,
  },
  {
    id: "demo-meal-dominos-hal",
    name: "Domino's Pizza",
    address: "12th Main Road, HAL 2nd Stage, Bengaluru",
    distanceMeters: 1_600,
    placeTypes: ["restaurant", "pizza_restaurant"],
    allowed: true,
    networkPartner: true,
  },
  {
    id: "demo-meal-haldirams-bengaluru",
    name: "Haldiram's",
    address: "Swami Vivekananda Road, Bengaluru",
    distanceMeters: 2_400,
    placeTypes: ["restaurant"],
    allowed: true,
    networkPartner: true,
  },
];
