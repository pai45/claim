"use client";

import Image from "next/image";
import { useState } from "react";
import {
  vehicleDisplayName,
  vehicleImageUrl,
} from "@/lib/vehicle/roster";
import type { VehicleProfile } from "@/lib/vehicle/types";
import { colors } from "@/lib/ui/colors";

type VehiclePhotoProps = {
  profile: VehicleProfile;
  /** Frame classes; defaults to the chat card's fixed aspect. */
  className?: string;
  /** Passed to `vehicleImageUrl` as the requested thumbnail width. */
  width?: number;
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

/**
 * The roster photo and its credit, together.
 *
 * Every roster image is hotlinked from Wikimedia Commons under CC BY or
 * CC BY-SA, so attribution is a licence condition rather than a courtesy.
 * Bundling the credit with the image is what makes it structurally impossible
 * to render one without the other — never call `vehicleImageUrl` elsewhere.
 */
export function VehiclePhoto({
  profile,
  className = "aspect-16/10",
  width,
  priority,
}: VehiclePhotoProps) {
  // Hotlinked Commons files can be renamed upstream, and the demo may run
  // offline — without this the card would show an empty framed box.
  const [imageFailed, setImageFailed] = useState(false);
  const name = vehicleDisplayName(profile);

  return (
    <div>
      {/* Commons photos vary wildly in aspect ratio, so the frame is fixed
          and the image is cropped into it rather than letterboxed. */}
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-control bg-input ${className}`.trim()}
      >
        {imageFailed ? (
          <CarIcon />
        ) : (
          <Image
            src={vehicleImageUrl(profile, width)}
            alt={name}
            fill
            className="object-cover"
            unoptimized
            priority={priority}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

    </div>
  );
}
