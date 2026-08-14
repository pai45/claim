import type { QuickAction } from "@/features/chat/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { ChatOptionButton } from "./ChatOptionButton";

type ContextualQuickChatsProps = {
  actions: QuickAction[];
  disabled?: boolean;
  onSelect: (action: QuickAction) => void;
};

export function ContextualQuickChats({
  actions,
  disabled,
  onSelect,
}: ContextualQuickChatsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className="flex max-w-card flex-wrap gap-2 pt-1"
      aria-label="Suggested replies"
    >
      {actions.map((action, index) => (
        <ChatOptionButton
          key={action.id}
          disabled={disabled}
          onClick={() => onSelect(action)}
          className="animate-rise-in w-fit text-left"
          style={staggerStyle(index)}
        >
          {action.label}
        </ChatOptionButton>
      ))}
    </div>
  );
}
