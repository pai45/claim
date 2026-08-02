import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";

type QuickActionsProps = {
  onSelect: (action: QuickAction) => void;
  disabled?: boolean;
};

const START_MS = 980;
const STEP_MS = 75;
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

  if (action.featured) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(action)}
        style={style}
        className="animate-rise-in relative overflow-hidden rounded-tl rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] px-4 py-2.5 disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="quick-action-featured-border absolute inset-0"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[1.5px] rounded-tl rounded-tr-[18.5px] rounded-br-[18.5px] rounded-bl-[18.5px] bg-white"
        />
        <span className="relative font-sans text-sm font-bold text-pine">
          {action.label}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(action)}
      style={style}
      className="animate-rise-in rounded-tl rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] border border-input-border bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-60"
    >
      {action.label}
    </button>
  );
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const rows = [
    QUICK_ACTIONS.slice(0, ROW_SIZE),
    QUICK_ACTIONS.slice(ROW_SIZE),
  ];

  return (
    <div className="flex flex-col gap-2 px-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap content-start gap-2">
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
