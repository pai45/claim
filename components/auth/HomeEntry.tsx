"use client";

import { useState } from "react";
import { EmployeeBenefitsHost } from "@/components/host/EmployeeBenefitsHost";
import { LoginScreen } from "@/components/login/LoginScreen";
import { MpinFlow } from "@/components/mpin/MpinFlow";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useAuthSession } from "@/features/auth/useAuthSession";
import { useMpin } from "@/features/auth/useMpin";
import { useOnboardingProgress } from "@/features/onboarding/useOnboardingProgress";

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
   * Deliberately component state, never persisted: a fresh mount is exactly
   * what "challenge on every app load" means, so a reload starts locked again.
   */
  const [unlocked, setUnlocked] = useState(false);

  if (!authHydrated || !onboardingHydrated || !mpinHydrated) {
    return <div className="h-dvh w-full bg-login-canvas" aria-hidden="true" />;
  }

  if (!session) return <LoginScreen />;

  // Creating the PIN is proof enough — asking for it again on the next screen
  // would read as the flow not having registered it.
  if (!mpinSet) return <MpinFlow onDone={() => setUnlocked(true)} />;

  if (!unlocked) return <MpinLockScreen onUnlock={() => setUnlocked(true)} />;

  if (!completed) return <OnboardingShell />;

  return <EmployeeBenefitsHost />;
}
