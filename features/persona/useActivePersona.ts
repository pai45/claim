"use client";

import { useSyncExternalStore } from "react";
import {
  getActivePersonaId,
  setActivePersonaId,
  subscribeToPersona,
} from "./store";
import { DEFAULT_PERSONA_ID, getPersonaConfig } from "./constants";
import {
  isEbPlusActivationComplete,
  subscribeToEbPlusActivation,
} from "@/features/onboarding/ebPlusActivation";
import { resolveEffectivePersona } from "./effective";
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
  const ebPlusActivated = useSyncExternalStore(
    subscribeToEbPlusActivation,
    isEbPlusActivationComplete,
    () => false,
  );

  function setPersonaId(id: PersonaId) {
    setActivePersonaId(id);
  }

  return {
    personaId,
    persona: resolveEffectivePersona(
      getPersonaConfig(personaId),
      ebPlusActivated,
    ),
    setPersonaId,
  };
}
