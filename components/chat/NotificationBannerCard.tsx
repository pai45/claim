import Link from "next/link";
import { MagicText } from "@/components/shared/MagicText";
import { colors } from "@/lib/ui/colors";
import type { BannerCardContent } from "@/features/chat/bannerCards";

const CTA_CLASS =
  "animate-rise-in mt-auto flex min-h-11 w-fit min-w-25 items-center justify-center rounded-control bg-pine-primary px-3 py-2 text-caption font-bold text-white disabled:opacity-60";

type NotificationBannerCardProps = {
  card: BannerCardContent;
  /** Opens the attach drawer for cards whose action is `attach`. */
  onUploadBill: () => void;
  disabled?: boolean;
};

/**
 * Text-only sibling of `PromoCard`: same glass shell, but no illustration, so
 * the copy runs the full width of the card.
 */
export function NotificationBannerCard({
  card,
  onUploadBill,
  disabled,
}: NotificationBannerCardProps) {
  const isAlert = card.tone === "alert";
  const titleColor = isAlert ? colors.danger : colors.pine;

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-card border border-white/60 bg-white/70 p-card shadow-promo backdrop-blur-sm">
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <MagicText
            as="h3"
            text={card.title}
            mode="chars"
            delayMs={300}
            stepMs={10}
            shimmer
            shimmerBase={titleColor}
            className={`type-section-title ${isAlert ? "text-danger" : "text-pine"}`}
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

        {card.action.kind === "claim" ? (
          <Link
            href={`/claim-details/?id=${encodeURIComponent(card.action.claimId)}&from=assistant`}
            className={CTA_CLASS}
            style={{ animationDelay: "460ms" }}
          >
            {card.ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={onUploadBill}
            className={CTA_CLASS}
            style={{ animationDelay: "460ms" }}
          >
            {card.ctaLabel}
          </button>
        )}
      </div>
    </article>
  );
}
