import type {
  ParsedRegNumber,
  VehicleIdentity,
  VehicleLookup,
  VehicleProvider,
} from "../types";

/**
 * Talks to our own proxy, never to a vendor directly. The app is a static
 * export, so any vendor key placed here would ship inside the JS bundle where
 * anyone can read it — and these keys are metered and billed per call. The
 * proxy holds the credential and normalises whichever vendor is configured, so
 * this file only ever knows one response shape.
 *
 * Contract:
 *   POST <endpoint>  { "regNumber": "MH01AB1234" }
 *   200 { "ok": true,  "vehicle": { maker, model, fuel, ... } }
 *   200 { "ok": false, "error": "not_found" | "upstream_error" | ..., "message": "..." }
 */

const ENDPOINT = process.env.NEXT_PUBLIC_VEHICLE_API_URL;
const TIMEOUT_MS = 12_000;

export type VehicleApiResponse = {
  ok: boolean;
  vehicle?: VehicleIdentity & { rcStatus?: string };
  error?: string;
  message?: string;
};

export function isVehicleApiConfigured(): boolean {
  return Boolean(ENDPOINT);
}

export class VehicleApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "VehicleApiError";
  }
}

async function fetchIdentity(
  regNumber: string,
): Promise<VehicleIdentity & { rcStatus?: string }> {
  if (!ENDPOINT) {
    throw new VehicleApiError("Vehicle lookup is not configured.", "not_configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regNumber }),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    throw new VehicleApiError(
      aborted
        ? "The RTO lookup timed out."
        : "Couldn't reach the RTO lookup service.",
      aborted ? "timeout" : "network_error",
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    throw new VehicleApiError(
      "Too many lookups right now. Please try again shortly.",
      "rate_limited",
    );
  }

  if (!response.ok) {
    throw new VehicleApiError(
      "The RTO lookup service returned an error.",
      "upstream_error",
    );
  }

  let payload: VehicleApiResponse;
  try {
    payload = (await response.json()) as VehicleApiResponse;
  } catch {
    throw new VehicleApiError("Unreadable response from the lookup service.", "bad_response");
  }

  if (!payload.ok || !payload.vehicle) {
    throw new VehicleApiError(
      payload.message ?? "No record found for that vehicle number.",
      payload.error ?? "not_found",
    );
  }

  return payload.vehicle;
}

export const apiProvider: VehicleProvider = {
  id: "api",
  label: "VAHAN lookup",
  providesIdentity: true,

  async lookup(regNumber: ParsedRegNumber): Promise<VehicleLookup> {
    const identity = await fetchIdentity(regNumber.normalized);
    return { regNumber, identity, source: "api", confidence: 1 };
  },
};
