"use client";

import { useSyncExternalStore } from "react";
import {
  getActivePersonaId,
  setActivePersonaId,
  subscribeToPersona,
} from "./store";
import { DEFAULT_PERSONA_ID, getPersonaConfig } from "./constants";
import type { PersonaConfig, PersonaId } from "./types";

export function useActivePersona(): {
  personaId: PersonaId;
  persona: PersonaConfig;
  setPersonaId: (id: PersonaId) => void;
} {
  const personaId = useSyncExternalStore(
    subscribeToPersona,
    getActivePersonaId,
    () => DEFAULT_PERSONA_ID,
  );

  function setPersonaId(id: PersonaId) {
    setActivePersonaId(id);
  }

  return {
    personaId,
    persona: getPersonaConfig(personaId),
    setPersonaId,
  };
}
