# EB+Claims UI Patterns, Architectural Blueprints & Anti-Patterns

This document defines the official structural patterns, layout blueprints, and anti-patterns for the EB+Claims Benefits Assistant application.

---

## 1. Full Screen Layout Blueprint

### ✅ Correct Pattern
```tsx
"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

export function ExampleFeatureScreen() {
  const router = useRouter();

  return (
    <AppShell variant="surface">
      <ScreenHeader
        title="Feature Name"
        eyebrow="Section Category"
        onBack={() => router.back()}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-8 pt-2">
        {/* Scrollable cards and sections */}
      </main>

      {/* Sticky Bottom Actions Bar */}
      <footer className="shrink-0 border-t border-border-soft bg-white px-page pb-6 pt-3">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {}}
        >
          Confirm & Save
        </button>
      </footer>
    </AppShell>
  );
}
```

### ❌ Anti-Patterns to Avoid
* ❌ Wrapping non-chat screens in `<div>` without `AppShell` or omitting `max-w-phone`.
* ❌ Using `h-screen` or `100vh` (breaks PWA standalone / mobile Safari viewport; use `h-dvh`).
* ❌ Creating a custom header bar instead of using `ScreenHeader` with `BackNavigationButton`.
* ❌ Placing fixed action buttons that obscure scrollable content without a footer container.

---

## 2. Interactive Card Blueprint

### ✅ Correct Pattern
```tsx
<article className="w-full rounded-card border border-border-line bg-white p-card shadow-card">
  <div className="flex items-center justify-between">
    <h3 className="type-section-title text-pine">Card Title</h3>
    <span className="rounded-pill bg-success-soft px-2.5 py-0.5 text-caption font-bold text-success border border-success-border">
      Active
    </span>
  </div>
  <p className="mt-1 type-body-secondary">
    Explaining the purpose and context of this card.
  </p>

  <div className="mt-4 flex flex-col gap-3">
    {/* Form inputs, toggles, or data rows */}
  </div>
</article>
```

### ❌ Anti-Patterns to Avoid
* ❌ Adding decorative cards around plain paragraphs of text. Cards are interaction containers (forms, summaries, receipts, options).
* ❌ Using standard neutral drop shadows (`shadow-md`, `shadow-lg`) instead of `shadow-card`.
* ❌ Using arbitrary radii like `rounded-xl` or `rounded-lg` instead of `rounded-card` (16px).

---

## 3. Key-Value Info Rows Blueprint

### ✅ Correct Pattern
```tsx
type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
};

export function InfoRow({ icon, label, value, isLast = false }: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between px-card py-3.5 ${
        isLast ? "" : "border-b border-border-soft"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface-tint text-pine-primary">
          {icon}
        </div>
        <span className="text-body-sm text-ink-secondary">{label}</span>
      </div>
      <span className="text-body-sm font-bold text-pine">{value}</span>
    </div>
  );
}
```

---

## 4. Form Field & Composite Input Blueprint

### Standard Input
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="field-id" className="type-field-label">
    Field Label
  </label>
  <input
    id="field-id"
    type="text"
    placeholder="Enter text..."
    className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none transition-colors placeholder:font-normal placeholder:text-placeholder focus:border-pine disabled:opacity-50"
  />
</div>
```

### Composite Input with Leading Prefix / Icon
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="claim-amount" className="type-field-label">
    Claim Amount
  </label>
  <div className="flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3 transition-colors focus-within:border-pine">
    <span className="mr-2 text-body-sm font-bold text-ink-secondary">₹</span>
    <input
      id="claim-amount"
      type="number"
      placeholder="0.00"
      className="w-full bg-transparent text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder"
    />
  </div>
</div>
```

---

## 5. Buttons & Touch Targets Blueprint

| Button Variant | Classes / Syntax | Use Case |
|---|---|---|
| **Primary CTA** | `className="btn-primary w-full"` | Main bottom action / submit (56px tall default, rounded-pill) |
| **Secondary CTA**| `className="btn-secondary w-full"` | Cancel, dismiss, secondary option (rounded-pill, white bg) |
| **Dialog CTA** | `className="btn-primary min-h-11 h-auto py-3"` | Dialog/modal actions (touch-sized) |
| **Compact Action**| `className="min-h-11 rounded-control bg-pine-primary px-4 py-2 text-caption font-bold text-white"` | In-card compact button |

---

## 6. Accessible Dialog & Bottom Drawer Blueprint

Always manage focus trapping with `useModalFocus` (`@/lib/ui/useModalFocus`):

```tsx
"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type DialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ActionConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalFocus(containerRef, open, onClose);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal Card */}
      <section
        role="alertdialog"
        aria-modal="true"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-5 shadow-menu transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="type-section-title text-pine">{title}</h2>
        <p className="mt-2 type-body-secondary">{description}</p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary min-h-11 h-auto py-3"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-11 h-auto py-3"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
```
