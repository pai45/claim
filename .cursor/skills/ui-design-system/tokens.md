# Design tokens

Source: `app/globals.css` (`@theme inline`). Naming: `--{type}-{role}` → Tailwind utilities like `bg-surface`, `text-ink`, `p-page`, `rounded-card`.

JS mirror for non-Tailwind contexts: `lib/ui/colors.ts` — keep in sync when changing brand/status colors.

## Brand colors

| Token | Value | Utilities |
|-------|-------|-----------|
| `--color-pine` | `#0f3f37` | `bg-pine`, `text-pine`, `border-pine` |
| `--color-pine-primary` | `#005656` | `bg-pine-primary`, `text-pine-primary` |
| `--color-pine-dark` | `#003434` | `bg-pine-dark`, `text-pine-dark` |
| `--color-mint` | `#36cc8b` | `bg-mint`, `text-mint`, `border-mint` |

`colors.ts`: `pine`, `pinePrimary`, `pineDark`, `mint`, plus `mintSoft` / `mintWash` for ColorBends.

## Surfaces

| Token | Utilities |
|-------|-----------|
| `--color-bg` | `bg-bg` |
| `--color-surface` | `bg-surface` |
| `--color-surface-chat` | `bg-surface-chat` |
| `--color-surface-muted` | `bg-surface-muted` |
| `--color-surface-tint` | `bg-surface-tint` |
| `--color-surface-tint-strong` | `bg-surface-tint-strong` |
| `--color-input` | `bg-input` |
| `--color-input-icon` | `bg-input-icon` |
| `--color-input-soft` | `bg-input-soft` |

## Ink / text

| Token | Utilities |
|-------|-----------|
| `--color-ink` | `text-ink`, `bg-ink` |
| `--color-ink-secondary` | `text-ink-secondary` |
| `--color-ink-tertiary` | `text-ink-tertiary` |
| `--color-body` | `text-body` (color) |
| `--color-muted` | `text-muted` |
| `--color-subtle` | `text-subtle` |
| `--color-placeholder` | `text-placeholder`, `placeholder:text-placeholder` |
| `--color-cta-ink` | `text-cta-ink` |

## Borders

| Token | Utilities |
|-------|-----------|
| `--color-border-soft` | `border-border-soft` |
| `--color-border-line` | `border-border-line` |
| `--color-border-muted` | `border-border-muted` |
| `--color-input-border` | `border-input-border` |
| `--color-border-tab` | `border-border-tab` |

## Status

| Token | Utilities |
|-------|-----------|
| `--color-success` | `text-success`, `bg-success` |
| `--color-success-soft` | `bg-success-soft` |
| `--color-success-border` | `border-success-border` |
| `--color-success-tint` | `bg-success-tint` |
| `--color-warning` | `text-warning` |
| `--color-warning-soft` | `bg-warning-soft` |
| `--color-warning-border` | `border-warning-border` |
| `--color-warning-tint` | `bg-warning-tint` |
| `--color-warning-ink` | `text-warning-ink` |
| `--color-danger` | `text-danger` |
| `--color-danger-soft` | `bg-danger-soft` |

Claim status chips: prefer aligning with these tokens. Existing map: `features/claims-history/constants.ts` (`CLAIM_STATUS_STYLES`).

## Type scale

| Token | Size | Utility |
|-------|------|---------|
| `--text-caption` | 12px | `text-caption` |
| `--text-body-sm` | 14px | `text-body-sm` |
| `--text-body` | 16px | `text-body` |
| `--text-title-sm` | 18px | `text-title-sm` |
| `--text-title` | 20px | `text-title` |
| `--text-display` | 32px | `text-display` |

Prefer **type role classes** in `globals.css` (`.type-*`) over raw scale utilities for repeating UI.

## Fonts

| Token | Stack | Utility |
|-------|-------|---------|
| `--font-sans` | Lato | `font-sans` |
| `--font-display` | PP Telegraf | `font-display` |

Wired in `app/layout.tsx` as `--font-lato` / `--font-pp-telegraf`.

## Spacing

| Token | Value | Utilities |
|-------|-------|-----------|
| `--spacing-page` | 16px | `p-page`, `px-page`, `py-page` |
| `--spacing-card` | 16px | `p-card`, `px-card` |
| `--spacing-section` | 24px | `p-section`, `gap-section` |

Also use Tailwind spacing 1–12 on the 4pt grid (4–48px).

## Radius

| Token | Value | Utility |
|-------|-------|---------|
| `--radius-control` | 12px | `rounded-control` |
| `--radius-card` | 16px | `rounded-card` |
| `--radius-bubble` | 20px | `rounded-bubble` |
| `--radius-pill` | 32px | `rounded-pill` |

## Layout

| Token | Value | Utility |
|-------|-------|---------|
| `--max-width-phone` | 402px | `max-w-phone` |
| `--max-width-card` | 340px | `max-w-card` |

## Shadows

| Token | Utility |
|-------|---------|
| `--shadow-phone` | `shadow-phone` |
| `--shadow-icon` | `shadow-icon` |
| `--shadow-card` | `shadow-card` |
| `--shadow-soft` | `shadow-soft` |
| `--shadow-promo` | `shadow-promo` |
| `--shadow-drawer` | `shadow-drawer` |
| `--shadow-menu` | `shadow-menu` |
| `--shadow-cta` | `shadow-cta` |

All use green-tinted rgba — do not replace with purple/neutral glow.
