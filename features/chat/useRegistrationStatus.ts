"use client";

import { useEffect, useState } from "react";
import { isDriverRegistrationRejected } from "@/features/driver/rejection";
import {
  loadRegisteredDriver,
  subscribeToRegisteredDriver,
} from "@/features/driver/registration";
import {
  loadRegisteredVehicle,
  subscribeToRegisteredVehicle,
} from "@/features/vehicle/registration";
import { isVehicleRegistrationRejected } from "@/features/vehicle/rejection";

export type RegistrationStatus = {
  isVehicleRegistered: boolean;
  isDriverRegistered: boolean;
  /** The registered vehicle came back rejected and needs resubmitting. */
  isVehicleRejected: boolean;
  /** The registered driver came back rejected and needs resubmitting. */
  isDriverRejected: boolean;
};

/**
 * Reactively tracks vehicle and driver registration status across the app.
 *
 * Starts false to match SSR and resolves once mounted on the client. Listens to
 * same-tab and cross-tab storage events so the promo carousel updates
 * immediately when a registration completes in chat.
 */
export function useRegistrationStatus(): RegistrationStatus {
  const [status, setStatus] = useState<RegistrationStatus>({
    isVehicleRegistered: false,
    isDriverRegistered: false,
    isVehicleRejected: false,
    isDriverRejected: false,
  });

  useEffect(() => {
    function update() {
      // Both records are kept rather than collapsed to booleans: the rejection
      // rules compare their registration timestamps.
      const vehicle = loadRegisteredVehicle();
      const driver = loadRegisteredDriver();
      setStatus({
        isVehicleRegistered: Boolean(vehicle),
        isDriverRegistered: Boolean(driver),
        isVehicleRejected: isVehicleRegistrationRejected(vehicle, driver),
        isDriverRejected: isDriverRegistrationRejected(vehicle, driver),
      });
    }

    update();

    const unsubVehicle = subscribeToRegisteredVehicle(update);
    const unsubDriver = subscribeToRegisteredDriver(update);

    return () => {
      unsubVehicle();
      unsubDriver();
    };
  }, []);

  return status;
}
