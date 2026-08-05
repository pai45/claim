/**
 * A one-shot handoff from a full-page screen into the chat overlay.
 *
 * The overlay lives on "/" and is opened by the "#claims" hash, so a screen
 * that wants the assistant to *start* a flow has nowhere to put the intent. A
 * query parameter would mean `useSearchParams` on the app's entry route, which
 * under `output: "export"` needs a Suspense boundary or bails the whole page
 * out of static rendering. sessionStorage leaves the URL contract untouched.
 */

export const PENDING_INTENT_KEY = "eb-claims:pending-chat-intent";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AssistantPendingIntent = {
  kind?: "assistant_intent";
  intentId: string;
  /** The user-visible turn the assistant should receive, e.g. "Start registration". */
  label: string;
};

export type ClaimEditPendingIntent = {
  kind: "claim_edit";
  claimId: string;
};

export type PendingChatIntent = AssistantPendingIntent | ClaimEditPendingIntent;

export function setPendingChatIntent(
  intent: PendingChatIntent,
  storage: StorageLike = window.sessionStorage,
): void {
  try {
    storage.setItem(PENDING_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }
}

/**
 * Reads and removes in one step — a pending intent must fire at most once, and
 * removing before parsing means a malformed value cannot wedge the flow.
 */
export function takePendingChatIntent(
  storage: StorageLike = window.sessionStorage,
): PendingChatIntent | null {
  try {
    const raw = storage.getItem(PENDING_INTENT_KEY);
    if (!raw) return null;

    storage.removeItem(PENDING_INTENT_KEY);

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.kind === "claim_edit") {
      if (typeof parsed.claimId !== "string" || !parsed.claimId.trim()) {
        return null;
      }
      return { kind: "claim_edit", claimId: parsed.claimId.trim().toUpperCase() };
    }
    if (typeof parsed.intentId !== "string" || typeof parsed.label !== "string") {
      return null;
    }
    return {
      kind: "assistant_intent",
      intentId: parsed.intentId,
      label: parsed.label,
    };
  } catch {
    try {
      storage.removeItem(PENDING_INTENT_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return null;
  }
}
