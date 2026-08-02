"use client";

import type { BenefitType } from "@/lib/merchants/types";

type MerchantTypeCardProps = {
  onSelect: (benefitType: BenefitType) => void;
  disabled?: boolean;
};

const OPTIONS: { id: BenefitType; label: string }[] = [
  { id: "fuel", label: "Fuel" },
  { id: "meal", label: "Meal" },
];

const pillClass =
  "rounded-tl rounded-tr-bubble rounded-br-bubble rounded-bl-bubble border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine disabled:opacity-60";

export function MerchantTypeCard({ onSelect, disabled }: MerchantTypeCardProps) {
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
