"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { AppIcon } from "@/components/shared/AppIcon";
import { vehicleDisplayName } from "@/lib/vehicle/roster";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type VehicleSummaryCardProps = {
  lookup: VehicleLookup;
};

/**
 * The registered vehicle in one row. Uses the supplied vehicle icon rather
 * than the roster photo, so this card carries no Commons attribution obligation.
 */
export function VehicleSummaryCard({ lookup }: VehicleSummaryCardProps) {
  return (
    <section
      className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
      style={staggerStyle(1)}
    >
      <h2 className="type-field-label">Vehicle details</h2>

      <Link href="/vehicle/" className="flex min-h-11 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
          <AppIcon src={UI_ICONS.vehicleDetails} size={24} alt="" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="type-body truncate font-bold text-ink">
            {vehicleDisplayName(lookup.profile)}
          </span>
          <span className="type-body-secondary tracking-wide">
            {lookup.regNumber.formatted}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-body-sm font-bold text-pine-primary">
          View Details
          <ChevronRightIcon />
        </span>
      </Link>
    </section>
  );
}
