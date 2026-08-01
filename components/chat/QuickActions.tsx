import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";

type QuickActionsProps = {
  onSelect: (action: QuickAction) => void;
  disabled?: boolean;
};

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap content-start gap-2 px-4">
      {QUICK_ACTIONS.map((action) =>
        action.featured ? (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action)}
            className="relative overflow-hidden rounded-tl rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] px-4 py-2.5 disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_48.57%,#99E0C7_0deg,#73BF99_90deg,#B8FFF7_180deg,#73BF99_270deg,#99E0C7_360deg)]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-[1.5px] rounded-tl rounded-tr-[18.5px] rounded-br-[18.5px] rounded-bl-[18.5px] bg-white"
            />
            <span className="relative font-sans text-sm font-bold text-pine">
              {action.label}
            </span>
          </button>
        ) : (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action)}
            className="rounded-tl rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] border border-input-border bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-60"
          >
            {action.label}
          </button>
        ),
      )}
    </div>
  );
}
