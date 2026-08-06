"use client";

import { useState } from "react";
import { EmployeeBenefitsHost } from "@/components/host/EmployeeBenefitsHost";
import { LoginScreen } from "@/components/login/LoginScreen";
import { MpinFlow } from "@/components/mpin/MpinFlow";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { isMpinUnlocked, markMpinUnlocked } from "@/features/auth/mpinStorage";
import { useAuthSession } from "@/features/auth/useAuthSession";
import { useMpin } from "@/features/auth/useMpin";
import { useOnboardingProgress } from "@/features/onboarding/useOnboardingProgress";

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
 */
export function HomeEntry() {
  const { session, isHydrated: authHydrated } = useAuthSession();
  const { isSet: mpinSet, isHydrated: mpinHydrated } = useMpin();
  const { completed, isHydrated: onboardingHydrated } = useOnboardingProgress();

  /**
   * Seeded from the tab session, not from a fresh `false`: this gate only
   * renders on the home screen, so every trip out to /profile, /dashboard or
   * /transactions and back unmounts it. Held in component state alone, that
   * round trip demands the PIN again. Closing the tab still starts locked.
   */
  const [unlocked, setUnlocked] = useState(readUnlocked);

  function unlock() {
    markMpinUnlocked();
    setUnlocked(true);
  }

  if (!authHydrated || !onboardingHydrated || !mpinHydrated) {
    return <div className="h-dvh w-full bg-login-canvas" aria-hidden="true" />;
  }

  if (!session) return <LoginScreen />;

  // Creating the PIN is proof enough — asking for it again on the next screen
  // would read as the flow not having registered it.
  if (!mpinSet) return <MpinFlow onDone={unlock} />;

  if (!unlocked) return <MpinLockScreen onUnlock={unlock} />;

  if (!completed) return <OnboardingShell />;

  return <EmployeeBenefitsHost />;
}
