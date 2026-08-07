"use client";

import { useEffect, useState } from "react";
import {
  loadRegisteredDriver,
  subscribeToRegisteredDriver,
} from "@/features/driver/registration";
import {
  loadRegisteredVehicle,
  subscribeToRegisteredVehicle,
} from "@/features/vehicle/registration";

export type RegistrationStatus = {
  isVehicleRegistered: boolean;
  isDriverRegistered: boolean;
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
  });

  useEffect(() => {
    function update() {
      setStatus({
        isVehicleRegistered: Boolean(loadRegisteredVehicle()),
        isDriverRegistered: Boolean(loadRegisteredDriver()),
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
