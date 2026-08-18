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
  // comes back rejected, and once it is resubmitted the driver comes back
  // rejected in turn. Every flag only ever turns true by completing the flows in
  // this browser — no persona seeds them — so a rejection can never greet
  // someone who has not registered anything yet. Each resubmission clears its
  // own rejection, and after the driver's the cards run out.
  const registration: RegistrationAction | null = !registrationStatus.isVehicleRegistered
    ? { kind: "vehicle", status: "pending" }
    : !registrationStatus.isDriverRegistered
      ? { kind: "driver", status: "pending" }
      : registrationStatus.isVehicleRejected
        ? { kind: "vehicle", status: "rejected" }
        : registrationStatus.isDriverRejected
          ? { kind: "driver", status: "rejected" }
          : null;

  return {
    showNotifications:
      hasReturningAccountState(personaId) && notificationCount > 0,
    registration,
  };
}
