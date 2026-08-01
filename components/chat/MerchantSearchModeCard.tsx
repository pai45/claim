"use client";

import type { BenefitType } from "@/lib/merchants/types";

type MerchantSearchModeCardProps = {
  benefitType?: BenefitType;
  onSelect: (mode: "name" | "nearest") => void;
  disabled?: boolean;
};

export function MerchantSearchModeCard({
  onSelect,
  disabled,
}: MerchantSearchModeCardProps) {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        How do you want to search?
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Type a name or find merchants near you
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect("name")}
          className="rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-3 text-left disabled:opacity-50"
        >
          <span className="block font-sans text-sm font-semibold text-pine">
            Type merchant name
          </span>
          <span className="mt-0.5 block font-sans text-[11px] text-subtle">
            Match against allowed merchants
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect("nearest")}
          className="rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-3 text-left disabled:opacity-50"
        >
          <span className="block font-sans text-sm font-semibold text-pine">
            Find nearest near you
          </span>
          <span className="mt-0.5 block font-sans text-[11px] text-subtle">
            Uses GPS to show 3 closest options
          </span>
        </button>
      </div>
    </div>
  );
}
