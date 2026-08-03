"use client";

import Image from "next/image";
import { useState } from "react";
import type { VehicleLookupPayload } from "@/features/chat/types";
import {
  vehicleDisplayName,
  vehicleImagePageUrl,
  vehicleImageUrl,
} from "@/lib/vehicle/roster";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { colors } from "@/lib/ui/colors";

type VehicleDetailsCardProps = {
  messageId: string;
  payload: VehicleLookupPayload;
  onSubmitToHr?: (messageId: string, lookup: VehicleLookup) => void;
  disabled?: boolean;
};

function CarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 12.5h14M4.5 12.5V15a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5v-2.5m13 0V15a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.5"
        stroke={colors.muted}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3 12.5 4.2 8a1.5 1.5 0 0 1 1.45-1.1h8.7A1.5 1.5 0 0 1 15.8 8L17 12.5"
        stroke={colors.muted}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="10.6" r="0.9" fill={colors.muted} />
      <circle cx="14" cy="10.6" r="0.9" fill={colors.muted} />
    </svg>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="type-field-label shrink-0">{label}</span>
      <span className="truncate text-right text-body-sm font-bold text-pine">
        {value}
      </span>
    </div>
  );
}

export function VehicleDetailsCard({
  messageId,
  payload,
  onSubmitToHr,
  disabled,
}: VehicleDetailsCardProps) {
  // Hotlinked Commons files can be renamed upstream, and the demo may run
  // offline — without this the card would show an empty framed box.
  const [imageFailed, setImageFailed] = useState(false);

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
        {/* Commons photos vary wildly in aspect ratio, so the frame is fixed
            and the image is cropped into it rather than letterboxed. */}
        <div className="relative flex aspect-16/10 w-full items-center justify-center overflow-hidden rounded-control bg-input">
          {imageFailed ? (
            <CarIcon />
          ) : (
            <Image
              src={vehicleImageUrl(profile)}
              alt={name}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <h3 className="text-body font-bold text-pine">{name}</h3>
          <p className="type-body-secondary tracking-wide">
            {lookup.regNumber.formatted}
          </p>
        </div>

        <div className="divide-y divide-border-soft rounded-control border border-border-soft px-3 py-1">
          <Row label="Owner" value={lookup.ownerName} />
          <Row label="Engine" value={profile.engineType} />
          <Row
            label="Capacity"
            value={
              profile.engineCapacityCc
                ? `${profile.engineCapacityCc} cc`
                : undefined
            }
          />
          <Row label="Fuel" value={profile.fuel} />
          <Row label="Body" value={profile.bodyType} />
          <Row label="Registered" value={lookup.registrationDate} />
          <Row
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

        {/* Attribution is a licence condition on every roster image, not a
            courtesy — CC BY and CC BY-SA both require author and licence. */}
        {imageFailed ? null : (
          <p className="text-caption leading-3 text-ink-secondary">
            Photo:{" "}
            <a
              href={vehicleImagePageUrl(profile)}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {profile.imageAuthor}
            </a>{" "}
            /{" "}
            <a
              href={profile.imageLicenseUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {profile.imageLicense}
            </a>{" "}
            via Wikimedia Commons
          </p>
        )}
      </div>

      <div className="flex flex-wrap content-start gap-2">
        <button
          type="button"
          disabled={disabled || payload.submitted}
          onClick={() => onSubmitToHr?.(messageId, lookup)}
          className="rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          {payload.submitted ? "Submitted to HR" : "Submit to HR"}
        </button>
      </div>
    </div>
  );
}
