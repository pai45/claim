# EB+Claims Component Recipes

Ready-to-use component recipes matching the exact syntax and conventions of the codebase.

---

## 1. Setting Toggle Card (e.g. Limit Channel, UPI switch, Permissions)

```tsx
"use client";

import type { CSSProperties } from "react";
import { colors } from "@/lib/ui/colors";

type ToggleChannelCardProps = {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (nextState: boolean) => void;
  style?: CSSProperties;
};

export function ToggleChannelCard({
  title,
  description,
  enabled,
  onToggle,
  style,
}: ToggleChannelCardProps) {
  return (
    <article
      style={style}
      className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="type-section-title text-pine">{title}</h3>
          <p className="type-body-secondary text-caption">{description}</p>
        </div>

        {/* Accessible Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-pine-primary ${
            enabled ? "bg-pine-primary" : "bg-border-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </article>
  );
}
```

---

## 2. Claim / Transaction Item Row Card

```tsx
"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { formatINR } from "@/features/dashboard/constants";

type ClaimItemProps = {
  id: string;
  category: string;
  merchant: string;
  date: string;
  amount: number;
  status: "Approved" | "Pending" | "Rejected";
  href: string;
};

const statusClasses = {
  Approved: "bg-success-soft text-success border-success-border",
  Pending: "bg-warning-soft text-warning border-warning-border",
  Rejected: "bg-danger-soft text-danger border-border-soft",
} as const;

export function ClaimItemCard({
  category,
  merchant,
  date,
  amount,
  status,
  href,
}: ClaimItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-card border border-border-line bg-white p-card shadow-card transition-all active:scale-[0.99] hover:border-pine/30"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="type-field-label text-pine-primary">{category}</span>
          <span
            className={`rounded-pill border px-2 py-0.5 text-caption font-semibold ${statusClasses[status]}`}
          >
            {status}
          </span>
        </div>
        <p className="truncate text-body-sm font-bold text-pine">{merchant}</p>
        <p className="text-caption text-ink-secondary">{date}</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="type-amount text-body-sm">{formatINR(amount)}</p>
        <ChevronRightIcon className="text-ink-secondary" />
      </div>
    </Link>
  );
}
```

---

## 3. Bottom Action Drawer

```tsx
"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type BottomDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomDrawer({
  open,
  title,
  onClose,
  children,
}: BottomDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerRef, open, onClose);

  return (
    <div
      ref={drawerRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Panel */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-bubble bg-white px-page pb-8 pt-4 shadow-drawer transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Grab Handle */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-muted" />

        <div className="flex items-center justify-between pb-3">
          <h2 className="type-section-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-muted"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
```

---

## 4. Multi-Option Selector Card

```tsx
"use client";

type OptionItem<T extends string> = {
  id: T;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

type OptionSelectorProps<T extends string> = {
  options: OptionItem<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
};

export function OptionSelectorCard<T extends string>({
  options,
  selectedId,
  onSelect,
}: OptionSelectorProps<T>) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex min-h-11 w-full items-center justify-between rounded-card border p-card text-left transition-all ${
              isSelected
                ? "border-pine-primary bg-surface-tint shadow-card"
                : "border-border-line bg-white hover:border-border-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              {opt.icon ? (
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${
                    isSelected
                      ? "bg-pine-primary text-white"
                      : "bg-surface-muted text-ink-secondary"
                  }`}
                >
                  {opt.icon}
                </div>
              ) : null}
              <div className="flex flex-col">
                <span className="text-body-sm font-bold text-pine">{opt.title}</span>
                {opt.description ? (
                  <span className="text-caption text-ink-secondary">
                    {opt.description}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? "border-pine-primary bg-pine-primary text-white"
                  : "border-input-border bg-white"
              }`}
            >
              {isSelected ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```
