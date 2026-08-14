import type { PersonaId } from "@/features/persona/types";

export const APP_DOWNLOAD_DURATION_MS = 4_000;
/**
 * Long enough for the splash wordmark to assemble, hold, and dissolve. The
 * animation budget is set in `components/app-install/newUserInstallJourney.css`
 * — the cascade and `+` pop finish at 1.18s and the dissolve runs 2.26–2.60s,
 * so shortening this cuts the logo off mid-exit.
 */
export const APP_SPLASH_DURATION_MS = 2_600;

export type InstallJourneyPhase =
  | "whatsapp"
  | "store"
  | "downloading"
  | "installed"
  | "splash";

export type InstallJourneyState = {
  phase: InstallJourneyPhase;
  progress: number;
};

export type InstallJourneyAction =
  | { type: "open-store" }
  | { type: "start-download" }
  | { type: "sync-download"; elapsedMs: number }
  | { type: "back-to-whatsapp" }
  | { type: "open-app" };

export const initialInstallJourneyState: InstallJourneyState = {
  phase: "whatsapp",
  progress: 0,
};

export function downloadProgress(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs)) return 0;
  return Math.min(
    100,
    Math.max(0, Math.floor((elapsedMs / APP_DOWNLOAD_DURATION_MS) * 100)),
  );
}

export function shouldShowInstallJourney(
  personaId: PersonaId | null,
  completedForSelection: boolean,
): boolean {
  return personaId === "new_user" && !completedForSelection;
}

export function installJourneyReducer(
  state: InstallJourneyState,
  action: InstallJourneyAction,
): InstallJourneyState {
  switch (action.type) {
    case "open-store":
      return state.phase === "whatsapp"
        ? { phase: "store", progress: 0 }
        : state;
    case "start-download":
      return state.phase === "store"
        ? { phase: "downloading", progress: 0 }
        : state;
    case "sync-download": {
      if (state.phase !== "downloading") return state;
      const progress = downloadProgress(action.elapsedMs);
      return progress === 100
        ? { phase: "installed", progress: 100 }
        : { ...state, progress };
    }
    case "back-to-whatsapp":
      return state.phase === "store" ||
        state.phase === "downloading" ||
        state.phase === "installed"
        ? initialInstallJourneyState
        : state;
    case "open-app":
      return state.phase === "installed"
        ? { phase: "splash", progress: 100 }
        : state;
    default:
      return state;
  }
}
