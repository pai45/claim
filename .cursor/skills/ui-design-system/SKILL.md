---
name: ui-design-system
description: Guides UI creation for the EB+Claims mobile Benefits Assistant using the built-in Tailwind v4 pine/mint design system. Use when creating or redesigning screens, components, chat cards, dashboards, forms, layouts, or any visual feature.
---

# UI Design System

Enforce the app's existing design system. New UI must look and behave like current screens — not a generic dashboard or a new visual language.

## Source of truth

Read these before writing UI:

| File | Role |
|------|------|
| `app/globals.css` | `@theme` tokens, type roles, `.btn-*`, motion |
| `lib/ui/colors.ts` | JS color constants (keep synced with `@theme`) |
| `lib/ui/assets.ts` | Brand + icon asset registry |
| `components/shared/` | Shared primitives (`AppShell`, `AppIcon`, `MagicText`, `ConfirmDialog`) |
| `lib/ui/` | Helpers (`staggerStyle`, `useModalFocus`, colors, assets) |

Token tables: [tokens.md](tokens.md). Canonical recipes: [patterns.md](patterns.md).

## Creation protocol

Follow in order before coding UI:

1. **Read tokens** — Confirm colors, type, spacing, radius, and shadows in `app/globals.css` and `lib/ui/colors.ts`.
2. **Reuse shared UI** — Prefer `AppShell`, `AppIcon`, `MagicText`, `ConfirmDialog`, and `lib/ui` helpers over new primitives.
3. **Match a neighbor** — Copy the nearest existing screen or chat card (chat / dashboard / policy / claims) before inventing layout.
4. **Extend tokens correctly** — If a new color, radius, or type role is required, add it to `@theme` in `app/globals.css` and mirror into `lib/ui/colors.ts` when used outside Tailwind. Never introduce one-off brand hex in JSX.
5. **Run the pre-ship checklist** below.

## Hard guardrails

Non-negotiable. Do not violate these even for "quick" UI.

### Layout
- Mobile phone frame only: `max-w-phone` (402px).
- Interactive cards: `max-w-card` (340px).
- Non-chat screens: wrap with `AppShell` (`variant`: `surface` | `chat` | `bg`).
- Chat shell is special-cased (ColorBends + glass composer) — do not force `AppShell` onto chat.
- Full viewport height via `h-dvh` where screens fill the phone.

### Brand and color
- Palette: pine / pine-primary / pine-dark / mint plus existing surface, ink, border, and status tokens.
- Forbidden: purple, indigo, cream/terracotta themes, new accent systems, purple glow, generic "AI" gradients.
- Soft shadows use green-tinted rgba (`shadow-card`, `shadow-cta`, `shadow-phone`, etc.) — no new elevation styles.

### Typography
- Fonts: Lato (`font-sans`) + PP Telegraf (`font-display` / type roles).
- Never use Inter, Roboto, or Arial as intentional UI fonts.
- Prefer type role classes over ad-hoc heading stacks:
  - `.type-screen-title` — screen headers
  - `.type-hero` — greeting / hero line
  - `.type-section-title` — card / section titles
  - `.type-body` / `.type-body-secondary` — body copy
  - `.type-field-label` — uppercase field labels
  - `.type-amount` — money display
  - `.type-section-label` — uppercase section labels

### Controls
- Primary / secondary CTAs: `.btn-primary` / `.btn-secondary` (or matching established Tailwind CTA patterns already in the app).
- Do not invent a parallel button look or add a third-party Button library.
- Inputs: `rounded-control border border-input-border bg-input-soft` with `focus:border-pine` / `focus-within:border-pine`.
- Interactive targets: prefer `min-h-11` (or taller for primary CTAs).

### Spacing and shape
- 4pt grid. Prefer `px-page` / `p-card` / `gap` and spacing utilities 1–12 (4–48px).
- Radius only: `rounded-control` (12) · `rounded-card` (16) · `rounded-bubble` (20) · `rounded-pill` (32).
- Cards are interaction containers (forms, receipts, upload options) — not decorative wrappers.

### Assets and motion
- Register and load assets via `lib/ui/assets.ts` + `AppIcon` / `withBasePath`.
- Motion: reuse `.animate-rise-in`, `staggerStyle`, and `MagicText`.
- Always respect `prefers-reduced-motion` (existing CSS already gates shared animations).

### Stack boundaries
- No new UI libraries (MUI, shadcn, Radix, Chakra, etc.) unless the user explicitly requests them.
- Prefer Tailwind utilities from `@theme` over inline styles for visual properties.
- For SVG / canvas / shimmer colors, import from `lib/ui/colors.ts`.

## Pre-ship checklist

Complete before finishing a UI change:

- [ ] Only design-system tokens / utilities used
- [ ] Type roles used for headings, labels, and amounts
- [ ] Fits `max-w-phone`; interactive cards use `max-w-card` when appropriate
- [ ] Touch targets meet `min-h-11` where interactive
- [ ] Overlays use `useModalFocus` (or equivalent focus trap + Escape)
- [ ] Focus-visible outline remains pine-primary (global default)
- [ ] No hardcoded brand hex outside a synced `colors.ts` / token update
- [ ] Visual language matches pine/mint mobile Benefits Assistant

## When extending the system

Allowed:
- New feature components under `components/{domain}/` that reuse tokens and patterns
- New `@theme` tokens when a value will be reused (document by using it, keep `colors.ts` in sync if needed)

Not allowed:
- Parallel token files or theme providers
- One-off hex for brand/status colors in component files (status maps in feature constants should stay aligned with theme status tokens)
- Desktop-width or multi-column marketing layouts

## Additional resources

- Token → utility map: [tokens.md](tokens.md)
- Composition recipes: [patterns.md](patterns.md)
