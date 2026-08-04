"use client";

import { EmployeeBenefitsHost } from "@/components/host/EmployeeBenefitsHost";
import { LoginScreen } from "@/components/login/LoginScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useAuthSession } from "@/features/auth/useAuthSession";
import { useOnboardingProgress } from "@/features/onboarding/useOnboardingProgress";

/**
 * Gates the home screen only. Deep links to /dashboard, /profile and friends
 * stay open — this is an entry journey, not a security boundary.
 *
 * Order: hydrate → login → onboarding → EB home.
 */
export function HomeEntry() {
  const { session, isHydrated: authHydrated } = useAuthSession();
  const { completed, isHydrated: onboardingHydrated } = useOnboardingProgress();

  if (!authHydrated || !onboardingHydrated) {
    return <div className="h-dvh w-full bg-login-canvas" aria-hidden="true" />;
  }

  if (!session) return <LoginScreen />;

  if (!completed) return <OnboardingShell />;

  return <EmployeeBenefitsHost />;
}
