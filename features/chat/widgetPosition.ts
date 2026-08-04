/**
 * Where the user parked the floating "New chat" widget.
 *
 * Kept out of the chat session ({@link ./persistence}) on purpose: that record is
 * conversation data with a retention TTL and is wiped by `startNewChat`, while a
 * widget position is a durable UI preference that must survive clearing the chat.
 */

export const WIDGET_POSITION_KEY = "eb-claims:new-chat-widget";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type WidgetSide = "left" | "right";

export type NewChatWidgetPosition = {
  side: WidgetSide;
  /**
   * Vertical seat as a 0–1 fraction of the draggable band rather than pixels.
   * The chat frame is `h-dvh`, so a soft keyboard or a rotation changes the
   * band's height — a stored pixel offset would strand the widget off-screen.
   */
  yRatio: number;
};

export const DEFAULT_WIDGET_POSITION: NewChatWidgetPosition = {
  side: "right",
  yRatio: 0.62,
};

function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function saveWidgetPosition(
  position: NewChatWidgetPosition,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(WIDGET_POSITION_KEY, JSON.stringify(position));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }
}

export function loadWidgetPosition(
  storage: StorageLike = window.localStorage,
): NewChatWidgetPosition | null {
  try {
    const raw = storage.getItem(WIDGET_POSITION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<NewChatWidgetPosition>;
    if (parsed.side !== "left" && parsed.side !== "right") return null;
    if (typeof parsed.yRatio !== "number" || !Number.isFinite(parsed.yRatio)) {
      return null;
    }
    // Clamp rather than reject: a stale value from a taller viewport is still a
    // usable intent ("near the bottom"), and dropping it would silently move a
    // widget the user deliberately placed.
    return { side: parsed.side, yRatio: clampRatio(parsed.yRatio) };
  } catch {
    return null;
  }
}
