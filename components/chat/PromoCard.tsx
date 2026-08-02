import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { MagicText } from "@/components/shared/MagicText";
import { colors } from "@/lib/ui/colors";

type PromoCardProps = {
  onStart: () => void;
  disabled?: boolean;
};

export function PromoCard({ onStart, disabled }: PromoCardProps) {
  return (
    <div
      className="animate-rise-in px-page pt-0.5"
      style={{ animationDelay: "240ms" }}
    >
      <article className="relative overflow-hidden rounded-card border border-white/60 bg-white/70 p-card shadow-promo backdrop-blur-sm">
        <div className="relative z-10 flex max-w-[200px] flex-col gap-4">
          <div className="flex flex-col gap-2">
            <MagicText
              as="h3"
              text="Vehicle Registration"
              mode="chars"
              delayMs={300}
              stepMs={10}
              shimmer
              shimmerBase={colors.pine}
              className="type-section-title text-pine"
            />
            <MagicText
              as="p"
              text="Register your vehicle for tax benefits."
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
            className="animate-rise-in min-h-11 w-fit min-w-[100px] rounded-control bg-pine-primary px-3 py-2 text-caption font-bold text-white disabled:opacity-60"
            style={{ animationDelay: "460ms" }}
          >
            Start registration
          </button>
        </div>

        <Image
          src={withBasePath("/assets/vehicle-registration.png")}
          alt=""
          width={160}
          height={160}
          className="pointer-events-none absolute -bottom-1 -right-2 h-[148px] w-[148px] object-contain"
          priority
        />
      </article>
    </div>
  );
}
