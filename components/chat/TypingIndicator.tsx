type TypingIndicatorProps = {
  /** When true, render only the bubble (avatar provided by parent). */
  bare?: boolean;
};

export function TypingIndicator({ bare = false }: TypingIndicatorProps) {
  const bubble = (
    <div
      className="typing-bubble flex items-center gap-1.5 rounded-bubble rounded-bl-md border border-border-soft bg-white/95 px-3.5 py-3 shadow-soft"
      aria-label="AI is thinking"
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );

  if (bare) return bubble;

  return (
    <div className="flex justify-start" aria-live="polite">
      {bubble}
    </div>
  );
}
