"use client";

import { useEffect, useState } from "react";
import { EmployeeBenefitsHost } from "@/components/host/EmployeeBenefitsHost";
import { LoginScreen } from "@/components/login/LoginScreen";
import { MpinFlow } from "@/components/mpin/MpinFlow";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { isDirectClaimsEntry } from "@/features/auth/directClaimsEntry";
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
   * Seeded from the tab session, not from a fresh `false`: this gate only
   * renders on the home screen, so every trip out to /profile, /dashboard or
   * /transactions and back unmounts it. Held in component state alone, that
   * round trip demands the PIN again. Closing the tab still starts locked.
   */
  const [unlocked, setUnlocked] = useState(readUnlocked);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const directClaimsEntry = isDirectClaimsEntry(
        window.location.hash,
        window.location.search,
      );

      if (directClaimsEntry) {
        // The dedicated deep link always demonstrates Vishal's returning-user
        // assistant, regardless of which persona was used in an earlier demo.
        setActivePersonaId(DEFAULT_PERSONA_ID);
      }

      setEntryIntent(directClaimsEntry ? "claims" : "standard");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function unlock() {
    markMpinUnlocked();
    setUnlocked(true);
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

  if (!unlocked) return <MpinLockScreen onUnlock={unlock} />;

  if (!completed) return <OnboardingShell />;

  return <EmployeeBenefitsHost />;
}
