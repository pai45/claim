"use client";

import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import type { RegisteredDriver } from "@/features/driver/registration";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type DriverSummaryCardProps = {
  driver: RegisteredDriver;
};

function formatStartDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailRow({ label, value }: { label: string; value?: string }) {
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

/** Compact registered-driver record for the Driver Salary dashboard. */
export function DriverSummaryCard({ driver }: DriverSummaryCardProps) {
  return (
    <section
      className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
      style={staggerStyle(1)}
    >
      <h2 className="type-field-label">Driver details</h2>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
          <CategoryIcon icon="driver" />
        </span>
        <span className="type-body min-w-0 flex-1 truncate font-bold text-ink">
          {driver.driverName}
        </span>
      </div>

      <div className="divide-y divide-border-soft">
        <DetailRow label="DL number" value={driver.dlNumber} />
        <DetailRow label="Monthly salary" value={driver.salary} />
        <DetailRow label="Start date" value={formatStartDate(driver.startDate)} />
      </div>
    </section>
  );
}
