import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { MagicText } from "@/components/shared/MagicText";
import { colors } from "@/lib/ui/colors";
import type { BannerCardContent } from "@/features/chat/bannerCards";

type PromoCardProps = {
  card: BannerCardContent;
  onStart: () => void;
  disabled?: boolean;
};

/**
 * The evergreen vehicle promo. Copy comes from the banner card so the carousel
 * holds one list of content, but the illustration and its bleed off the
 * bottom-right corner are specific to this card.
 */
export function PromoCard({ card, onStart, disabled }: PromoCardProps) {
  const illustrationSrc =
    card.id === "driver_registration"
      ? withBasePath("/assets/driver-registration.png")
      : withBasePath("/assets/vehicle-registration.png");

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-card border border-white/60 bg-white/70 p-card shadow-promo backdrop-blur-sm">
      {/* Kept clear of the illustration. */}
      <div className="relative z-10 flex h-full max-w-50 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <MagicText
            as="h3"
            text={card.title}
            mode="chars"
            delayMs={300}
            stepMs={10}
            shimmer
            shimmerBase={colors.pine}
            className="type-section-title text-pine"
          />
          <MagicText
            as="p"
            text={card.body}
            mode="words"
            delayMs={360}
            stepMs={20}
            className="type-body-secondary text-subtle"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onStart}
          className="animate-rise-in mt-auto min-h-11 w-fit min-w-25 rounded-control bg-pine-primary px-3 py-2 text-caption font-bold text-white disabled:opacity-60"
          style={{ animationDelay: "460ms" }}
        >
          {card.ctaLabel}
        </button>
      </div>

      <Image
        src={illustrationSrc}
        alt=""
        width={160}
        height={160}
        className="pointer-events-none absolute -bottom-1 -right-2 h-37 w-37 object-contain"
        // Native image dragging would otherwise pre-empt the carousel's own.
        draggable={false}
        priority
      />
    </article>
  );
}
