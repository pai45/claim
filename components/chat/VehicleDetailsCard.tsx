"use client";

import { VehicleDetailRow } from "@/components/vehicle/VehicleDetailRow";
import { VehiclePhoto } from "@/components/vehicle/VehiclePhoto";
import type { VehicleLookupPayload } from "@/features/chat/types";
import { vehicleDisplayName } from "@/lib/vehicle/roster";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { RegistrationDeclaration } from "./RegistrationDeclaration";

type VehicleDetailsCardProps = {
  messageId: string;
  payload: VehicleLookupPayload;
  onSubmitToHr?: (messageId: string, lookup: VehicleLookup) => void;
  disabled?: boolean;
};

export function VehicleDetailsCard({
  messageId,
  payload,
  onSubmitToHr,
  disabled,
}: VehicleDetailsCardProps) {
  if (payload.error) {
    return (
      <div className="w-full max-w-card rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <p className="type-body">{payload.error}</p>
      </div>
    );
  }

  const { lookup } = payload;
  if (!lookup) return null;

  const { profile, location } = lookup;
  const name = vehicleDisplayName(profile);

  return (
    <div className="flex w-full max-w-card flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <VehiclePhoto profile={profile} />

        <div className="flex flex-col gap-0.5">
          <h3 className="text-body font-bold text-pine">{name}</h3>
          <p className="type-body-secondary tracking-wide">
            {lookup.regNumber.formatted}
          </p>
        </div>

        <div className="divide-y divide-border-soft rounded-control border border-border-soft px-3 py-1">
          <VehicleDetailRow label="Owner" value={lookup.ownerName} />
          <VehicleDetailRow label="Engine" value={profile.engineType} />
          <VehicleDetailRow
            label="Capacity"
            value={
              profile.engineCapacityCc
                ? `${profile.engineCapacityCc} cc`
                : undefined
            }
          />
          <VehicleDetailRow label="Fuel" value={profile.fuel} />
          <VehicleDetailRow label="Body" value={profile.bodyType} />
          <VehicleDetailRow label="Chassis" value={lookup.chassisNumber} />
          <VehicleDetailRow label="Engine no." value={lookup.engineNumber} />
          <VehicleDetailRow label="Registered" value={lookup.registrationDate} />
          <VehicleDetailRow
            label="RTO"
            value={
              location
                ? location.officeKnown
                  ? `${location.office}, ${location.stateName}`
                  : location.stateName
                : undefined
            }
          />
        </div>

        <RegistrationDeclaration subject="vehicle" />
      </div>

      <div className="flex flex-wrap content-start gap-2">
        <button
          type="button"
          disabled={disabled || payload.submitted}
          onClick={() => onSubmitToHr?.(messageId, lookup)}
          className="min-h-11 rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          {payload.submitted ? "Submitted to HR" : "Submit to HR"}
        </button>
      </div>
    </div>
  );
}
