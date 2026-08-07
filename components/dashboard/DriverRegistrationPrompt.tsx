"use client";

import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type DriverRegistrationPromptProps = {
  vehicleRegistered: boolean;
  onRegisterVehicle: () => void;
  onRegisterDriver: () => void;
};

/** Holds Driver Salary claims until the required vehicle and driver exist. */
export function DriverRegistrationPrompt({
  vehicleRegistered,
  onRegisterVehicle,
  onRegisterDriver,
}: DriverRegistrationPromptProps) {
  const needsVehicle = !vehicleRegistered;

  return (
    <section
      className="animate-rise-in flex flex-col gap-4 rounded-card border border-border-line bg-white p-card shadow-card"
      style={staggerStyle(1)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
          <CategoryIcon icon={needsVehicle ? "fuel" : "driver"} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="type-section-title">
            {needsVehicle ? "Register a vehicle first" : "Register your driver"}
          </h2>
          <p className="type-body-secondary">
            {needsVehicle
              ? "Driver Salary claims require a registered vehicle. Register your vehicle first, then add your driver."
              : "Add your driver's details to start claiming driver salary against this limit."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={needsVehicle ? onRegisterVehicle : onRegisterDriver}
        className="btn-primary min-h-11 h-auto py-3"
      >
        {needsVehicle ? "Register vehicle" : "Register driver"}
      </button>
    </section>
  );
}
