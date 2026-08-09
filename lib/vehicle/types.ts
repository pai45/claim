/**
 * A registration number encodes state + RTO office only — make and model are
 * not derivable from it. The state and RTO here are genuinely decoded from the
 * plate; everything on `VehicleProfile` is demo data from the bundled roster.
 */

export type RegNumberFormat = "standard" | "bharat" | "defence" | "diplomatic";

export type ParsedRegNumber = {
  /** Canonical, punctuation-free form, e.g. "MH01AB1234" */
  normalized: string;
  /** Grouped for display, e.g. "MH 01 AB 1234" */
  formatted: string;
  format: RegNumberFormat;
  /** Two-letter state code, e.g. "MH". Absent on BH-series and defence plates. */
  stateCode?: string;
  /** RTO office digits as written, e.g. "01" */
  rtoCode?: string;
  /** Series letters, e.g. "AB". Carries no meaning beyond allocation order. */
  series?: string;
  /** Trailing serial, e.g. "1234" */
  serial?: string;
  /** Registration year for BH-series plates, e.g. "22" -> 2022 */
  bharatYear?: number;
};

export type RegNumberError =
  | "empty"
  | "too_short"
  | "too_long"
  | "unknown_state"
  | "unrecognized_format";

export type RegNumberParseResult =
  | { ok: true; value: ParsedRegNumber }
  | { ok: false; error: RegNumberError; message: string };

export type RtoLocation = {
  stateCode: string;
  stateName: string;
  /** Undefined when the office code isn't in the bundled dataset. */
  office?: string;
  /** True when `office` came from the dataset rather than a fallback label. */
  officeKnown: boolean;
};

export type FuelType = "Petrol" | "Diesel" | "CNG" | "Electric" | "Hybrid";

export type VehicleOwnership = "self_owned" | "company_leased";

/**
 * One of the demo vehicles in `roster.ts`. None of this comes from VAHAN — a
 * plate is mapped onto a roster entry by hash, not looked up.
 */
export type VehicleProfile = {
  /** Stable slug, e.g. "maruti-alto-800". React key and hash audit trail. */
  id: string;
  maker: string;
  model: string;
  /** Engine description, deliberately not the fuel: "3-cylinder petrol". */
  engineType: string;
  /** Absent for EVs, which have no displacement. */
  engineCapacityCc?: number;
  fuel: FuelType;
  bodyType: string;
  /** Wikimedia Commons filename with no "File:" prefix; the URL is derived. */
  commonsFile: string;
  /** Every roster image is CC BY or CC BY-SA, so these must be rendered. */
  imageAuthor: string;
  imageLicense: string;
  imageLicenseUrl: string;
};

export type VehicleLookup = {
  regNumber: ParsedRegNumber;
  location?: RtoLocation;
  profile: VehicleProfile;
  ownerName: string;
  /** Pre-formatted and locale-independent, e.g. "14 Mar 2021". */
  registrationDate: string;
  /**
   * 17-character VIN-style chassis number, derived from the plate. Demo data,
   * not a real VIN — there is deliberately no ISO 3779 check digit.
   */
  chassisNumber: string;
  /** Manufacturer-style engine serial, e.g. "K1245678901". Demo data. */
  engineNumber: string;
};
