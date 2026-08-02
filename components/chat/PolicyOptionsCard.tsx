"use client";

import {
  POLICY_LIST_ITEMS,
  type PolicyTabId,
} from "@/features/policy/constants";
import { ChatOptionButton } from "./ChatOptionButton";

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
        <ChatOptionButton
          key={item.id}
          disabled={disabled}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </ChatOptionButton>
      ))}
    </div>
  );
}
