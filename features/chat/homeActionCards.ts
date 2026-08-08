import type { PersonaId } from "@/features/persona/types";
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
    showNotifications: personaId === "returning" && notificationCount > 0,
    registration,
  };
}
