"use client";

import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type VehicleRegistrationPromptProps = {
  onRegister: () => void;
};

/** Stands in for the claims list until a vehicle exists to claim against. */
export function VehicleRegistrationPrompt({
  onRegister,
}: VehicleRegistrationPromptProps) {
  return (
    <section
      className="animate-rise-in flex flex-col gap-4 rounded-card border border-border-line bg-white p-card shadow-card"
      style={staggerStyle(1)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
          <CategoryIcon icon="fuel" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="type-section-title">Register your vehicle</h2>
          <p className="type-body-secondary">
            Add your vehicle once to claim fuel and maintenance bills against
            this limit.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRegister}
        className="btn-primary min-h-11 h-auto py-3"
      >
        Register vehicle
      </button>
    </section>
  );
}
