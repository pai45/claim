"use client";

import type { BenefitType } from "@/lib/merchants/types";
import { ChatOptionButton } from "./ChatOptionButton";

type MerchantSearchModeCardProps = {
  benefitType?: BenefitType;
  onSelect: (mode: "name" | "nearest") => void;
  disabled?: boolean;
};

const OPTIONS: { id: "name" | "nearest"; label: string }[] = [
  { id: "name", label: "Type merchant name" },
  { id: "nearest", label: "Find nearest near you" },
];

export function MerchantSearchModeCard({
  onSelect,
  disabled,
}: MerchantSearchModeCardProps) {
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
