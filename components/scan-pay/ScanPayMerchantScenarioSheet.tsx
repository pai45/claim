"use client";

import type { Dispatch } from "react";
import { ScanPayDrawer } from "@/components/scan-pay/ScanPayDrawer";
import { ScanPayIcon, type ScanPayIconName } from "@/components/scan-pay/ScanPayIcons";
import type {
  ScanPayAction,
  ScanPayMerchantType,
  ScanPayState,
} from "@/features/scan-pay/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type SelectableMerchantType = Exclude<ScanPayMerchantType, "unclassified">;

const MERCHANT_SCENARIOS: readonly {
  id: SelectableMerchantType;
  label: string;
  description: string;
  badge: string;
  icon: ScanPayIconName;
  toneClass: string;
  iconClass: string;
}[] = [
  {
    id: "meal",
    label: "Meal merchant",
    description: "Meal Wallet first, with optional Reimbursement split",
    badge: "Meal",
    icon: "walletMeal",
    toneClass: "bg-warning-soft",
    iconClass: "text-warning",
  },
  {
    id: "fuel",
    label: "Fuel merchant",
    description: "Fuel Wallet first, with optional Reimbursement split",
    badge: "Fuel",
    icon: "walletFuel",
    toneClass: "bg-surface-tint",
    iconClass: "text-pine-primary",
  },
  {
    id: "luxury",
    label: "Luxury brand",
    description: "Payment is available from Reimbursement Wallet only",
    badge: "Luxury",
    icon: "walletReimbursement",
    toneClass: "bg-surface-tint-strong",
    iconClass: "text-pine-dark",
  },
  {
    id: "unsupported",
    label: "Unsupported merchant",
    description: "This merchant cannot accept an EB+ wallet payment",
    badge: "Blocked",
    icon: "warning",
    toneClass: "bg-danger-soft",
    iconClass: "text-danger",
  },
] as const;

export function ScanPayMerchantScenarioSheet({
  state,
  dispatch,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
}) {
  return (
    <ScanPayDrawer
      open={state.step === "merchantScenarioPicker"}
      title="Choose merchant scenario"
      description="Select the detected QR merchant type to continue."
      onClose={() => dispatch({ type: "BACK" })}
    >
      <div className="flex flex-col gap-3" role="list">
        {MERCHANT_SCENARIOS.map((scenario, index) => (
          <button
            key={scenario.id}
            type="button"
            role="listitem"
            onClick={() =>
              dispatch({
                type: "SELECT_MERCHANT_SCENARIO",
                merchantType: scenario.id,
              })
            }
            style={staggerStyle(index)}
            className="animate-rise-in flex min-h-14 w-full items-center gap-3 rounded-card border border-border-line bg-white p-card text-left shadow-card transition-colors hover:border-pine hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-primary"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${scenario.toneClass} ${scenario.iconClass}`}
              aria-hidden="true"
            >
              <ScanPayIcon name={scenario.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="type-body block font-bold text-ink">
                {scenario.label}
              </span>
              <span className="type-body-secondary mt-0.5 block">
                {scenario.description}
              </span>
            </span>
            <span className="rounded-pill border border-border-line bg-surface px-2.5 py-1 text-caption font-bold text-pine">
              {scenario.badge}
            </span>
          </button>
        ))}
      </div>
    </ScanPayDrawer>
  );
}
