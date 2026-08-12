"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { AppIcon } from "@/components/shared/AppIcon";
import type { RegisteredDriver } from "@/features/driver/registration";
import { UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type DriverSummaryCardProps = {
  driver: RegisteredDriver;
};

/** Compact registered-driver record for the Driver Salary dashboard. */
export function DriverSummaryCard({ driver }: DriverSummaryCardProps) {
  return (
    <section
      className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
      style={staggerStyle(1)}
    >
      <h2 className="type-field-label">Driver details</h2>

      <Link href="/driver/" className="flex min-h-11 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
          <AppIcon src={UI_ICONS.driverDetails} size={24} alt="" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="type-body truncate font-bold text-ink">
            {driver.driverName}
          </span>
          {driver.dlNumber ? (
            <span className="type-body-secondary tracking-wide">
              {driver.dlNumber}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-body-sm font-bold text-pine-primary">
          View Details
          <ChevronRightIcon />
        </span>
      </Link>
    </section>
  );
}
