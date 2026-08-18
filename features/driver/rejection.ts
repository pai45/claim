/**
 * The demo's rejected driver registration.
 *
 * It is the second beat of the walk the vehicle rejection opens: register the
 * vehicle, register the driver, the vehicle comes back rejected, and once it is
 * resubmitted the driver comes back rejected in turn. Nothing persists it — the
 * vehicle's submission count says which beat we are on and the two
 * `registeredAt` stamps say who moved last — so a resubmission clears the
 * rejection for free: `saveRegisteredDriver` rewrites `registeredAt`, pushing
 * the driver past the vehicle.
 */

export const DRIVER_REJECTION_REASON =
  "The licence number doesn't match the RTO records for this driver.";

export function isDriverRegistrationRejected(
  vehicle: { registeredAt: number; submissions: number } | null,
  driver: { registeredAt: number } | null,
): boolean {
  if (!vehicle || !driver) return false;
  // Nothing to reject until the vehicle has been resubmitted, and the rejection
  // lifts as soon as the driver is resubmitted in turn.
  if (vehicle.submissions < 2) return false;
  return driver.registeredAt < vehicle.registeredAt;
}
