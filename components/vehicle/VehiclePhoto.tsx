"use client";

import Image from "next/image";
import { vehicleDisplayName, vehicleImageUrl } from "@/lib/vehicle/roster";
import type { VehicleProfile } from "@/lib/vehicle/types";
import { colors } from "@/lib/ui/colors";

type VehiclePhotoProps = {
  profile: VehicleProfile;
  /** Frame classes; defaults to the chat card's fixed aspect. */
  className?: string;
  priority?: boolean;
};

export function CarIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
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

/** Supplied vehicle artwork selected from the profile's body type. */
export function VehiclePhoto({
  profile,
  className = "aspect-16/10",
  priority,
}: VehiclePhotoProps) {
  const name = vehicleDisplayName(profile);

  return (
    <div>
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-control bg-input ${className}`.trim()}
      >
        <Image
          src={vehicleImageUrl(profile)}
          alt={`${name} ${profile.bodyType}`}
          fill
          sizes="(max-width: 402px) calc(100vw - 32px), 370px"
          className="object-contain p-2"
          priority={priority}
        />
      </div>
    </div>
  );
}
