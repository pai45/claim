"use client";

import { FEATURE_WALLETS } from "@/features/onboarding/constants";
import { colors } from "@/lib/ui/colors";
import { OnboardingHeader } from "./OnboardingHeader";
import { PrimaryFooter } from "./PrimaryFooter";
import { WalletGlyph } from "./WalletGlyphs";

type IntroStepProps = {
  onContinue: () => void;
  onBack?: () => void;
};

export function IntroStep({ onContinue, onBack }: IntroStepProps) {
  return (
    <>
      <OnboardingHeader onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4">
        <section
          className="relative overflow-hidden rounded-card p-card text-white shadow-card"
          style={{
            background: `linear-gradient(145deg, ${colors.pinePrimary} 0%, ${colors.pine} 55%, ${colors.pineDark} 100%)`,
          }}
        >
          <p className="text-caption font-bold tracking-wide text-white/80">
            pine labs
          </p>
          <h2 className="mt-4 font-display text-title font-bold leading-snug">
            Activate your{" "}
            <span style={{ color: colors.mint }}>Employee Benefits</span>
          </h2>
          <p className="mt-2 text-body-sm leading-5 text-white/85">
            Infosys has invited you to activate your exclusive Employee Benefits
            program.
          </p>
        </section>

        <h3 className="type-section-title mt-6 mb-3">Feature & Benefits</h3>
        <ul className="flex flex-col gap-3">
          {FEATURE_WALLETS.map((wallet) => (
            <li
              key={wallet.id}
              className="flex items-center gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control"
                style={{ background: wallet.bg, color: wallet.ink }}
              >
                <WalletGlyph id={wallet.id} color={wallet.ink} />
              </span>
              <span className="min-w-0">
                <span className="type-body block font-bold">{wallet.title}</span>
                <span className="type-body-secondary mt-0.5 block">
                  {wallet.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </main>
      <PrimaryFooter label="Activate Benefits Program" onClick={onContinue} />
    </>
  );
}
