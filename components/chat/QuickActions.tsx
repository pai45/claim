import { Fragment } from "react";
import { QUICK_ACTIONS } from "@/features/chat/constants";
import type { QuickAction } from "@/features/chat/types";
import { ChatOptionButton } from "./ChatOptionButton";

type QuickActionsProps = {
  onSelect: (action: QuickAction) => void;
  onOpenDrafts: () => void;
  draftCount?: number;
  disabled?: boolean;
};

const START_MS = 100;
const STEP_MS = 30;

export function QuickActions({
  onSelect,
  onOpenDrafts,
  draftCount = 0,
  disabled,
}: QuickActionsProps) {
  const draftLabel = `${draftCount} ${
    draftCount === 1 ? "claim" : "claims"
  } in draft`;

  return (
    // Full-bleed scroller: the row scrolls past the screen edge while the
    // first pill still lines up with the page gutter.
    <div className="scrollbar-none w-full overflow-x-auto">
      <div className="flex w-max flex-nowrap gap-2 px-page">
        {QUICK_ACTIONS.map((action, index) => {
          const animationIndex =
            index + (draftCount > 0 && index > 0 ? 1 : 0);

          return (
            <Fragment key={action.id}>
              <ChatOptionButton
                featured={action.featured}
                pointedBottomRight
                disabled={disabled}
                onClick={() => onSelect(action)}
                style={{ animationDelay: `${START_MS + animationIndex * STEP_MS}ms` }}
                className="animate-rise-in w-fit shrink-0 whitespace-nowrap"
              >
                {action.label}
              </ChatOptionButton>
              {index === 0 && draftCount > 0 ? (
                <ChatOptionButton
                  pointedBottomRight
                  disabled={disabled}
                  onClick={onOpenDrafts}
                  style={{ animationDelay: `${START_MS + (index + 1) * STEP_MS}ms` }}
                  className="animate-rise-in w-fit shrink-0 whitespace-nowrap"
                >
                  {draftLabel}
                </ChatOptionButton>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
