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

  const rows = actions.some((action) => action.row !== undefined)
    ? Array.from(new Set(actions.map((action) => action.row ?? 0))).map((row) =>
        actions.filter((action) => (action.row ?? 0) === row),
      )
    : null;

  const renderAction = (action: QuickAction, index: number) => (
    <ChatOptionButton
      key={action.id}
      disabled={disabled}
      onClick={() => onSelect(action)}
      className="animate-rise-in w-fit text-left"
      style={staggerStyle(index)}
    >
      {action.label}
    </ChatOptionButton>
  );

  return (
    <div
      className={`flex max-w-card ${
        rows ? "flex-col items-start" : "flex-wrap"
      } gap-2 pt-1`}
      aria-label="Suggested replies"
    >
      {rows
        ? rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-nowrap gap-2">
              {row.map((action) =>
                renderAction(action, actions.indexOf(action)),
              )}
            </div>
          ))
        : actions.map(renderAction)}
    </div>
  );
}
