"use client";

import { useState } from "react";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { VehicleDetailRow } from "@/components/vehicle/VehicleDetailRow";
import { VehiclePhoto } from "@/components/vehicle/VehiclePhoto";
import type { VehicleLookupPayload } from "@/features/chat/types";
import { vehicleOwnershipLabel } from "@/lib/vehicle/ownership";
import { vehicleDisplayName } from "@/lib/vehicle/roster";
import type { VehicleLookup, VehicleOwnership } from "@/lib/vehicle/types";
import { RegistrationDeclaration } from "./RegistrationDeclaration";
import { VehicleOwnershipCard } from "./VehicleOwnershipCard";

type VehicleDetailsCardProps = {
  messageId: string;
  payload: VehicleLookupPayload;
  onSubmitToHr?: (
    messageId: string,
    lookup: VehicleLookup,
    ownership: VehicleOwnership,
  ) => void;
  onSelectOwnership?: (ownership: VehicleOwnership) => void;
  disabled?: boolean;
  showAvatar?: boolean;
};

export function VehicleDetailsCard({
  messageId,
  payload,
  onSubmitToHr,
  onSelectOwnership,
  disabled,
  showAvatar = true,
}: VehicleDetailsCardProps) {
  const [declarationAccepted, setDeclarationAccepted] = useState(
    Boolean(payload.submitted),
  );

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
  const isReviewStep =
    payload.stage === "review" ||
    (payload.stage === undefined && Boolean(payload.ownership));

  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      {showAvatar && !isReviewStep ? <ChatAvatar className="ml-0.5" /> : null}

      <article className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card shadow-soft">
        <div className="flex flex-col gap-0.5">
          <h3 className="type-section-title text-pine">
            {isReviewStep ? "Review vehicle details" : "Vehicle Found"}
          </h3>
          <p className="type-body-secondary">
            {isReviewStep
              ? "Confirm details before submitting"
              : "Is this vehicle self owned or company leased?"}
          </p>
        </div>

        {isReviewStep ? <VehiclePhoto profile={profile} /> : null}

        <div className="flex flex-col gap-0.5">
          <p className="text-body font-bold text-pine">{name}</p>
          <p className="type-body-secondary tracking-wide">
            {lookup.regNumber.formatted}
          </p>
        </div>

        <div className="divide-y divide-border-soft rounded-control border border-border-soft px-3 py-1">
          {isReviewStep ? (
            <VehicleDetailRow
              label="Ownership"
              value={
                payload.ownership
                  ? vehicleOwnershipLabel(payload.ownership)
                  : undefined
              }
            />
          ) : null}
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
          <VehicleDetailRow label="Chassis" value={lookup.chassisNumber} />
          <VehicleDetailRow label="Engine no." value={lookup.engineNumber} />
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

        {isReviewStep ? (
          <RegistrationDeclaration
            subject="vehicle"
            checked={declarationAccepted}
            onChange={setDeclarationAccepted}
            disabled={disabled || payload.submitted}
          />
        ) : null}
      </article>

      {!isReviewStep ? (
        <VehicleOwnershipCard
          onSelect={(ownership) => onSelectOwnership?.(ownership)}
          disabled={disabled || payload.ownershipSelected}
        />
      ) : null}

      {isReviewStep ? (
        <button
          type="button"
          disabled={disabled || payload.submitted || !declarationAccepted}
          onClick={() => {
            if (payload.ownership) {
              onSubmitToHr?.(messageId, lookup, payload.ownership);
            }
          }}
          className="min-h-11 rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          {payload.submitted ? "Submitted to Admin" : "Submit to Admin"}
        </button>
      ) : null}
    </div>
  );
}
