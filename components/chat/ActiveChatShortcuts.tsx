import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";

type ActiveChatShortcutsProps = {
  onSelect: (action: QuickAction) => void;
  onNewChat: () => void;
  disabled?: boolean;
};

const SHORTCUT_IDS = new Set(["upload-bill", "view-policy"]);

export function ActiveChatShortcuts({
  onSelect,
  onNewChat,
  disabled,
}: ActiveChatShortcutsProps) {
  const shortcuts = QUICK_ACTIONS.filter((action) => SHORTCUT_IDS.has(action.id));

  return (
    <div className="flex flex-wrap content-start gap-2 px-4 pb-1">
      {shortcuts.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action)}
          className={`min-h-9 rounded-pill border px-3.5 py-1.5 text-caption font-bold disabled:opacity-50 ${
            action.featured
              ? "border-pine-primary/30 bg-pine-primary text-white"
              : "border-input-border bg-white/80 text-pine backdrop-blur-sm"
          }`}
        >
          {action.label}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={onNewChat}
        className="min-h-9 rounded-pill border border-input-border bg-white/80 px-3.5 py-1.5 text-caption font-bold text-pine backdrop-blur-sm disabled:opacity-50"
      >
        New chat
      </button>
    </div>
  );
}
