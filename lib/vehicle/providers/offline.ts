import { lookupRto } from "../rtoCodes";
import type { ParsedRegNumber, VehicleLookup, VehicleProvider } from "../types";

/**
 * Resolves everything the registration number itself encodes: state and RTO
 * office. It cannot return make or model — those exist only in the VAHAN
 * register — so `providesIdentity` is false and the flow moves on to the RC.
 */
export const offlineProvider: VehicleProvider = {
  id: "offline",
  label: "RTO code",
  providesIdentity: false,

  async lookup(regNumber: ParsedRegNumber): Promise<VehicleLookup> {
    return {
      regNumber,
      location: regNumber.stateCode
        ? lookupRto(regNumber.stateCode, regNumber.rtoCode)
        : undefined,
      source: "offline",
    };
  },
};
