"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { VehicleDetailRow } from "@/components/vehicle/VehicleDetailRow";
import { CarIcon, VehiclePhoto } from "@/components/vehicle/VehiclePhoto";
import {
  VEHICLE_REGISTRATION_INTENT,
  VEHICLE_REGISTRATION_LABEL,
} from "@/features/chat/constants";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
import { useRegisteredVehicle } from "@/features/vehicle/useRegisteredVehicle";
import { vehicleOwnershipLabel } from "@/lib/vehicle/ownership";
import { vehicleDisplayName } from "@/lib/vehicle/roster";

export function VehicleDetailsScreen() {
  const router = useRouter();
  const { vehicle, isHydrated } = useRegisteredVehicle();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function startRegistration() {
    setPendingChatIntent({
      intentId: VEHICLE_REGISTRATION_INTENT,
      label: VEHICLE_REGISTRATION_LABEL,
    });
    router.push("/#claims");
  }

  function handleReplace() {
    setConfirmOpen(false);
    // Deliberately does not clear the store: saveRegisteredVehicle overwrites
    // unconditionally, so clearing early would only strand a user who abandons
    // the assistant halfway with no way back to their current plate.
    startRegistration();
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Vehicle Details"
        onBack={() => router.push("/dashboard/fuel/")}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-10 pt-2">
        {!isHydrated ? (
          <p className="type-body-secondary">Loading vehicle…</p>
        ) : !vehicle ? (
          <section className="animate-rise-in flex flex-col gap-4 rounded-card border border-border-line bg-white p-card shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
                <CarIcon size={24} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="type-section-title">No vehicle registered</h2>
                <p className="type-body-secondary">
                  Register your vehicle to claim fuel and maintenance bills.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={startRegistration}
              className="btn-primary min-h-11 h-auto py-3"
            >
              Register vehicle
            </button>
          </section>
        ) : (
          <>
            <section className="flex items-center justify-between gap-3">
              <h2 className="type-section-title truncate">
                {vehicleDisplayName(vehicle.lookup.profile)}
              </h2>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="min-h-11 shrink-0 rounded-pill border border-pine-primary px-3.5 py-2 text-caption font-bold text-pine-primary"
              >
                Change Vehicle
              </button>
            </section>

            <VehiclePhoto
              profile={vehicle.lookup.profile}
              className="aspect-16/10 rounded-card"
              priority
            />

            <div className="flex justify-center py-1">
              <div className="inline-flex min-h-11 overflow-hidden rounded-control border-2 border-border-tab bg-white">
                <span className="flex w-12 shrink-0 flex-col items-center justify-center gap-0.5 bg-pine-primary px-2 py-1.5 text-white">
                  <span aria-hidden="true" className="text-caption leading-none">
                    ✦
                  </span>
                  <span className="text-caption font-bold leading-none tracking-wide">
                    IND
                  </span>
                </span>
                <span className="flex items-center px-4 py-2 font-sans text-title font-bold tracking-wider text-ink">
                  {vehicle.lookup.regNumber.formatted}
                </span>
              </div>
            </div>

            <section className="divide-y divide-border-soft rounded-card border border-border-line bg-white px-card py-1 shadow-card">
              <VehicleDetailRow
                label="Ownership"
                value={vehicleOwnershipLabel(vehicle.ownership)}
              />
              <VehicleDetailRow
                label="Vehicle Owner"
                value={vehicle.lookup.ownerName}
              />
              <VehicleDetailRow
                label="Engine CC"
                value={
                  vehicle.lookup.profile.engineCapacityCc
                    ? `${vehicle.lookup.profile.engineCapacityCc} cc`
                    : undefined
                }
              />
              <VehicleDetailRow
                label="Fuel Type"
                value={vehicle.lookup.profile.fuel}
              />
              <VehicleDetailRow
                label="Chassis Number"
                value={vehicle.lookup.chassisNumber}
              />
              <VehicleDetailRow
                label="Engine Number"
                value={vehicle.lookup.engineNumber}
              />
            </section>
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Replace your registered vehicle?"
        description="You'll enter a new vehicle number in the assistant. Your current vehicle stays registered until the new one is submitted."
        confirmLabel="Replace vehicle"
        cancelLabel="Keep current vehicle"
        onConfirm={handleReplace}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
