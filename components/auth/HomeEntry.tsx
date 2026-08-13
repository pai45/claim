"use client";

import { useEffect, useState } from "react";
import { EmployeeBenefitsHost } from "@/components/host/EmployeeBenefitsHost";
import { LoginScreen } from "@/components/login/LoginScreen";
import { MpinFlow } from "@/components/mpin/MpinFlow";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import {
  resolveClaimsEntry,
  takeInAppClaimsEntry,
} from "@/features/auth/directClaimsEntry";
import { isMpinUnlocked, markMpinUnlocked } from "@/features/auth/mpinStorage";
import { useAuthSession } from "@/features/auth/useAuthSession";
import { useMpin } from "@/features/auth/useMpin";
import { useOnboardingProgress } from "@/features/onboarding/useOnboardingProgress";
import { DEFAULT_PERSONA_ID } from "@/features/persona/constants";
import { setActivePersonaId } from "@/features/persona/store";

type EntryIntent = "checking" | "claims" | "standard";

/**
 * Safe to read straight into state: every branch below the hydration guard is
 * gated on flags that start false, so the first client render matches the
 * server's regardless of what this returns.
 */
function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return isMpinUnlocked();
}

/**
 * Gates the home screen only. Deep links to /dashboard, /profile and friends
 * stay open — this is an entry journey, not a security boundary.
 *
 * Order: hydrate → login → MPIN setup → MPIN unlock → onboarding → EB home.
 * A first-load /#claims intent is the sole exception and opens Vishal's
 * assistant directly.
 */
export function HomeEntry() {
  const { session, isHydrated: authHydrated } = useAuthSession();
  const { isSet: mpinSet, isHydrated: mpinHydrated } = useMpin();
  const { completed, isHydrated: onboardingHydrated } = useOnboardingProgress();
  const [entryIntent, setEntryIntent] = useState<EntryIntent>("checking");

  /**
   * The unlock itself lives in sessionStorage. This state is only a render
   * revision for the MPIN screens owned by HomeEntry; reading sessionStorage
   * below also picks up MPIN creation completed inside LoginScreen before the
   * auth-session update re-renders this component.
   */
  const [, setUnlockRevision] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const entry = resolveClaimsEntry(
        window.location.hash,
        window.location.search,
        takeInAppClaimsEntry(),
      );

      if (entry.shouldSelectDefaultPersona) {
        // The dedicated deep link always demonstrates Vishal's returning-user
        // assistant, regardless of which persona was used in an earlier demo.
        setActivePersonaId(DEFAULT_PERSONA_ID);
      }

      setEntryIntent(entry.isClaimsEntry ? "claims" : "standard");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function unlock() {
    markMpinUnlocked();
    setUnlockRevision((revision) => revision + 1);
  }

  if (
    entryIntent === "checking" ||
    (entryIntent === "standard" &&
      (!authHydrated || !onboardingHydrated || !mpinHydrated))
  ) {
    return <div className="h-dvh w-full bg-login-canvas" aria-hidden="true" />;
  }

  if (entryIntent === "claims") return <EmployeeBenefitsHost />;

  if (!session) return <LoginScreen />;

  // Creating the PIN is proof enough — asking for it again on the next screen
  // would read as the flow not having registered it.
  if (!mpinSet) return <MpinFlow onDone={unlock} />;

  if (!readUnlocked()) return <MpinLockScreen onUnlock={unlock} />;

  if (!completed) return <OnboardingShell />;

  return <EmployeeBenefitsHost />;
}
