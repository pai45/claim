import { withBasePath } from "@/lib/basePath";
import { VEHICLE_BODY_TYPE_ASSETS } from "@/lib/ui/assets";
import type { VehicleProfile } from "./types";

/**
 * The demo vehicle roster.
 *
 * A registration number carries no make or model, so this flow maps a plate
 * onto one of these by hash instead of looking anything up. Specs are real for
 * the model; the mapping to any given plate is not.
 *
 * CHANGING THE LENGTH REMAPS EVERY PLATE. `demoLookup` indexes with
 * `hash % VEHICLE_ROSTER.length`, so adding or removing an entry silently
 * changes which vehicle an existing number resolves to. Bookmarked demo plates
 * and screenshots will stop matching.
 *
 * Vehicle artwork is bundled by body type so the demo is deterministic and
 * does not depend on a remote image host.
 */
export const VEHICLE_ROSTER: readonly VehicleProfile[] = [
  {
    id: "maruti-alto-800",
    maker: "Maruti Suzuki",
    model: "Alto 800",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 796,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "maruti-swift",
    maker: "Maruti Suzuki",
    model: "Swift",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "maruti-baleno",
    maker: "Maruti Suzuki",
    model: "Baleno",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "maruti-dzire",
    maker: "Maruti Suzuki",
    model: "Dzire",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Sedan",
  },
  {
    id: "maruti-brezza",
    maker: "Maruti Suzuki",
    model: "Vitara Brezza",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1462,
    fuel: "Petrol",
    bodyType: "Compact SUV",
  },
  {
    id: "maruti-celerio",
    maker: "Maruti Suzuki",
    model: "Celerio",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 998,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "hyundai-creta",
    maker: "Hyundai",
    model: "Creta",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1497,
    fuel: "Petrol",
    bodyType: "SUV",
  },
  {
    id: "hyundai-venue",
    maker: "Hyundai",
    model: "Venue",
    engineType: "3-cylinder turbo petrol",
    engineCapacityCc: 998,
    fuel: "Petrol",
    bodyType: "Compact SUV",
  },
  {
    id: "hyundai-verna",
    maker: "Hyundai",
    model: "Verna",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1497,
    fuel: "Petrol",
    bodyType: "Sedan",
  },
  {
    id: "tata-nexon",
    maker: "Tata",
    model: "Nexon",
    engineType: "3-cylinder turbo petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Compact SUV",
  },
  {
    id: "tata-punch",
    maker: "Tata",
    model: "Punch",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Micro SUV",
  },
  {
    id: "tata-tiago",
    maker: "Tata",
    model: "Tiago",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "tata-altroz",
    maker: "Tata",
    model: "Altroz",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Hatchback",
  },
  {
    id: "tata-harrier",
    maker: "Tata",
    model: "Harrier",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 1956,
    fuel: "Diesel",
    bodyType: "SUV",
  },
  {
    id: "mahindra-thar",
    maker: "Mahindra",
    model: "Thar",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2184,
    fuel: "Diesel",
    bodyType: "Off-roader",
  },
  {
    id: "mahindra-scorpio",
    maker: "Mahindra",
    model: "Scorpio",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2184,
    fuel: "Diesel",
    bodyType: "SUV",
  },
  {
    id: "mahindra-xuv700",
    maker: "Mahindra",
    model: "XUV700",
    engineType: "4-cylinder turbo petrol",
    engineCapacityCc: 1997,
    fuel: "Petrol",
    bodyType: "SUV",
  },
  {
    id: "mahindra-bolero",
    maker: "Mahindra",
    model: "Bolero",
    engineType: "3-cylinder diesel",
    engineCapacityCc: 1493,
    fuel: "Diesel",
    bodyType: "SUV",
  },
  {
    id: "honda-city",
    maker: "Honda",
    model: "City",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1498,
    fuel: "Petrol",
    bodyType: "Sedan",
  },
  {
    id: "toyota-innova-crysta",
    maker: "Toyota",
    model: "Innova Crysta",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2393,
    fuel: "Diesel",
    bodyType: "MPV",
  },
];

/** Derived, never stored — one source of truth for the two name parts. */
export function vehicleDisplayName(profile: VehicleProfile): string {
  return `${profile.maker} ${profile.model}`;
}

/** Resolve the bundled artwork for a vehicle's configured body type. */
export function vehicleImageUrl(profile: VehicleProfile): string {
  return withBasePath(VEHICLE_BODY_TYPE_ASSETS[profile.bodyType]);
}
