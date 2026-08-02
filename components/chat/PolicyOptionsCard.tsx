"use client";

import {
  POLICY_LIST_ITEMS,
  type PolicyTabId,
} from "@/features/policy/constants";

type PolicyOptionsCardProps = {
  onSelect: (categoryId: PolicyTabId) => void;
  disabled?: boolean;
};

export function PolicyOptionsCard({
  onSelect,
  disabled,
}: PolicyOptionsCardProps) {
  return (
    <div className="flex flex-wrap content-start gap-2">
      {POLICY_LIST_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.id)}
          className="rounded-tl rounded-tr-bubble rounded-br-bubble rounded-bl-bubble border border-input-border bg-white px-4 py-2.5 disabled:opacity-60"
        >
          <span className="text-body-sm font-bold text-pine">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
