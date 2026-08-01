import type { ParsedRc } from "@/lib/ocr/parseRc";
import { makerModelDisplay } from "./makers";
import { apiProvider, isVehicleApiConfigured } from "./providers/api";
import { offlineProvider } from "./providers/offline";
import { parseRegNumber } from "./regNumber";
import type {
  ParsedRegNumber,
  RegNumberParseResult,
  VehicleIdentity,
  VehicleLookup,
} from "./types";

export type VehicleResolution =
  | { ok: true; lookup: VehicleLookup }
  | { ok: false; message: string };

/**
 * Resolve a vehicle from its number alone.
 *
 * The number encodes only state and RTO office — make and model live in the
 * VAHAN register, so identifying the vehicle requires the API. When it isn't
 * configured or the call fails, the offline decode still stands and the caller
 * falls back to asking for the RC rather than showing nothing.
 */
export async function resolveVehicle(input: string): Promise<VehicleResolution> {
  const parsed: RegNumberParseResult = parseRegNumber(input);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const base = await offlineProvider.lookup(parsed.value);

  if (!isVehicleApiConfigured()) {
    return { ok: true, lookup: base };
  }

  try {
    const identified = await apiProvider.lookup(parsed.value);
    return {
      ok: true,
      lookup: { ...base, ...identified, location: base.location },
    };
  } catch (err) {
    // A failed lookup must not sink the flow — keep the plate decode and let
    // the user reach the vehicle via the RC instead.
    return {
      ok: true,
      lookup: {
        ...base,
        warning:
          err instanceof Error
            ? `${err.message} You can scan your RC instead.`
            : "Couldn't reach the RTO lookup. You can scan your RC instead.",
      },
    };
  }
}

export { isVehicleApiConfigured };

/**
 * Step 2: fold RC-derived details onto the plate result. When the RC carries a
 * different registration number than the user typed, the caller is told rather
 * than silently overwritten — on a claim that mismatch matters.
 */
export function applyRcToLookup(
  lookup: VehicleLookup,
  rc: ParsedRc,
): VehicleLookup & { regMismatch?: string } {
  const identity: VehicleIdentity = {
    maker: rc.maker,
    model: rc.model,
    makerModel: rc.makerModel ?? makerModelDisplay(rc.maker, rc.model),
    fuel: rc.fuel,
    vehicleClass: rc.vehicleClass,
    registrationDate: rc.registrationDate,
    chassisNumber: rc.chassisNumber,
    engineNumber: rc.engineNumber,
    ownerName: rc.ownerName,
    insuranceValidTo: rc.insuranceValidTo,
    pucValidTo: rc.pucValidTo,
  };

  const mismatch =
    rc.regNumber && rc.regNumber !== lookup.regNumber.normalized
      ? `The RC reads ${rc.regNumber}, but you entered ${lookup.regNumber.normalized}. Check which one is correct before submitting.`
      : undefined;

  return {
    ...lookup,
    identity,
    source: "rc_ocr",
    confidence: rc.confidence,
    ...(mismatch ? { regMismatch: mismatch } : {}),
  };
}

/** Step 2 alternative: the user typed the vehicle in themselves. */
export function applyManualIdentity(
  lookup: VehicleLookup,
  maker: string,
  model: string,
  fuel?: string,
): VehicleLookup {
  return {
    ...lookup,
    identity: {
      maker: maker.trim() || undefined,
      model: model.trim() || undefined,
      makerModel: makerModelDisplay(maker.trim(), model.trim()),
      fuel,
    },
    source: "manual",
    confidence: 1,
  };
}

/** One-line summary for chat, e.g. "Maruti Suzuki Alto 800 · Petrol". */
export function describeVehicle(lookup: VehicleLookup): string {
  const parts = [
    lookup.identity?.makerModel,
    lookup.identity?.fuel,
    lookup.location
      ? [lookup.location.office, lookup.location.stateName]
          .filter(Boolean)
          .join(", ")
      : undefined,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function isIdentified(lookup: VehicleLookup): boolean {
  return Boolean(lookup.identity?.maker || lookup.identity?.model);
}

export type { ParsedRegNumber, VehicleLookup };
