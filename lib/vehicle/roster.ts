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
 * Images are hotlinked from Wikimedia Commons. Every one is CC BY or CC BY-SA,
 * so `VehicleImageCredit` must stay rendered on the card — attribution is a
 * licence condition, not a nicety. Author and licence below were read from each
 * file's `extmetadata` on Commons.
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
    commonsFile: "Maruti Suzuki - Alto 800 LXi.JPG",
    imageAuthor: "Biswarup Ganguly",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "maruti-swift",
    maker: "Maruti Suzuki",
    model: "Swift",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Hatchback",
    commonsFile: "Maruti Suzuki Swift 4456.JPG",
    imageAuthor: "Premnath Kudva",
    imageLicense: "CC BY-SA 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  {
    id: "maruti-baleno",
    maker: "Maruti Suzuki",
    model: "Baleno",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Hatchback",
    commonsFile: "2022 Maruti Suzuki Baleno Alpha (India) front view.jpg",
    imageAuthor: "Milind Kwatra",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "maruti-dzire",
    maker: "Maruti Suzuki",
    model: "Dzire",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1197,
    fuel: "Petrol",
    bodyType: "Sedan",
    commonsFile: "Maruti Suzuki Dzire VXi VVT (front).JPG",
    imageAuthor: "Biswarup Ganguly",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "maruti-brezza",
    maker: "Maruti Suzuki",
    model: "Vitara Brezza",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1462,
    fuel: "Petrol",
    bodyType: "Compact SUV",
    commonsFile:
      "2022 Maruti Suzuki Vitara Brezza 1.5 ZXi+ (India) front view.png",
    imageAuthor: "DriveSpark",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "maruti-celerio",
    maker: "Maruti Suzuki",
    model: "Celerio",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 998,
    fuel: "Petrol",
    bodyType: "Hatchback",
    commonsFile:
      "Maruti Suzuki - Celerio VXi - WB 06 P 2535 - Kolkata 20170915133436.jpg",
    imageAuthor: "Biswarup Ganguly",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "hyundai-creta",
    maker: "Hyundai",
    model: "Creta",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1497,
    fuel: "Petrol",
    bodyType: "SUV",
    commonsFile: "2025 Hyundai Creta N Line.jpg",
    imageAuthor: "Chanokchon",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "hyundai-venue",
    maker: "Hyundai",
    model: "Venue",
    engineType: "3-cylinder turbo petrol",
    engineCapacityCc: 998,
    fuel: "Petrol",
    bodyType: "Compact SUV",
    commonsFile: "Hyundai Venue (Front).png",
    imageAuthor: "carwale.com",
    imageLicense: "CC BY 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    id: "hyundai-verna",
    maker: "Hyundai",
    model: "Verna",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1497,
    fuel: "Petrol",
    bodyType: "Sedan",
    commonsFile: "Hyundai Verna 2019.jpg",
    imageAuthor: "Nitesh Gosalia",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "tata-nexon",
    maker: "Tata",
    model: "Nexon",
    engineType: "3-cylinder turbo petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Compact SUV",
    commonsFile: "2023 Tata Nexon XZA+ front view.jpg",
    imageAuthor: "Dairokkan9",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "tata-punch",
    maker: "Tata",
    model: "Punch",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Micro SUV",
    commonsFile: "2021 Tata Punch Creative (India) front view 01.png",
    imageAuthor: "Athira Murali",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  {
    id: "tata-tiago",
    maker: "Tata",
    model: "Tiago",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Hatchback",
    commonsFile: "2022 Tata Tiago XZA+ front 20230512.jpg",
    imageAuthor: "Dairokkan9",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "tata-altroz",
    maker: "Tata",
    model: "Altroz",
    engineType: "3-cylinder petrol",
    engineCapacityCc: 1199,
    fuel: "Petrol",
    bodyType: "Hatchback",
    commonsFile: "Tata Altroz front 20230617.jpg",
    imageAuthor: "Dairokkan9",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "tata-harrier",
    maker: "Tata",
    model: "Harrier",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 1956,
    fuel: "Diesel",
    bodyType: "SUV",
    commonsFile: "4th International Auto Show, Bangalore (2025) 110.jpg",
    imageAuthor: "Gpkp",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "mahindra-thar",
    maker: "Mahindra",
    model: "Thar",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2184,
    fuel: "Diesel",
    bodyType: "Off-roader",
    commonsFile: "Mahindra Thar 2.5 CRDe 2011.jpg",
    imageAuthor: "raul (cropped by uploader)",
    imageLicense: "CC BY-SA 2.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  {
    id: "mahindra-scorpio",
    maker: "Mahindra",
    model: "Scorpio",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2184,
    fuel: "Diesel",
    bodyType: "SUV",
    commonsFile: "2024 Mahindra Scorpio Z8L front.jpg",
    imageAuthor: "LuvsMG481",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "mahindra-xuv700",
    maker: "Mahindra",
    model: "XUV700",
    engineType: "4-cylinder turbo petrol",
    engineCapacityCc: 1997,
    fuel: "Petrol",
    bodyType: "SUV",
    commonsFile: "2023 Mahindra XUV700 AX7L front.jpg",
    imageAuthor: "LuvsMG481",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "mahindra-bolero",
    maker: "Mahindra",
    model: "Bolero",
    engineType: "3-cylinder diesel",
    engineCapacityCc: 1493,
    fuel: "Diesel",
    bodyType: "SUV",
    commonsFile: "Mahindra Bolero ZLX.jpg",
    imageAuthor: "RaNK001",
    imageLicense: "CC BY-SA 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  {
    id: "honda-city",
    maker: "Honda",
    model: "City",
    engineType: "4-cylinder petrol",
    engineCapacityCc: 1498,
    fuel: "Petrol",
    bodyType: "Sedan",
    commonsFile: "2022 Honda City ZX i-VTEC (India) front view.jpg",
    imageAuthor: "Dairokkan9",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "toyota-innova-crysta",
    maker: "Toyota",
    model: "Innova Crysta",
    engineType: "4-cylinder diesel",
    engineCapacityCc: 2393,
    fuel: "Diesel",
    bodyType: "MPV",
    commonsFile: "Toyota Innova Crysta 2.4 Z front right.jpg",
    imageAuthor: "Premnath Kudva",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
];

/** Derived, never stored — one source of truth for the two name parts. */
export function vehicleDisplayName(profile: VehicleProfile): string {
  return `${profile.maker} ${profile.model}`;
}

/**
 * Commons serves the file via a redirect, so the width is a request for a
 * thumbnail rather than a promise of one; very small originals come back at
 * their native size.
 */
export function vehicleImageUrl(profile: VehicleProfile, width = 640): string {
  const file = encodeURIComponent(profile.commonsFile.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;
}

/** The file's description page, which the licence requires us to credit back to. */
export function vehicleImagePageUrl(profile: VehicleProfile): string {
  const file = encodeURIComponent(profile.commonsFile.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/File:${file}`;
}
