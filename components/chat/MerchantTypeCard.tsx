"use client";

import type { BenefitType } from "@/lib/merchants/types";

type MerchantTypeCardProps = {
  onSelect: (benefitType: BenefitType) => void;
  disabled?: boolean;
};

export function MerchantTypeCard({ onSelect, disabled }: MerchantTypeCardProps) {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        Merchant type
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Is this for fuel or meal benefits?
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect("fuel")}
          className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-3 text-center disabled:opacity-50"
        >
          <span className="font-sans text-sm font-semibold text-pine">Fuel</span>
          <span className="font-sans text-[11px] text-subtle">
            Petrol pumps
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect("meal")}
          className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-3 text-center disabled:opacity-50"
        >
          <span className="font-sans text-sm font-semibold text-pine">Meal</span>
          <span className="font-sans text-[11px] text-subtle">
            Food merchants
          </span>
        </button>
      </div>
    </div>
  );
}
