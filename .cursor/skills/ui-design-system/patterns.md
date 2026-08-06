# UI patterns

Canonical recipes from existing components. Copy these before inventing new class stacks.

## Non-chat screen shell

Use `AppShell` + `ScreenHeader` for dashboard, policy, claims, and similar screens.

```tsx
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

export function ExampleScreen({ onBack }: { onBack: () => void }) {
  return (
    <AppShell variant="surface">
      <ScreenHeader title="Screen title" onBack={onBack} />
      <main className="flex flex-1 flex-col gap-section overflow-y-auto px-page pb-6">
        {/* content */}
      </main>
    </AppShell>
  );
}
```

Variants: `surface` (default), `chat`, `bg`.

## Primary / secondary CTAs

Prefer CSS role classes from `app/globals.css`:

```tsx
<button type="button" className="btn-primary">Continue</button>
<button type="button" className="btn-secondary">Cancel</button>
```

In dialogs, allow height override for touch:

```tsx
<button type="button" className="btn-primary min-h-11 h-auto py-3">Confirm</button>
<button type="button" className="btn-secondary min-h-11 h-auto py-3">Cancel</button>
```

Reference: `components/shared/ConfirmDialog.tsx`. Its cancel label defaults to
"Keep my draft" for the chat-clear dialog; pass `cancelLabel` for anything else.

Compact inline CTA (chat cards / promo) when full-width 56px is wrong:

```tsx
className="min-h-11 w-fit rounded-control bg-pine-primary px-3 py-2 text-caption font-bold text-white"
```

## Text field

```tsx
className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none focus:border-pine disabled:opacity-50"
```

Field label:

```tsx
<label className="type-field-label">Merchant name</label>
```

Focus-within wrapper (icon + input):

```tsx
className="flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3 focus-within:border-pine"
```

## Interactive card shell

Chat option / form cards:

```tsx
className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card"
```

Receipt / extract cards (asymmetric chat attachment):

```tsx
className="w-full max-w-card overflow-hidden rounded-bubble rounded-tl border border-border-line bg-white"
```

Use cards only as interaction containers (forms, receipts, upload options), not decorative wrappers.

## Chat bubbles

Assistant:

```tsx
className="rounded-bubble rounded-bl-md border border-border-soft bg-white/95 px-3 py-2.5 shadow-soft"
```

User:

```tsx
className="whitespace-pre-wrap rounded-bubble rounded-br-md bg-pine-primary px-3.5 py-2.5 text-body-sm leading-5 text-white shadow-soft"
```

Reference: `components/chat/MessageBubble.tsx`.

## Brand-first empty state

Logo → hero line → one supporting sentence. Do not add stats strips or promo clutter above the fold.

```tsx
import { AppIcon } from "@/components/shared/AppIcon";
import { MagicText } from "@/components/shared/MagicText";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";

<section className="flex flex-col gap-3.5 px-page pt-2">
  <AppIcon src={BRAND_ASSETS.logo} alt="Benefits Assistant" size={64} priority />
  <MagicText
    as="h2"
    text="Hey Priya"
    mode="chars"
    shimmer
    shimmerBase={colors.pinePrimary}
    className="type-hero"
  />
  <MagicText
    as="p"
    text="I can help you claim reimbursements. What would you like to do?"
    mode="words"
    className="type-body max-w-[20rem]"
  />
</section>
```

Reference: `components/chat/ChatGreeting.tsx`.

## Confirm dialog

Use `ConfirmDialog` + `useModalFocus`. Do not build a second modal system.

```tsx
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
```

Shell constraints: `fixed inset-0 z-[70] mx-auto max-w-phone`, panel `rounded-card bg-white p-5 shadow-menu`.

## Status chips

Reuse `CLAIM_STATUS_STYLES` from `features/claims-history/constants.ts` (`label` + token `className`). Prefer theme status tokens (`success-*`, `warning-*`, `danger-*`) when adding new status UI.

```tsx
<span className={`rounded-pill border px-2 py-0.5 text-caption ${status.className}`}>
  {status.label}
</span>
```

Inline soft alerts:

```tsx
className="rounded-control bg-danger-soft px-3 py-2 text-body-sm text-danger"
className="rounded-control bg-warning-tint px-3 py-2 text-caption text-warning-ink"
className="rounded-control bg-success-tint" // icon wells
```

## List enter motion

```tsx
import { staggerStyle } from "@/lib/ui/staggerStyle";

<li className="animate-rise-in" style={staggerStyle(index)}>
  …
</li>
```

## Assets and icons

```tsx
import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS, UI_ICONS, CATEGORY_ICONS } from "@/lib/ui/assets";

<AppIcon src={UI_ICONS.menu} alt="" size={24} />
```

Add new paths in `lib/ui/assets.ts`. Always go through `AppIcon` / `withBasePath` for GitHub Pages base path.

## Amount display

```tsx
<p className="type-amount">₹1,250</p>
```

## Imports

```tsx
import { AppShell } from "@/components/shared/AppShell";
import { AppIcon } from "@/components/shared/AppIcon";
import { MagicText } from "@/components/shared/MagicText";
import { colors } from "@/lib/ui/colors";
import { BRAND_ASSETS, UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { withBasePath } from "@/lib/basePath";
```

Use `@/` alias. Direct file imports — no barrel `index.ts`.
