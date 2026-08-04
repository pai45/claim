import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";
import { ChatOptionButton } from "./ChatOptionButton";

type QuickActionsProps = {
  onSelect: (action: QuickAction) => void;
  disabled?: boolean;
};

const START_MS = 100;
const STEP_MS = 30;

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    // Full-bleed scroller: the row scrolls past the screen edge while the
    // first pill still lines up with the page gutter.
    <div className="scrollbar-none w-full overflow-x-auto">
      <div className="flex w-max flex-nowrap gap-2 px-page">
        {QUICK_ACTIONS.map((action, index) => (
          <ChatOptionButton
            key={action.id}
            featured={action.featured}
            pointedBottomRight
            disabled={disabled}
            onClick={() => onSelect(action)}
            style={{ animationDelay: `${START_MS + index * STEP_MS}ms` }}
            className="animate-rise-in shrink-0 whitespace-nowrap"
          >
            {action.label}
          </ChatOptionButton>
        ))}
      </div>
    </div>
  );
}
