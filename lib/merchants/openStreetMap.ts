import {
  findAllowlistMatches,
  matchAllowlistBrand,
  normalizeMerchantName,
} from "./allowlist";
import {
  allowlistOnlyResult,
  enrichMerchantEligibility,
} from "./eligibility";
import type { BenefitType, MerchantResult } from "./types";

const NOMINATIM_URL =
  process.env.NEXT_PUBLIC_OSM_NOMINATIM_URL?.trim() ||
  "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL =
  process.env.NEXT_PUBLIC_OSM_OVERPASS_URL?.trim() ||
  "https://overpass-api.de/api/interpreter";

const MEAL_AMENITIES = ["restaurant", "cafe", "fast_food", "food_court", "bakery"];
const FUEL_AMENITIES = ["fuel"];

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  display_name?: string;
  name?: string;
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
  address?: {
    amenity?: string;
    shop?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    brand?: string;
    amenity?: string;
    "addr:full"?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
  };
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

function osmHeaders(): HeadersInit {
  return {
    Accept: "application/json",
  };
}

function amenitiesFor(benefitType: BenefitType): string[] {
  return benefitType === "meal" ? MEAL_AMENITIES : FUEL_AMENITIES;
}

function placeTypesFromAmenity(amenity?: string): string[] {
  if (!amenity) return [];
  if (amenity === "fuel") return ["gas_station", "fuel"];
  if (amenity === "fast_food") return ["restaurant", "fast_food_restaurant"];
  if (amenity === "food_court") return ["restaurant", "food"];
  return [amenity];
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function isRelevantNominatimHit(
  hit: NominatimResult,
  benefitType: BenefitType,
): boolean {
  const amenity = hit.type || "";
  const className = hit.class || "";
  const allowed = amenitiesFor(benefitType);

  if (className === "amenity" && allowed.includes(amenity)) return true;

  // Keep brand/name matches that Nominatim returns as other classes in India.
  if (benefitType === "fuel") {
    return (
      amenity === "fuel" ||
      /fuel|petrol|gas|pump/i.test(hit.display_name || "") ||
      /fuel|petrol|gas|pump/i.test(hit.name || "")
    );
  }

  return (
    allowed.includes(amenity) ||
    /restaurant|cafe|coffee|food|bakery|pizza|kitchen/i.test(
      hit.display_name || "",
    ) ||
    /restaurant|cafe|coffee|food|bakery|pizza|kitchen/i.test(hit.name || "")
  );
}

function formatNominatimAddress(hit: NominatimResult): string {
  if (hit.display_name?.trim()) return hit.display_name.trim();
  const parts = [
    hit.address?.amenity,
    hit.address?.road,
    hit.address?.suburb,
    hit.address?.city || hit.address?.town,
    hit.address?.state,
    hit.address?.postcode,
  ].filter(Boolean);
  return parts.join(", ") || "Address unavailable";
}

function mapNominatimHit(
  hit: NominatimResult,
  benefitType: BenefitType,
): MerchantResult | null {
  const name =
    hit.name?.trim() ||
    hit.address?.amenity?.trim() ||
    hit.display_name?.split(",")[0]?.trim();
  if (!name) return null;

  const lat = hit.lat ? Number(hit.lat) : undefined;
  const lng = hit.lon ? Number(hit.lon) : undefined;
  const amenity = hit.class === "amenity" ? hit.type : hit.type;

  return enrichMerchantEligibility(
    {
      id:
        hit.osm_id != null
          ? `osm-${hit.osm_type || "node"}-${hit.osm_id}`
          : `nominatim-${hit.place_id ?? normalizeId(name)}`,
      name,
      address: formatNominatimAddress(hit),
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      placeTypes: placeTypesFromAmenity(amenity),
    },
    benefitType,
  );
}

function formatOverpassAddress(element: OverpassElement): string {
  const tags = element.tags;
  if (!tags) return "Address unavailable";
  if (tags["addr:full"]?.trim()) return tags["addr:full"].trim();

  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  const parts = [street, tags["addr:city"]].filter(Boolean);
  return parts.join(", ") || "Address unavailable";
}

function mapOverpassElement(
  element: OverpassElement,
  benefitType: BenefitType,
  origin: { lat: number; lng: number },
): MerchantResult | null {
  const name = element.tags?.name?.trim() || element.tags?.brand?.trim();
  if (!name) return null;

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  return enrichMerchantEligibility(
    {
      id: `osm-${element.type}-${element.id}`,
      name,
      address: formatOverpassAddress(element),
      lat,
      lng,
      distanceMeters: Math.round(
        haversineMeters(origin.lat, origin.lng, lat, lng),
      ),
      placeTypes: placeTypesFromAmenity(element.tags?.amenity),
    },
    benefitType,
  );
}

async function searchNominatim(
  benefitType: BenefitType,
  query: string,
): Promise<MerchantResult[]> {
  const categoryHint =
    benefitType === "meal" ? "restaurant" : "fuel petrol pump";
  const params = new URLSearchParams({
    q: `${query} ${categoryHint} India`,
    format: "jsonv2",
    addressdetails: "1",
    limit: "12",
    countrycodes: "in",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: osmHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap Nominatim failed (${response.status})`);
  }

  const data = (await response.json()) as NominatimResult[];
  const hits = Array.isArray(data) ? data : [];

  return hits
    .filter((hit) => isRelevantNominatimHit(hit, benefitType))
    .map((hit) => mapNominatimHit(hit, benefitType))
    .filter((item): item is MerchantResult => Boolean(item));
}

async function searchOverpassNearby(
  benefitType: BenefitType,
  lat: number,
  lng: number,
): Promise<MerchantResult[]> {
  const amenities = amenitiesFor(benefitType);
  const radiusMeters = 5000;
  const filters = amenities
    .flatMap((amenity) => [
      `node["amenity"="${amenity}"](around:${radiusMeters},${lat},${lng});`,
      `way["amenity"="${amenity}"](around:${radiusMeters},${lat},${lng});`,
    ])
    .join("\n");

  const query = `
[out:json][timeout:25];
(
${filters}
);
out center 30;
`.trim();

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      ...osmHeaders(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap Overpass failed (${response.status})`);
  }

  const data = (await response.json()) as OverpassResponse;
  const elements = data.elements ?? [];

  return elements
    .map((element) => mapOverpassElement(element, benefitType, { lat, lng }))
    .filter((item): item is MerchantResult => Boolean(item))
    .sort(
      (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
    )
    .slice(0, 3);
}

export async function searchMerchantsByName(
  benefitType: BenefitType,
  query: string,
): Promise<MerchantResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let fromOsm: MerchantResult[] = [];
  try {
    fromOsm = await searchNominatim(benefitType, trimmed);
  } catch (error) {
    const allowlistHits = findAllowlistMatches(trimmed, benefitType);
    if (allowlistHits.length > 0) {
      return allowlistHits.map((brand) =>
        allowlistOnlyResult(brand, benefitType),
      );
    }
    throw error;
  }

  const allowlistHits = findAllowlistMatches(trimmed, benefitType);
  const allowlistOnly = allowlistHits
    .filter((brand) => {
      const brandNorm = normalizeMerchantName(brand);
      return !fromOsm.some((place) => {
        const matched = matchAllowlistBrand(place.name, benefitType);
        return (
          matched !== null && normalizeMerchantName(matched) === brandNorm
        );
      });
    })
    .map((brand) => allowlistOnlyResult(brand, benefitType));

  return [...fromOsm, ...allowlistOnly].slice(0, 8);
}

export async function searchMerchantsNearby(
  benefitType: BenefitType,
  lat: number,
  lng: number,
): Promise<MerchantResult[]> {
  return searchOverpassNearby(benefitType, lat, lng);
}
