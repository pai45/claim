"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";

type ChatComposerProps = {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  /** Visual variant for the attach drawer composer */
  variant?: "glass" | "solid";
  /** When set, replaces the attach button (e.g. close in drawer) */
  leadingAction?: {
    label: string;
    onClick: () => void;
    iconSrc?: string;
  };
  autoFocus?: boolean;
  className?: string;
};

const MAX_TEXTAREA_PX = 120; // ~5 rows

export function ChatComposer({
  onSend,
  onAttach,
  disabled,
  variant = "glass",
  leadingAction,
  autoFocus,
  className = "",
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  function submit() {
    const next = value.trim();
    if (!next || disabled) return;
    onSend(next);
    setValue("");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.focus();
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  const canSend = Boolean(value.trim()) && !disabled;
  const shell =
    variant === "glass"
      ? "border-white/50 bg-white/55 shadow-soft backdrop-blur-xl"
      : "border-border-line bg-white";
  const attachShell =
    variant === "glass"
      ? "border-white/50 bg-white/55 shadow-soft backdrop-blur-xl"
      : "border-transparent bg-surface-tint";

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-transparent px-4 pb-7 pt-2 ${className}`}
    >
      <div className="flex items-end gap-2.5">
        {leadingAction ? (
          <button
            type="button"
            aria-label={leadingAction.label}
            onClick={leadingAction.onClick}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${attachShell} transition-opacity`}
          >
            <AppIcon
              src={leadingAction.iconSrc ?? UI_ICONS.plus}
              size={20}
              alt=""
            />
          </button>
        ) : onAttach ? (
          <button
            type="button"
            aria-label="Add attachment"
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => onAttach()}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${attachShell} transition-opacity disabled:opacity-45`}
          >
            <AppIcon src={UI_ICONS.plus} size={20} alt="" />
          </button>
        ) : null}

        <div
          className={`flex min-h-12 min-w-0 flex-1 items-end gap-2 rounded-pill border py-1.5 pl-4 pr-1.5 ${shell}`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Claims Assistant..."
            disabled={disabled}
            aria-disabled={disabled}
            className="max-h-30 min-h-7 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-body leading-5 text-pine outline-none placeholder:text-placeholder disabled:opacity-60"
          />

          <button
            type="submit"
            aria-label="Send message"
            aria-disabled={!canSend}
            disabled={!canSend}
            className={`mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-45 ${
              canSend
                ? "bg-pine-primary text-white shadow-cta"
                : "bg-input-icon text-pine"
            }`}
          >
            <AppIcon src={UI_ICONS.send} size={18} alt="" />
          </button>
        </div>
      </div>
    </form>
  );
}
