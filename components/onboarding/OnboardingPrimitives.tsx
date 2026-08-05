"use client";

import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { colors } from "@/lib/ui/colors";

type HubStepCardProps = {
  title: string;
  description: string;
  status: "locked" | "available" | "complete" | "in_progress";
  index: number;
  onClick?: () => void;
  icon: ReactNode;
};

export function HubStepCard({
  title,
  description,
  status,
  index,
  onClick,
  icon,
}: HubStepCardProps) {
  const interactive = status === "available" || status === "in_progress";
  const complete = status === "complete";
  const locked = status === "locked";
  const inProgress = status === "in_progress";

  const className = [
    "flex w-full items-start gap-3 rounded-card border p-card text-left transition-colors",
    complete
      ? "border-pine-primary bg-white shadow-card"
      : inProgress
        ? "border-warning-border bg-warning-tint"
        : locked
          ? "border-border-line bg-surface-muted opacity-70"
          : "border-border-line bg-white shadow-card hover:bg-surface",
  ].join(" ");

  const content = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
          locked ? "bg-surface-muted" : "bg-success-tint"
        }`}
      >
        {locked ? (
          <span className="text-body-sm font-bold text-ink-secondary">
            {index}
          </span>
        ) : (
          icon
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-body block font-bold text-ink">{title}</span>
        <span className="type-body-secondary mt-1 block">
          {inProgress ? "KYC Verification in progress" : description}
        </span>
      </span>
      <span className="mt-1 shrink-0">
        {complete ? <CheckBadge /> : interactive ? <ChevronRightIcon /> : null}
      </span>
    </>
  );

  if (interactive && onClick) {
    return (
      <button type="button" className={`min-h-11 ${className}`} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

function CheckBadge() {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full"
      style={{ background: colors.success }}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="m6 12.5 4 4 8-9"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="type-field-label mb-1.5 block">{children}</label>;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder = "Enter",
  hint,
  readOnly = false,
  type = "text",
  trailing,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  type?: string;
  trailing?: ReactNode;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={`field-focus-shell flex min-h-11 items-center rounded-control border border-input-border px-3 ${
          readOnly ? "bg-surface-muted" : "bg-input-soft"
        }`}
      >
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-h-11 w-full bg-transparent text-body-sm font-bold text-pine outline-none placeholder:text-placeholder"
        />
        {trailing}
      </div>
      {hint ? <p className="mt-1 text-caption text-ink-secondary">{hint}</p> : null}
    </div>
  );
}

export function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-start gap-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border ${
          checked
            ? "border-pine-primary bg-pine-primary"
            : "border-input-border bg-white"
        }`}
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 12.5 4 4 8-9"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="type-body-secondary">{label}</span>
    </button>
  );
}
