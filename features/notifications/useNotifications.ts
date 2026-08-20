"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  claimDraftStore,
  subscribeToClaimDrafts,
} from "@/features/chat/drafts";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  getDraftClaimsNotification,
  getNotificationsForPersona,
} from "./constants";
import { useRegistrationStatus } from "@/features/chat/useRegistrationStatus";
import {
  readNotificationsHidden,
  subscribeToNotificationsHidden,
} from "./storage";

export function useNotifications() {
  const { personaId } = useActivePersona();
  const registrationStatus = useRegistrationStatus();
  const [draftCount, setDraftCount] = useState(0);
  const hidden = useSyncExternalStore(
    subscribeToNotificationsHidden,
    readNotificationsHidden,
    () => false,
  );
  const refreshDraftCount = useCallback(() => {
    void claimDraftStore
      .count()
      .then(setDraftCount)
      .catch(() => setDraftCount(0));
  }, []);

  useEffect(() => {
    refreshDraftCount();
    return subscribeToClaimDrafts(refreshDraftCount);
  }, [refreshDraftCount]);

  const allNotifications = useMemo(
    () => {
      const draftNotification = getDraftClaimsNotification(draftCount);
      const personaNotifications = getNotificationsForPersona(
        personaId,
        registrationStatus,
      );
      return draftNotification
        ? [draftNotification, ...personaNotifications]
        : personaNotifications;
    },
    [draftCount, personaId, registrationStatus],
  );
  const notifications = hidden ? [] : allNotifications;

  return {
    hidden,
    allNotifications,
    notifications,
    count: notifications.length,
    totalCount: allNotifications.length,
    draftCount,
  };
}
