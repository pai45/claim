import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";
import { ChatOptionButton } from "./ChatOptionButton";

type QuickActionsProps = {
  onSelect: (action: QuickAction) => void;
  disabled?: boolean;
};

const START_MS = 100;
const STEP_MS = 30;
const ROW_SIZE = Math.ceil(QUICK_ACTIONS.length / 2);

function QuickActionButton({
  action,
  index,
  disabled,
  onSelect,
}: {
  action: QuickAction;
  index: number;
  disabled?: boolean;
  onSelect: (action: QuickAction) => void;
}) {
  const style = { animationDelay: `${START_MS + index * STEP_MS}ms` };

  return (
    <ChatOptionButton
      featured={action.featured}
      disabled={disabled}
      onClick={() => onSelect(action)}
      style={style}
      className="animate-rise-in"
    >
      {action.label}
    </ChatOptionButton>
  );
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const rows = [
    QUICK_ACTIONS.slice(0, ROW_SIZE),
    QUICK_ACTIONS.slice(ROW_SIZE),
  ];

  return (
    <div className="flex flex-col gap-2.5 px-page">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap content-start gap-2.5">
          {row.map((action, indexInRow) => {
            const index = rowIndex * ROW_SIZE + indexInRow;
            return (
              <QuickActionButton
                key={action.id}
                action={action}
                index={index}
                disabled={disabled}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
