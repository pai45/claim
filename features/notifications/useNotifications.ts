"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { getNotificationsForPersona } from "./constants";
import {
  readNotificationsHidden,
  subscribeToNotificationsHidden,
} from "./storage";

export function useNotifications() {
  const { personaId } = useActivePersona();
  const hidden = useSyncExternalStore(
    subscribeToNotificationsHidden,
    readNotificationsHidden,
    () => false,
  );
  const allNotifications = useMemo(
    () => getNotificationsForPersona(personaId),
    [personaId],
  );
  const notifications = hidden ? [] : allNotifications;

  return {
    hidden,
    allNotifications,
    notifications,
    count: notifications.length,
    totalCount: allNotifications.length,
  };
}
