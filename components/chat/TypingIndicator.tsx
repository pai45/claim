export function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="AI is thinking">
      <div className="typing-bubble flex items-center gap-1.5 rounded-bubble rounded-bl-md bg-white px-3.5 py-3 shadow-soft">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
