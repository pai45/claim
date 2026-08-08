export const NOTIFICATIONS_HIDDEN_KEY = "eb-claims:notifications-hidden";
export const NOTIFICATIONS_CHANGED_EVENT =
  "eb-claims:notifications-visibility-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

let hiddenSnapshot: boolean | undefined;

function isBrowserStorage(storage: StorageLike): boolean {
  if (typeof window === "undefined") return false;
  try {
    return storage === window.localStorage;
  } catch {
    return false;
  }
}

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function readNotificationsHidden(
  storage: StorageLike = window.localStorage,
): boolean {
  if (isBrowserStorage(storage) && hiddenSnapshot !== undefined) {
    return hiddenSnapshot;
  }

  try {
    const hidden = storage.getItem(NOTIFICATIONS_HIDDEN_KEY) === "true";
    if (isBrowserStorage(storage)) hiddenSnapshot = hidden;
    return hidden;
  } catch {
    return hiddenSnapshot ?? false;
  }
}

export function hideAllNotifications(
  storage: StorageLike = window.localStorage,
): void {
  if (isBrowserStorage(storage)) hiddenSnapshot = true;
  try {
    storage.setItem(NOTIFICATIONS_HIDDEN_KEY, "true");
  } catch {
    // Storage can be unavailable in managed or private browsing contexts.
  }
  notify();
}

export function showAllNotifications(
  storage: StorageLike = window.localStorage,
): void {
  if (isBrowserStorage(storage)) hiddenSnapshot = false;
  try {
    storage.removeItem(NOTIFICATIONS_HIDDEN_KEY);
  } catch {
    // Reset remains safe when storage is unavailable.
  }
  notify();
}

/** Demo reset uses the same operation, but keeps intent explicit at the callsite. */
export function clearNotificationsHidden(
  storage: StorageLike = window.localStorage,
): void {
  showAllNotifications(storage);
}

export function subscribeToNotificationsHidden(
  listener: () => void,
): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === NOTIFICATIONS_HIDDEN_KEY || event.key === null) {
      hiddenSnapshot = event.key === null ? false : event.newValue === "true";
      listener();
    }
  };

  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
