"use client";

import type { BenefitType } from "@/lib/merchants/types";

type MerchantSearchModeCardProps = {
  benefitType?: BenefitType;
  onSelect: (mode: "name" | "nearest") => void;
  disabled?: boolean;
};

const OPTIONS: { id: "name" | "nearest"; label: string }[] = [
  { id: "name", label: "Type merchant name" },
  { id: "nearest", label: "Find nearest near you" },
];

const pillClass =
  "rounded-tl rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] border border-input-border bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-60";

export function MerchantSearchModeCard({
  onSelect,
  disabled,
}: MerchantSearchModeCardProps) {
  return (
    <div className="flex flex-wrap content-start gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          className={pillClass}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
