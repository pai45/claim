import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { MagicText } from "@/components/shared/MagicText";

type PromoCardProps = {
  onStart: () => void;
  disabled?: boolean;
};

export function PromoCard({ onStart, disabled }: PromoCardProps) {
  return (
    <div
      className="animate-rise-in px-4 pt-1"
      style={{ animationDelay: "1380ms" }}
    >
      <article className="relative overflow-hidden rounded-xl bg-white/75 p-4 shadow-[4px_4px_8px_rgba(0,42,25,0.04)]">
        <div className="relative z-10 flex max-w-[200px] flex-col gap-4">
          <div className="flex flex-col gap-2">
            <MagicText
              as="h3"
              text="Vehicle Registration"
              mode="chars"
              delayMs={1480}
              stepMs={24}
              shimmer
              shimmerBase="#0F3F37"
              className="font-display text-lg font-bold leading-6 text-pine"
            />
            <MagicText
              as="p"
              text="Register your vehicle for tax benefits."
              mode="words"
              delayMs={1720}
              stepMs={50}
              className="font-sans text-xs font-normal leading-4 text-subtle"
            />
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onStart}
            className="animate-rise-in w-fit min-w-[100px] rounded-md bg-pine-primary px-3 py-2 font-sans text-xs font-bold leading-4 text-white disabled:opacity-60"
            style={{ animationDelay: "1980ms" }}
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
