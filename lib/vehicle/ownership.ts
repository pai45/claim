import type { VehicleOwnership } from "./types";

export const VEHICLE_OWNERSHIP_OPTIONS: Array<{
  id: VehicleOwnership;
  label: string;
}> = [
  { id: "self_owned", label: "Self Owned" },
  { id: "company_leased", label: "Company Leased" },
];

export function vehicleOwnershipLabel(ownership: VehicleOwnership): string {
  return (
    VEHICLE_OWNERSHIP_OPTIONS.find((option) => option.id === ownership)?.label ??
    ownership
  );
}
