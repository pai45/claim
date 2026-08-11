import type { PersonaId } from "@/features/persona/types";
import { hasReturningAccountState } from "@/features/persona/constants";
import type { RegistrationStatus } from "./useRegistrationStatus";

export type RegistrationActionKind = "vehicle" | "driver" | null;

export type HomeActionCardState = {
  showNotifications: boolean;
  registration: RegistrationActionKind;
};

export function getHomeActionCardState(
  personaId: PersonaId,
  notificationCount: number,
  registrationStatus: RegistrationStatus,
): HomeActionCardState {
  const registration = !registrationStatus.isVehicleRegistered
    ? "vehicle"
    : !registrationStatus.isDriverRegistered
      ? "driver"
      : null;

  return {
    showNotifications:
      hasReturningAccountState(personaId) && notificationCount > 0,
    registration,
  };
}
