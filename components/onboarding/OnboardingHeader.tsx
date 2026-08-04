"use client";

import { BackNavigationButton } from "@/components/shared/BackNavigationButton";

type OnboardingHeaderProps = {
  title?: string;
  onBack?: () => void;
  subtitle?: string;
};

export function OnboardingHeader({
  title,
  onBack,
  subtitle,
}: OnboardingHeaderProps) {
  return (
    <header className="w-full shrink-0 bg-white px-page pb-3 pt-2">
      <div className="flex items-start gap-3">
        {onBack ? (
          <BackNavigationButton onClick={onBack} />
        ) : (
          <span className="h-11 w-11 shrink-0" aria-hidden="true" />
        )}
        {title ? (
          <div className="min-w-0 flex-1 pt-1.5">
            <h1 className="type-screen-title">{title}</h1>
            {subtitle ? (
              <p className="type-body-secondary mt-1">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
