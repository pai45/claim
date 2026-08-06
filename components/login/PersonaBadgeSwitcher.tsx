"use client";

import { useActivePersona } from "@/features/persona/useActivePersona";
import { resetDemoJourney } from "@/features/demo/reset";
import type { PersonaId } from "@/features/persona/types";

export function PersonaBadgeSwitcher() {
  const { personaId, persona, setPersonaId } = useActivePersona();

  function handleToggle() {
    const nextId: PersonaId = personaId === "returning" ? "new_user" : "returning";
    resetDemoJourney(nextId);
    setPersonaId(nextId);
  }

  return (
    <div className="flex items-center justify-center px-4 pt-2">
      <button
        type="button"
        onClick={handleToggle}
        className="group inline-flex items-center gap-2 rounded-full border border-pine/20 bg-white/80 px-3.5 py-1.5 backdrop-blur-md shadow-sm transition-all hover:bg-white hover:border-pine/40 active:scale-95"
        title="1-Click Switch Persona"
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            personaId === "new_user" ? "bg-amber-500" : "bg-pine"
          }`}
        />
        <span className="text-xs font-medium text-ink">
          Persona: <strong className="font-bold text-pine-dark">{persona.profile.name}</strong>{" "}
          <span className="text-subtle font-normal">({persona.label})</span>
        </span>
        <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[10px] font-bold text-pine-dark group-hover:bg-pine group-hover:text-white transition-colors">
          Switch ⇄
        </span>
      </button>
    </div>
  );
}
