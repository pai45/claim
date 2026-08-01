export function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="AI is thinking">
      <div className="typing-bubble flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-[2px_2px_8px_rgba(0,42,25,0.06)]">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
