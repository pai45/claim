"use client";

import type { VehicleOwnership } from "@/lib/vehicle/types";
import { VEHICLE_OWNERSHIP_OPTIONS } from "@/lib/vehicle/ownership";
import { ChatOptionButton } from "./ChatOptionButton";

type VehicleOwnershipCardProps = {
  selected?: VehicleOwnership;
  onSelect: (ownership: VehicleOwnership) => void;
  disabled?: boolean;
};

export function VehicleOwnershipCard({
  selected,
  onSelect,
  disabled,
}: VehicleOwnershipCardProps) {
  return (
    <div
      role="group"
      aria-label="Vehicle ownership choices"
      className="flex w-full max-w-card flex-col gap-2"
    >
      {VEHICLE_OWNERSHIP_OPTIONS.map((option) => {
        const isSelected = selected === option.id;
        return (
          <ChatOptionButton
            key={option.id}
            aria-pressed={isSelected}
            disabled={disabled || Boolean(selected)}
            onClick={() => onSelect(option.id)}
            className={`w-fit ${
              isSelected
                ? "border-pine-primary bg-surface-tint-strong"
                : ""
            }`}
          >
            {option.label}
          </ChatOptionButton>
        );
      })}
    </div>
  );
}
