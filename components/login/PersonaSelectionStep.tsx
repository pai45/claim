"use client";

import { PERSONA_OPTIONS } from "@/features/persona/constants";
import type { PersonaId } from "@/features/persona/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type PersonaSelectionStepProps = {
  onSelect: (id: PersonaId) => void;
};

function accessLabel(id: PersonaId): string {
  if (id === "new_user") return "EB+ only";
  if (id === "ebPlus_only") return "EB+ & UPI";
  if (id === "pluspay_only") return "PlusPay + UPI";
  if (id === "ebPlus_no_upi") return "EB+ card only";
  return "EB+ & PlusPay";
}

export function PersonaSelectionStep({ onSelect }: PersonaSelectionStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="type-section-label text-pine-primary">Demo access</p>
        <h1 className="type-screen-title">Choose a demo profile</h1>
        <p className="type-body-secondary">
          Pick a journey and product plan before signing in.
        </p>
      </div>

      <div className="flex flex-col gap-3" role="list">
        {PERSONA_OPTIONS.map((persona, index) => (
          <button
            key={persona.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(persona.id)}
            style={staggerStyle(index)}
            className="animate-rise-in flex min-h-14 w-full items-center gap-3 rounded-card border border-border-line bg-white p-card text-left shadow-card transition-colors hover:border-pine hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong font-display text-title font-bold text-pine-primary">
              {persona.profile.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="type-body block font-bold text-ink">
                {persona.profile.name}
              </span>
              <span className="type-body-secondary mt-0.5 block">
                {persona.label} · {accessLabel(persona.id)}
              </span>
            </span>
            <span className="rounded-pill border border-border-line bg-surface px-2.5 py-1 text-caption font-bold text-pine">
              {persona.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
