"use client";

import type { BenefitType } from "@/lib/merchants/types";
import { ChatOptionButton } from "./ChatOptionButton";

type MerchantTypeCardProps = {
  onSelect: (benefitType: BenefitType) => void;
  disabled?: boolean;
};

const OPTIONS: { id: BenefitType; label: string }[] = [
  { id: "meal", label: "Meal" },
];

export function MerchantTypeCard({ onSelect, disabled }: MerchantTypeCardProps) {
  return (
    <div className="flex flex-wrap content-start gap-2">
      {OPTIONS.map((option) => (
        <ChatOptionButton
          key={option.id}
          disabled={disabled}
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </ChatOptionButton>
      ))}
    </div>
  );
}
