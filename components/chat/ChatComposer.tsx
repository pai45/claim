"use client";

import { useState, type FormEvent } from "react";
import { colors } from "@/lib/ui/colors";

type ChatComposerProps = {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
};

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 4.25v11.5M4.25 10h11.5"
        stroke={colors.pineDark}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.25v3.5"
        stroke={colors.pineDark}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 5.75v9"
        stroke={colors.pineDark}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.5 4v12.5"
        stroke={colors.pineDark}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 6.5v7.5"
        stroke={colors.pineDark}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17.5 8.25v3.5"
        stroke={colors.pineDark}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9.2 14.5 3.5l-3.2 11.2-2.4-4.3L3.5 9.2z"
        stroke={colors.pineDark}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatComposer({ onSend, onAttach, disabled }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const canSend = Boolean(value.trim()) && !disabled;

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
      className="w-full bg-transparent px-4 pb-7 pt-2"
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Add attachment"
          disabled={disabled}
          onClick={() => onAttach?.()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/55 shadow-soft backdrop-blur-xl transition-opacity disabled:opacity-50"
        >
          <PlusIcon />
        </button>

        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/50 bg-white/55 pl-4 pr-2 shadow-soft backdrop-blur-xl">
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Message Claims Assistant..."
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-body text-pine outline-none placeholder:text-placeholder disabled:opacity-60"
          />

          {canSend ? (
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity"
            >
              <SendIcon />
            </button>
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center opacity-80"
              aria-hidden="true"
            >
              <WaveformIcon />
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
