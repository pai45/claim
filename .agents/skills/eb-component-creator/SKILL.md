---
name: eb-component-creator
description: Generates and crafts pixel-perfect React/Next.js components matching the EB+Claims Benefits Assistant design system and architectural conventions. Use whenever the user asks to create, redesign, or extend screens, interactive cards, chat bubbles, form controls, dialogs, drawers, or UI components for this app.
---

# EB+Claims Component Creator & Design System Guardrails

This skill governs the generation, editing, and refactoring of UI components for the **EB+Claims Mobile Benefits Assistant**. Every component must strictly adhere to the pine/mint design system, Tailwind CSS v4 `@theme inline` tokens, Lato & PP Telegraf typography, 4pt spacing/radius system, and mobile-first architectural boundaries.

---

## 1. Non-Negotiable Strict Guardrails

> [!CAUTION]
> **ANY VIOLATION OF THESE GUARDRAILS IS A FAILURE. ENFORCE THESE RULES UNCONDITIONALLY.**

### 🛑 Guardrail 1: Brand & Theme Colors
* **The Allowed Palette ONLY:**
  * **Brand Primary**: Pine (`#0f3f37` / `text-pine`, `bg-pine`, `border-pine`), Pine Primary (`#005656` / `text-pine-primary`, `bg-pine-primary`, `border-pine-primary`), Pine Dark (`#003434` / `text-pine-dark`, `bg-pine-dark`), Mint (`#36cc8b` / `text-mint`, `bg-mint`, `border-mint`).
  * **Surfaces**: `bg-surface` (`#f8faf8`), `bg-surface-chat` (`#eef5f2`), `bg-surface-muted` (`#e8ebe9`), `bg-surface-tint` (`#eaf3f0`), `bg-surface-tint-strong` (`#e8f2ee`), `bg-input` (`#f4f8f6`), `bg-input-soft` (`#f8fbfa`), `bg-login-canvas` (`#dbf5e7`), `bg-bg` (`#f1f1f1`).
  * **Ink / Typography**: `text-ink` (`#1c2725`), `text-ink-secondary` (`#667a74`), `text-ink-tertiary` (`#8d92a3`), `text-muted` (`#8a9d99`), `text-subtle` (`#535862`), `placeholder:text-placeholder` (`#829490`), `text-cta-ink` (`#1e4e45`).
  * **Borders**: `border-border-soft` (`#edf0ee`), `border-border-line` (`#e5ece8`), `border-border-muted` (`#dfe5e2`), `border-input-border` (`#dce7e3`), `border-border-tab` (`#d8dadf`).
  * **Status**: `text-success` / `bg-success-soft` / `border-success-border` / `bg-success-tint` (`#279e6c`); `text-warning` / `text-warning-ink` / `bg-warning-soft` / `border-warning-border` / `bg-warning-tint` (`#b25e00`); `text-danger` / `bg-danger-soft` (`#7a2e24`).
* **Strictly Forbidden:**
  * ❌ **NO arbitrary hex in JSX**: Never write `style={{ color: '#005656' }}` or `bg-[#0f3f37]`. Use Tailwind token classes or import `colors` from `@/lib/ui/colors`.
  * ❌ **NO off-brand colors**: Purple, indigo, violet, blue, cyan, orange, bright red (outside danger status), neutral grays (`bg-gray-100`, `text-gray-900`), cream/terracotta themes, or dark modes.
  * ❌ **NO generic AI/purple glowing gradients**: No `bg-gradient-to-r from-purple-500 to-indigo-500`.

### 🛑 Guardrail 2: Shadows System
* **Allowed Shadows ONLY:**
  * `shadow-phone`: `0 0 40px rgba(0, 42, 25, 0.08)` (Phone frame)
  * `shadow-card`: `2px 2px 10px rgba(0, 42, 25, 0.05)` (Cards)
  * `shadow-soft`: `2px 2px 8px rgba(0, 42, 25, 0.06)` (Chat bubbles)
  * `shadow-icon`: `4px 4px 12px rgba(0, 42, 25, 0.08)` (Floating badges)
  * `shadow-cta`: `0 6px 16px rgba(0, 86, 86, 0.18)` (Primary CTA buttons)
  * `shadow-menu`: `-8px 0 24px rgba(0, 42, 25, 0.12)` (Side sheets / dialogs)
  * `shadow-drawer`: `0 -8px 32px rgba(0, 42, 25, 0.12)` (Bottom sheets)
* **Strictly Forbidden:**
  * ❌ **NO standard Tailwind neutral/black shadows**: Do not use `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`. All shadows in this app MUST use green-tinted `rgba(0, 42, 25, ...)`.

### 🛑 Guardrail 3: Typography & Predefined Type Roles
* **Font Stacks:**
  * Display: **PP Telegraf** (`font-display` / `var(--font-display)`) for headings, hero lines, and currency amounts.
  * Body/Sans: **Lato** (`font-sans` / `var(--font-sans)`) for body copy, labels, inputs, and buttons.
* **Mandatory Type Roles (Use these classes instead of raw font sizes):**
  * `.type-screen-title`: Screen title in header (PP Telegraf 20px, 700, pine)
  * `.type-hero`: Hero greeting (PP Telegraf 32px, 700, pine-primary)
  * `.type-section-title`: Section / card headers (PP Telegraf 18px, 700, ink/pine-primary)
  * `.type-body`: Standard body text (Lato 16px, 400, ink)
  * `.type-body-secondary`: Secondary text (Lato 14px, 400, ink-secondary)
  * `.type-field-label`: Uppercase field headers (Lato 12px, 700, uppercase, tracking-wider, ink-secondary)
  * `.type-amount`: Monetary values (PP Telegraf 20px, 700, pine)
  * `.type-section-label`: Uppercase section tags
* **Strictly Forbidden:**
  * ❌ Never use Inter, Roboto, Arial, or browser default font stacks as intentional UI fonts.
  * ❌ Never write raw heading typography like `text-2xl font-bold text-black` when a `.type-*` role exists.

### 🛑 Guardrail 4: Radius & Spacing System
* **Radius Tokens ONLY (Strict 4pt system):**
  * `rounded-control` (12px): Inputs, select dropdowns, toggles, icon wells, compact action buttons.
  * `rounded-card` (16px): Content cards, option cards, summary cards, dialog boxes.
  * `rounded-bubble` (20px): Chat bubbles, asymmetric chat attachment cards, drawer top corners (`rounded-t-bubble`).
  * `rounded-pill` (32px / 9999px): Primary & secondary CTA buttons, status badges.
* **Spacing Tokens:**
  * `p-page` / `px-page` / `py-page` (`16px`): Page boundaries.
  * `p-card` / `px-card` (`16px`): Card padding.
  * `gap-section` / `p-section` (`24px`): Major section spacing.
  * 4pt spacing scale (`gap-1` to `gap-12`).
* **Strictly Forbidden:**
  * ❌ Do NOT use arbitrary radii like `rounded-[10px]`, `rounded-sm`, `rounded-md`, `rounded-2xl`, `rounded-3xl`.

### 🛑 Guardrail 5: Mobile Frame & Container Constraints
* **Dimensions:**
  * Screens: Wrapped in `AppShell` with `max-w-phone` (402px) centered (`mx-auto`) and full viewport height `h-dvh`.
  * Cards: `max-w-card` (340px) or `w-full` inside mobile container.
  * Chat Shell: Dedicated glass composer and `ColorBends` background (do not force standard `AppShell` onto chat).
* **Strictly Forbidden:**
  * ❌ NO desktop-width grids (`w-[1200px]`, `grid-cols-3`, `grid-cols-4`, sidebar + content columns).
  * ❌ NO `h-screen` or `100vh` (causes browser chrome jump issues on mobile/PWA; use `h-dvh`).
  * ❌ Cards must NOT be decorative wrappers for plain text; use cards only for actionable UI (forms, receipts, option pickers, summaries).

### 🛑 Guardrail 6: Controls, Buttons & Touch Targets
* **Buttons:**
  * Primary CTA: `.btn-primary` (Full-width pill, `bg-pine-primary`, text white, `shadow-cta`).
  * Secondary CTA: `.btn-secondary` (Full-width pill, `bg-white`, border `border-border-muted`, text `pine`).
  * Compact CTA: `min-h-11 rounded-control bg-pine-primary px-3 py-2 text-caption font-bold text-white`.
* **Inputs & Form Controls:**
  * Text fields: `min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none focus:border-pine placeholder:text-placeholder`.
  * Focus outline: Focus rings must use `var(--color-pine-primary)`. Standalone controls own the ring; composite controls use `.field-focus-shell` with `focus-within:border-pine`.
* **Touch Target Size:**
  * All interactive elements (buttons, inputs, clickable rows, close icons) MUST satisfy `min-h-11` (44px).
* **Strictly Forbidden:**
  * ❌ Never install or import 3rd-party UI component libraries (MUI, shadcn, Radix, Chakra, Ant Design, Tailwind UI kit).
  * ❌ Never create ad-hoc buttons with square corners or unbranded borders.

### 🛑 Guardrail 7: Icons, Assets & Accessibility
* **Icons & Assets:**
  * Register brand and icon paths in `lib/ui/assets.ts`.
  * Render assets using `AppIcon` from `@/components/shared/AppIcon` or wrap URLs with `withBasePath()` (for GitHub Pages static export compatibility).
  * For bespoke SVG icons, use inline SVGs styled with `colors.pine`, `colors.pinePrimary`, or `colors.ink`.
* **Accessibility & Modals:**
  * Dialogs and drawers MUST use `useModalFocus` (`@/lib/ui/useModalFocus`) for focus trap, Escape key handling, and backdrop click.
  * Dialog roles must specify `role="alertdialog"` or `role="dialog"` with `aria-modal="true"`.
  * Animations must use `animate-rise-in` and `staggerStyle(index)` (`@/lib/ui/staggerStyle`) while respecting `prefers-reduced-motion`.
* **Imports:**
  * Use `@/` alias. Direct file imports ONLY (no barrel `index.ts` files).

---

## 2. Guardrails Comparison Matrix

| Aspect | ✅ Required Standard | ❌ Strictly Rejected |
|---|---|---|
| **Primary Color** | `bg-pine-primary` (`#005656`) / `text-pine` (`#0f3f37`) | `bg-blue-600`, `bg-purple-600`, `bg-[#005656]` in JSX |
| **Accent Color** | `bg-mint` (`#36cc8b`) / `text-mint` | `text-cyan-400`, `text-emerald-500`, `text-orange-500` |
| **Shadows** | `shadow-card`, `shadow-cta`, `shadow-phone`, `shadow-soft` | `shadow-md`, `shadow-lg`, `shadow-xl`, neutral black drop shadows |
| **Screen Title** | `<h1 className="type-screen-title">` | `<h1 className="text-2xl font-bold text-gray-900">` |
| **Amount Display** | `<p className="type-amount">₹1,500</p>` | `<span className="text-xl font-semibold text-green-700">₹1,500</span>` |
| **Field Label** | `<label className="type-field-label">Name</label>` | `<label className="text-xs text-gray-500 font-medium">Name</label>` |
| **Primary CTA** | `<button className="btn-primary">Submit</button>` | `<button className="rounded bg-blue-500 px-4 py-2">Submit</button>` |
| **Secondary CTA** | `<button className="btn-secondary">Cancel</button>` | `<button className="border border-gray-300 text-gray-700">Cancel</button>` |
| **Input Shell** | `rounded-control border-input-border bg-input-soft` | `rounded-md border-gray-300 bg-white` |
| **Container Frame**| `AppShell` with `max-w-phone` (402px) & `h-dvh` | `container mx-auto max-w-7xl h-screen` |
| **Component Kit** | Pure bespoke Tailwind v4 tokens (`app/globals.css`) | `@radix-ui/*`, `@shadcn/ui`, `@mui/material`, `lucide-react` |
| **Import Path** | `import { AppShell } from "@/components/shared/AppShell"` | `import { AppShell } from "../shared"` (barrel files) |

---

## 3. Mandatory Pre-Flight Verification Checklist

Before finishing any component creation or modification, verify every item:

- [ ] **Colors**: Only design-system tokens (`pine`, `pine-primary`, `pine-dark`, `mint`, `surface-*`, `ink-*`, `border-*`, `status-*`) used. No arbitrary hex codes.
- [ ] **Shadows**: Soft green-tinted shadows (`shadow-card`, `shadow-cta`, `shadow-phone`, `shadow-soft`, `shadow-menu`, `shadow-drawer`).
- [ ] **Type Roles**: Standard `.type-*` role classes used for headers, hero lines, amounts, and labels.
- [ ] **Fonts**: PP Telegraf for display/headings and Lato for body/inputs.
- [ ] **Radius**: 4pt tokens (`rounded-control`, `rounded-card`, `rounded-bubble`, `rounded-pill`).
- [ ] **Dimensions**: Fits `max-w-phone` (402px) and uses `h-dvh`.
- [ ] **Touch Target**: All interactive controls satisfy `min-h-11` (44px).
- [ ] **Modals & Drawers**: Focus trapped with `useModalFocus` + Escape key dismiss.
- [ ] **Assets**: Loaded via `AppIcon` / `withBasePath()` from `lib/ui/assets.ts`.
- [ ] **No 3rd-Party UI**: Zero external UI dependencies (no MUI, shadcn, Radix).
- [ ] **Imports**: Direct file imports using `@/` path alias without barrel `index.ts`.

---

## 4. Sub-References

- **Tokens Deep Dive**: [references/tokens.md](references/tokens.md)
- **Design Patterns**: [references/patterns.md](references/patterns.md)
- **Component Recipes**: [references/recipes.md](references/recipes.md)
- **Concrete Examples**: [examples/ScreenTemplate.tsx](examples/ScreenTemplate.tsx), [examples/CardTemplate.tsx](examples/CardTemplate.tsx), [examples/FormCardTemplate.tsx](examples/FormCardTemplate.tsx), [examples/ChatCardTemplate.tsx](examples/ChatCardTemplate.tsx), [examples/ModalDialogTemplate.tsx](examples/ModalDialogTemplate.tsx)
