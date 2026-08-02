import { ChatAvatar } from "./ChatAvatar";
import { TypingIndicator } from "./TypingIndicator";

type ChatStatusBubbleProps = {
  label?: string;
  progress?: number;
  variant?: "typing" | "status";
};

export function ChatStatusBubble({
  label,
  progress,
  variant = "status",
}: ChatStatusBubbleProps) {
  if (variant === "typing") {
    return (
      <div className="flex items-end gap-2">
        <ChatAvatar />
        <TypingIndicator bare />
      </div>
    );
  }

  const showProgress = typeof progress === "number";

  return (
    <div
      className="flex items-end gap-2"
      role="status"
      aria-live="polite"
    >
      <ChatAvatar />
      <div className="min-w-[140px] max-w-[85%] rounded-bubble rounded-bl-md border border-border-soft bg-white/95 px-3.5 py-2.5 shadow-soft">
        <p className="text-body-sm text-muted">
          {label}
          {showProgress ? ` ${Math.round(progress)}%` : null}
        </p>
        {showProgress ? (
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-surface-tint"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-mint transition-[width] duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
