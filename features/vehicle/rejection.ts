/**
 * The demo's rejected vehicle registration.
 *
 * Nothing persists a rejection. The demo walks one card at a time — register the
 * vehicle, then the driver, and the vehicle comes back rejected — so the ordering
 * of the two `registeredAt` stamps already carries the state, and reusing them
 * means a resubmission clears the rejection for free: `saveRegisteredVehicle`
 * rewrites `registeredAt`, pushing the vehicle past the driver.
 */

export const VEHICLE_REJECTION_REASON =
  "The owner name on the RC doesn't match your profile name.";

/** The surname on the mismatched RC. Any fixed value works — it only has to differ. */
const REJECTED_OWNER_SURNAME = "Kumar";

export function isVehicleRegistrationRejected(
  vehicle: { registeredAt: number; submissions: number } | null,
  driver: { registeredAt: number } | null,
): boolean {
  if (!vehicle || !driver) return false;
  // Only the first submission comes back rejected. After the resubmission it is
  // the driver's turn (see features/driver/rejection.ts), and resubmitting the
  // driver must not bounce the vehicle a second time.
  if (vehicle.submissions > 1) return false;
  return vehicle.registeredAt < driver.registeredAt;
}

/**
 * The owner name the RC came back with, e.g. "Vishal Sharma" -> "V. S. Kumar".
 *
 * RC books routinely carry initials plus a family surname, so deriving the
 * mismatch this way reads like a real registration certificate rather than a
 * typo — and it works for every persona without a lookup table.
 */
export function rejectedOwnerName(profileName: string): string {
  const initials = profileName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(" ");

  return initials
    ? `${initials} ${REJECTED_OWNER_SURNAME}`
    : REJECTED_OWNER_SURNAME;
}
