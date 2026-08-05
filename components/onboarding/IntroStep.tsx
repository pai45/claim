"use client";

import Image from "next/image";
import { FEATURE_WALLETS } from "@/features/onboarding/constants";
import { withBasePath } from "@/lib/basePath";
import { PrimaryFooter } from "./PrimaryFooter";
import { WalletGlyph } from "./WalletGlyphs";

type IntroStepProps = {
  onContinue: () => void;
  onBack?: () => void;
};

export function IntroStep({ onContinue }: IntroStepProps) {
  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-4">
        <section className="benefits-activation-hero" aria-labelledby="activation-title">
          <span className="benefits-activation-glow benefits-activation-glow-top" aria-hidden="true" />
          <span className="benefits-activation-glow benefits-activation-glow-side" aria-hidden="true" />
          <span className="benefits-activation-dot benefits-activation-dot-large" aria-hidden="true" />
          <span className="benefits-activation-dot benefits-activation-dot-small" aria-hidden="true" />

          <Image
            className="benefits-activation-logo"
            src={withBasePath("/assets/pine-labs-logo-white.svg")}
            alt="Pine Labs"
            width={80}
            height={21}
            priority
          />

          <div className="benefits-activation-copy">
            <h2 id="activation-title">
              <span>Activate your</span>
              <span>Employee Benefits</span>
            </h2>
            <p>
              <strong>Infosys</strong>{" "}
              <span>
                has invited you to activate your exclusive Employee Benefits
                program.
              </span>
            </p>
          </div>
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
