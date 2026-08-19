"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  billDraftStore,
  subscribeToBillDrafts,
} from "@/features/chat/drafts";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  getDraftClaimsNotification,
  getNotificationsForPersona,
} from "./constants";
import {
  readNotificationsHidden,
  subscribeToNotificationsHidden,
} from "./storage";

export function useNotifications() {
  const { personaId } = useActivePersona();
  const [draftCount, setDraftCount] = useState(0);
  const hidden = useSyncExternalStore(
    subscribeToNotificationsHidden,
    readNotificationsHidden,
    () => false,
  );
  const refreshDraftCount = useCallback(() => {
    void billDraftStore
      .count()
      .then(setDraftCount)
      .catch(() => setDraftCount(0));
  }, []);

  useEffect(() => {
    refreshDraftCount();
    return subscribeToBillDrafts(refreshDraftCount);
  }, [refreshDraftCount]);

  const allNotifications = useMemo(
    () => {
      const draftNotification = getDraftClaimsNotification(draftCount);
      return draftNotification
        ? [draftNotification, ...getNotificationsForPersona(personaId)]
        : getNotificationsForPersona(personaId);
    },
    [draftCount, personaId],
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
