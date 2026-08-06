# EB+Claims Design Tokens Reference & Enforcement Rules

All design tokens are defined in `app/globals.css` using Tailwind CSS v4 `@theme inline` directives.
Non-Tailwind contexts (SVG fills/strokes, Canvas, and `MagicText`) should import `colors` from `@/lib/ui/colors`.

---

## 1. Strict Brand Color Mappings

| Design Token | Hex Code | Tailwind Background | Tailwind Text | Tailwind Border | Strict Intent & Usage |
|---|---|---|---|---|---|
| `--color-pine` | `#0F3F37` | `bg-pine` | `text-pine` | `border-pine` | Primary brand deep ink, dark typography, focused input borders |
| `--color-pine-primary` | `#005656` | `bg-pine-primary` | `text-pine-primary` | `border-pine-primary` | Main interactive color, primary CTA buttons, active states |
| `--color-pine-dark` | `#003434` | `bg-pine-dark` | `text-pine-dark` | `border-pine-dark` | Deepest brand contrast, button active presses |
| `--color-mint` | `#36CC8B` | `bg-mint` | `text-mint` | `border-mint` | Brand accent, badges, progress bars, highlights |

### Forbidden Color Substitutions
| ❌ Forbidden Value | ✅ Mandatory Token Equivalent |
|---|---|
| `#005656`, `#005555`, `#006666` | `bg-pine-primary` / `text-pine-primary` |
| `#0F3F37`, `#111827`, `#000000` | `text-pine` / `text-ink` |
| `#36CC8B`, `#10B981`, `#22C55E` | `bg-mint` / `text-mint` / `bg-success` |
| `#6B7280`, `#9CA3AF`, `#888888` | `text-ink-secondary` / `text-muted` |
| `bg-gray-50`, `bg-gray-100`, `bg-slate-100` | `bg-surface` / `bg-surface-chat` / `bg-surface-muted` |
| `border-gray-200`, `border-gray-300` | `border-border-line` / `border-border-soft` / `border-input-border` |

---

## 2. Surface & Background Tokens

| Token Variable | Hex Code | Utility Class | Purpose & Location |
|---|---|---|---|
| `--color-surface` | `#F8FAF8` | `bg-surface` | Default screen background (`AppShell variant="surface"`) |
| `--color-surface-chat` | `#EEF5F2` | `bg-surface-chat` | Chat screen background (`AppShell variant="chat"`) |
| `--color-surface-muted` | `#E8EBE9` | `bg-surface-muted` | Background behind phone frame / secondary screens |
| `--color-surface-tint` | `#EAF3F0` | `bg-surface-tint` | Icon wells, summary header backgrounds, badge wells |
| `--color-surface-tint-strong` | `#E8F2EE` | `bg-surface-tint-strong` | Highlighted card section banners |
| `--color-input` | `#F4F8F6` | `bg-input` | Input shell default background |
| `--color-input-soft` | `#F8FBFA` | `bg-input-soft` | Text field and textarea background |
| `--color-login-canvas` | `#DBF5E7` | `bg-login-canvas` | Login/onboarding Lottie backdrop seamless blend |
| `--color-bg` | `#F1F1F1` | `bg-bg` | Neutral app canvas |

---

## 3. Ink & Text Tokens

| Token Variable | Hex Code | Utility Class | Purpose |
|---|---|---|---|
| `--color-ink` | `#1C2725` | `text-ink` | Primary readable text, body copy, card titles |
| `--color-ink-secondary` | `#667A74` | `text-ink-secondary` | Secondary text, subtitles, timestamp labels, field headers |
| `--color-ink-tertiary` | `#8D92A3` | `text-ink-tertiary` | Subtle metadata and card hints |
| `--color-body` | `#1C2725` | `text-body` | Standard body typography color |
| `--color-muted` | `#8A9D99` | `text-muted` | Disabled text, inactive icons |
| `--color-subtle` | `#535862` | `text-subtle` | Dialog explanations, disclaimer footers |
| `--color-placeholder` | `#829490` | `placeholder:text-placeholder` | Form input placeholder text |
| `--color-cta-ink` | `#1E4E45` | `text-cta-ink` | Secondary action label ink |

---

## 4. Border Tokens

| Token Variable | Hex Code | Utility Class | Purpose |
|---|---|---|---|
| `--color-border-soft` | `#EDF0EE` | `border-border-soft` | List item dividers, subtle separators |
| `--color-border-line` | `#E5ECE8` | `border-border-line` | Standard card borders, card dividers |
| `--color-border-muted` | `#DFE5E2` | `border-border-muted` | Secondary button outline borders |
| `--color-input-border` | `#DCE7E3` | `border-input-border` | Default form field and control borders |
| `--color-border-tab` | `#D8DADF` | `border-border-tab` | Navigation tab bar border |

---

## 5. Status Tokens

| Status Intent | Token Variable | Hex Code | Background Utility | Text Utility | Border Utility |
|---|---|---|---|---|---|
| **Success** | `--color-success` | `#279E6C` | `bg-success` | `text-success` | `border-success-border` (`#D1F3DF`) |
| | `--color-success-soft` | `#F3FCF6` | `bg-success-soft` | — | — |
| | `--color-success-tint` | `#E7F6EF` | `bg-success-tint` | — | — |
| **Warning** | `--color-warning` | `#B25E00` | — | `text-warning` | `border-warning-border` (`#FEF0C7`) |
| | `--color-warning-soft` | `#FFFBEB` | `bg-warning-soft` | — | — |
| | `--color-warning-tint` | `#FFF8E8` | `bg-warning-tint` | — | — |
| | `--color-warning-ink` | `#7A5A00` | — | `text-warning-ink` | — |
| **Danger** | `--color-danger` | `#7A2E24` | — | `text-danger` | — |
| | `--color-danger-soft` | `#F4E8E6` | `bg-danger-soft` | — | — |

---

## 6. Typography Type Roles & Fonts

### Font Stacks
- Display: **PP Telegraf** (`font-display` / `var(--font-display)`)
- Sans: **Lato** (`font-sans` / `var(--font-sans)`)

### Mandatory Type Role Classes
| Class Name | Font | Size | Line Height | Weight | Color | Usage |
|---|---|---|---|---|---|---|
| `.type-screen-title` | PP Telegraf | 20px | 1.4 | 700 | `var(--color-pine)` | Top bar screen titles |
| `.type-hero` | PP Telegraf | 32px | 1.25 | 700 | `var(--color-pine-primary)` | Welcome/Greeting hero title |
| `.type-section-title` | PP Telegraf | 18px | 1.33 | 700 | `var(--color-ink)` | Section headers & card titles |
| `.type-body` | Lato | 16px | 1.5 | 400 | `var(--color-body)` | Main body paragraphs |
| `.type-body-secondary`| Lato | 14px | 1.43 | 400 | `var(--color-ink-secondary)` | Subtitle text, hints |
| `.type-field-label` | Lato | 12px | 1.33 | 700 | `var(--color-ink-secondary)` | Uppercase input field labels |
| `.type-amount` | PP Telegraf | 20px | 1.4 | 700 | `var(--color-pine)` | Currency amounts (e.g. ₹1,250) |
| `.type-section-label` | Lato | 12px | 1.33 | 700 | `var(--color-ink-secondary)` | Uppercase card group headers |

---

## 7. Spacing, Radius & Shadows (Strict 4pt Grid)

### Spacing Tokens
- `p-page` / `px-page` / `py-page` (`16px`): Page edge padding
- `p-card` / `px-card` / `py-card` (`16px`): Card interior padding
- `p-section` / `gap-section` (`24px`): Major section vertical gaps

### Radius Tokens
- `rounded-control` (`12px`): Inputs, select dropdowns, toggles, icon wells, compact action buttons
- `rounded-card` (`16px`): Cards, modals, dialog panels
- `rounded-bubble` (`20px`): Chat bubbles, attachment cards, drawer top corners (`rounded-t-bubble`)
- `rounded-pill` (`32px` / `9999px`): CTA buttons, status badges

### Green-Tinted Shadows (Mandatory)
- `shadow-phone`: `0 0 40px rgba(0, 42, 25, 0.08)`
- `shadow-card`: `2px 2px 10px rgba(0, 42, 25, 0.05)`
- `shadow-soft`: `2px 2px 8px rgba(0, 42, 25, 0.06)`
- `shadow-icon`: `4px 4px 12px rgba(0, 42, 25, 0.08)`
- `shadow-cta`: `0 6px 16px rgba(0, 86, 86, 0.18)`
- `shadow-menu`: `-8px 0 24px rgba(0, 42, 25, 0.12)`
- `shadow-drawer`: `0 -8px 32px rgba(0, 42, 25, 0.12)`
