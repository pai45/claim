import type { ReactNode } from "react";

type NativeMonthPickerProps = {
  value: string;
  onChange: (month: string) => void;
  label: string;
  children?: ReactNode;
  className?: string;
};

export function NativeMonthPicker({
  value,
  onChange,
  label,
  children,
  className = "",
}: NativeMonthPickerProps) {
  return (
    <label
      className={`relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center overflow-hidden rounded-control bg-surface-muted transition-colors hover:bg-surface-tint focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-primary ${className}`}
    >
      <span aria-hidden="true">{children}</span>
      <input
        type="month"
        value={value}
        min="2026-04"
        max="2026-08"
        aria-label={label}
        onInput={(event) => {
          if (event.currentTarget.value) onChange(event.currentTarget.value);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
