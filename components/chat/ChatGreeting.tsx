"use client";

import { useActivePersona } from "@/features/persona/useActivePersona";
import { MagicText } from "@/components/shared/MagicText";
import { BenefitsLogo } from "@/components/shared/BenefitsLogo";
import { colors } from "@/lib/ui/colors";

export function ChatGreeting() {
  const { persona } = useActivePersona();

  return (
    <section className="flex flex-col gap-3.5 px-page pt-2">
      <div className="animate-rise-in" style={{ animationDelay: "20ms" }}>
        <BenefitsLogo size={64} label="Benefits Assistant" />
      </div>
      <MagicText
        as="h2"
        text={`Hey ${persona.profile.name.split(' ')[0]} 👋`}
        mode="chars"
        delayMs={30}
        stepMs={14}
        shimmer
        shimmerBase={colors.pinePrimary}
        className="type-hero chat-greeting-title"
      />
      <MagicText
        as="p"
        text="Ask me anything! I can help you upload bills, retrieve bill details, and find nearby merchants."
        mode="words"
        delayMs={120}
        stepMs={22}
        className="type-body max-w-[21rem]"
      />
    </section>
  );
}
