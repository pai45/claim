import type { PersonaId } from "@/features/persona/types";
import { hasReturningAccountState } from "@/features/persona/constants";
import type { RegistrationStatus } from "./useRegistrationStatus";

export type RegistrationActionKind = "vehicle" | "driver";
export type RegistrationActionStatus = "pending" | "rejected";

export type RegistrationAction = {
  kind: RegistrationActionKind;
  status: RegistrationActionStatus;
};

export type HomeActionCardState = {
  showNotifications: boolean;
  registration: RegistrationAction | null;
};

export function getHomeActionCardState(
  personaId: PersonaId,
  notificationCount: number,
  registrationStatus: RegistrationStatus,
): HomeActionCardState {
  // The demo walks one card at a time: vehicle, then driver, then the vehicle
  // comes back rejected. Both flags only ever turn true by completing the
  // flows in this browser — no persona seeds them — so the rejection can never
  // greet someone who has not registered anything yet.
  const registration: RegistrationAction = !registrationStatus.isVehicleRegistered
    ? { kind: "vehicle", status: "pending" }
    : !registrationStatus.isDriverRegistered
      ? { kind: "driver", status: "pending" }
      : { kind: "vehicle", status: "rejected" };

  return {
    showNotifications:
      hasReturningAccountState(personaId) && notificationCount > 0,
    registration,
  };
}
