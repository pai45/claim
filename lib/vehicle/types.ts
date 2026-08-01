/**
 * A registration number encodes state + RTO office only. Make and model are not
 * derivable from it — they live in the VAHAN register. Everything a provider
 * cannot know offline is optional here on purpose.
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

/** Vehicle attributes that only VAHAN (or the RC document) can supply. */
export type VehicleIdentity = {
  maker?: string;
  model?: string;
  /** Maker + model as a single display string, e.g. "Maruti Suzuki Alto 800" */
  makerModel?: string;
  fuel?: string;
  vehicleClass?: string;
  registrationDate?: string;
  chassisNumber?: string;
  engineNumber?: string;
  ownerName?: string;
  insuranceValidTo?: string;
  pucValidTo?: string;
};

export type VehicleLookup = {
  regNumber: ParsedRegNumber;
  location?: RtoLocation;
  identity?: VehicleIdentity;
  /** Which provider supplied `identity`. */
  source: VehicleSource;
  /** 0-1. Only meaningful for OCR-derived identities. */
  confidence?: number;
  /** Non-fatal note for the user, e.g. partial OCR read or a failed API call. */
  warning?: string;
};

export type VehicleSource = "offline" | "rc_ocr" | "manual" | "api";

/**
 * Implemented by anything that can resolve a plate to vehicle details.
 * Swapping in a VAHAN-backed API later means adding one file here — the chat
 * flow talks to `resolveVehicle`, not to any single provider.
 */
export type VehicleProvider = {
  id: VehicleSource;
  label: string;
  /** Whether this provider can return make/model at all. */
  providesIdentity: boolean;
  lookup(regNumber: ParsedRegNumber): Promise<VehicleLookup>;
};
