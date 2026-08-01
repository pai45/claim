"use client";

import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
};

export function ChatComposer({ onSend, onAttach, disabled }: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (!next || disabled) return;
    onSend(next);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border-soft bg-white px-4 pb-8 pt-4"
    >
      <div className="flex h-[54px] items-center gap-3 rounded-full border border-input-border bg-input px-2">
        <button
          type="button"
          aria-label="Add attachment"
          disabled={disabled}
          onClick={() => onAttach?.()}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-input-icon disabled:opacity-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 3.75v10.5M3.75 9h10.5"
              stroke="#0F3F37"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Message Claims Assistant..."
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent font-sans text-sm text-pine outline-none placeholder:text-muted disabled:opacity-60"
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled || !value.trim()}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-input-icon disabled:opacity-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 9.2 14.5 3.5l-3.2 11.2-2.4-4.3L3.5 9.2z"
              stroke="#003434"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
