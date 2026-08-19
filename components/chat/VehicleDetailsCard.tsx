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

type VehicleDetailsCardProps = {
  messageId: string;
  payload: VehicleLookupPayload;
  onSubmitToHr?: (
    messageId: string,
    lookup: VehicleLookup,
    ownership: VehicleOwnership,
  ) => void;
  disabled?: boolean;
  showAvatar?: boolean;
};

export function VehicleDetailsCard({
  messageId,
  payload,
  onSubmitToHr,
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

  const { profile } = lookup;
  const name = vehicleDisplayName(profile);
  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      {showAvatar ? <ChatAvatar className="ml-0.5" /> : null}

      <article className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card shadow-soft">
        <div className="flex flex-col gap-0.5">
          <h3 className="type-section-title text-pine">
            Review vehicle details
          </h3>
          <p className="type-body-secondary">
            Confirm details before submitting
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <VehiclePhoto profile={profile} />
          <p className="text-caption text-ink-secondary">
            Vehicle image is for representation purposes only.
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-body font-bold text-pine">{name}</p>
          <p className="type-body-secondary tracking-wide">
            {lookup.regNumber.formatted}
          </p>
        </div>

        <div className="divide-y divide-border-soft rounded-control border border-border-soft px-3 py-1">
          <VehicleDetailRow
            label="Ownership"
            value={
              payload.ownership
                ? vehicleOwnershipLabel(payload.ownership)
                : undefined
            }
          />
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
        </div>

        <RegistrationDeclaration
          subject="vehicle"
          checked={declarationAccepted}
          onChange={setDeclarationAccepted}
          disabled={disabled || payload.submitted}
        />
      </article>

      <button
        type="button"
        disabled={
          disabled || payload.submitted || !declarationAccepted || !payload.ownership
        }
        onClick={() => {
          if (payload.ownership) {
            onSubmitToHr?.(messageId, lookup, payload.ownership);
          }
        }}
        className="min-h-11 rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
      >
        {payload.submitted ? "Submitted to Admin" : "Submit to Admin"}
      </button>
    </div>
  );
}
