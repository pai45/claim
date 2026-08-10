"use client";

import { useMemo, useRef, type Dispatch } from "react";
import { ScanPayDrawer } from "@/components/scan-pay/ScanPayDrawer";
import {
  ScanPayIcon,
  type ScanPayIconName,
} from "@/components/scan-pay/ScanPayIcons";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  SCAN_PAY_CATEGORIES,
  SCAN_PAY_QUICK_CATEGORIES,
  categoryById,
  merchantForType,
  walletLabel,
} from "@/features/scan-pay/fixtures";
import {
  SCAN_PAY_WALLET_IDS,
  calculateScanPayFunding,
  walletIsEligibleForMerchant,
  type ScanPayBenefitWalletId,
} from "@/features/scan-pay/funding";
import { scanPayAmountIsValid } from "@/features/scan-pay/machine";
import type {
  ScanPayAction,
  ScanPayCategory,
  ScanPayCategoryId,
  ScanPayState,
} from "@/features/scan-pay/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { useFallbackControlState } from "@/features/fallback-control/store";
import {
  WALLET_FILTER_OPTIONS,
  getWalletBalance,
} from "@/features/transactions/constants";
import { useFinancialStateVersion } from "@/features/transactions/financialState";
import { SCAN_PAY_ASSETS } from "@/lib/ui/assets";

const walletIcons: Record<ScanPayBenefitWalletId, ScanPayIconName> = {
  meal: "walletMeal",
  fuel: "walletFuel",
  misc: "walletReimbursement",
};

/**
 * Amounts stay at the display size while they fit beside the ₹ symbol; longer
 * ones step down so the whole figure keeps sitting inside the receipt.
 */
function amountFontSizeFor(amount: string): number {
  const length = Math.max(1, amount.length);
  if (length <= 6) return 48;
  if (length === 7) return 42;
  if (length <= 8) return 36;
  if (length <= 10) return 28;
  return 24;
}

const categoryEmojis: Record<ScanPayCategoryId, string> = {
  food: "🍛",
  flights: "✈️",
  ecommerce: "🛍️",
  healthcare: "🏥",
  education: "📚",
  finance: "🏦",
  transportation: "🚕",
  gaming: "🎮",
};

export function ScanPayConfirm({
  state,
  dispatch,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const { personaId } = useActivePersona();
  const fallback = useFallbackControlState();
  const financialVersion = useFinancialStateVersion();
  void financialVersion;
  const amountValid = scanPayAmountIsValid(state.amount);
  const merchant = merchantForType(state.merchantType);
  const balances = useMemo(
    () => {
      void financialVersion;
      return {
        meal: getWalletBalance("meal", personaId).amount,
        fuel: getWalletBalance("fuel", personaId).amount,
        misc: getWalletBalance("misc", personaId).amount,
      };
    },
    [financialVersion, personaId],
  );
  const fundingPlan = useMemo(
    () =>
      calculateScanPayFunding({
        amount: Number(state.amount),
        walletId: state.walletId,
        mode: state.mode,
        merchantType: state.merchantType,
        balances,
        fallback,
      }),
    [balances, fallback, state.amount, state.merchantType, state.mode, state.walletId],
  );
  const valid =
    amountValid &&
    (state.mode === "pluspay" ||
      fundingPlan.status === "single" ||
      fundingPlan.status === "split");
  const showError =
    state.amountTouched && state.amount !== "" && !amountValid;
  const amountFontSize = amountFontSizeFor(state.amount);
  const noCategory = state.scenario === "no-category";
  const quickCategories = useMemo(() => {
    if (
      state.selectedCategoryId &&
      !SCAN_PAY_QUICK_CATEGORIES.includes(state.selectedCategoryId)
    ) {
      return [state.selectedCategoryId, "food", "flights"] as const;
    }
    return SCAN_PAY_QUICK_CATEGORIES;
  }, [state.selectedCategoryId]);

  return (
    <AppShell className="scan-pay-shell relative overflow-hidden bg-white">
      <ScreenHeader
        title="Confirm Payment"
        onBack={() => dispatch({ type: "BACK" })}
      />
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-3"
        onScroll={() => amountRef.current?.blur()}
        onPointerDown={(event) => {
          if (event.target !== amountRef.current) amountRef.current?.blur();
        }}
      >
        {showError ? (
          <div className="animate-rise-in mb-3 flex items-start gap-3 rounded-card border border-danger bg-danger-soft p-card text-danger shadow-card" role="alert">
            <ScanPayIcon name="warning" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-body-sm font-bold">Enter Value Before Payment</p>
              <p className="mt-0.5 text-caption">
                Enter an amount of ₹1 or more to proceed with your transaction.
              </p>
            </div>
          </div>
        ) : null}

        <div className="scan-pay-receipt-stage shrink-0">
          <div
            className="scan-pay-receipt-tray rounded-control border border-border-muted bg-input-soft shadow-card"
            aria-hidden="true"
          />
          <section
            className="scan-pay-receipt-paper rounded-t-bubble border border-success-border bg-white px-card pb-4 pt-6 text-center shadow-icon"
            aria-label="Payment receipt"
          >
            <h2 className="scan-pay-receipt-merchant type-section-title text-pine">
              {merchant.name}
            </h2>
            <p className="scan-pay-receipt-upi mt-0.5 text-subtle">
              UPI ID: {merchant.upiId}
            </p>

            <div
              className="scan-pay-amount-field relative mx-auto mt-4 flex min-h-16 w-fit items-center justify-center"
              style={{ fontSize: `${amountFontSize}px` }}
            >
              <span className="scan-pay-amount-symbol absolute right-full top-1/2 mr-2 -mt-1 -translate-y-1/2">
                ₹
              </span>
              <span className="scan-pay-amount-sizer">
                {/* Mirrors the value so the field is sized to the exact text width. */}
                <span className="scan-pay-amount-ghost" aria-hidden="true">
                  {state.amount || "0"}
                </span>
                <input
                  ref={amountRef}
                  id="scan-pay-amount"
                  aria-label="Payment amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={state.amount}
                  onChange={(event) =>
                    dispatch({ type: "SET_AMOUNT", amount: event.target.value })
                  }
                  onBlur={() => dispatch({ type: "TOUCH_AMOUNT" })}
                  className="scan-pay-amount-input border-b-2 border-mint bg-transparent text-center outline-none transition-colors placeholder:text-muted focus:border-pine-primary"
                />
              </span>
            </div>

            <p className="scan-pay-receipt-prompt mt-9 type-body-secondary">
              Paying for
            </p>
            {noCategory ? (
              <div className="mt-3">
                {state.noteOpen ? (
                  <input
                    value={state.note}
                    onChange={(event) =>
                      dispatch({ type: "SET_NOTE", note: event.target.value })
                    }
                    placeholder="Add a payment note"
                    className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 text-body-sm text-ink outline-none placeholder:text-placeholder"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "OPEN_NOTE" })}
                    className="min-h-11 rounded-control border border-border-muted bg-white px-5 text-body-sm font-bold text-ink-secondary"
                  >
                    Add note
                  </button>
                )}
              </div>
            ) : (
              <div className="scan-pay-quick-categories mt-2">
                {quickCategories.map((id) => {
                  const category = categoryById(id)!;
                  const selectedSubcategory =
                    state.selectedCategoryId === id
                      ? category.subcategories?.find(
                          (item) => item.id === state.selectedSubcategoryId,
                        )
                      : undefined;
                  return (
                    <CategoryButton
                      key={id}
                      category={category}
                      displayLabel={selectedSubcategory?.label}
                      subcategoryIcon={
                        selectedSubcategory?.id === "bank" ||
                        selectedSubcategory?.id === "trading"
                          ? selectedSubcategory.id
                          : undefined
                      }
                      selected={state.selectedCategoryId === id}
                      onClick={() =>
                        dispatch({ type: "SELECT_CATEGORY", categoryId: id })
                      }
                    />
                  );
                })}
                <button
                  type="button"
                  onClick={() => dispatch({ type: "OPEN_CATEGORY_PICKER" })}
                  className="scan-pay-category-option flex min-h-11 flex-col items-center justify-start"
                >
                  <span
                    className="scan-pay-category-icon-well flex h-14 w-14 items-center justify-center rounded-control border border-border-line bg-white"
                    aria-hidden="true"
                  >
                    <AppIcon
                      src={SCAN_PAY_ASSETS.categoryMore}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 opacity-70"
                    />
                  </span>
                  <span className="scan-pay-category-label text-ink-tertiary">
                    More
                  </span>
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="scan-pay-brand-space relative flex min-h-28 flex-1 items-center justify-center py-6" aria-hidden="true">
          <AppIcon
            src={SCAN_PAY_ASSETS.poweredByUpi}
            alt=""
            width={80}
            height={32}
            className="relative z-10 h-6 w-auto object-contain opacity-70"
          />
        </div>
      </main>

      <footer className="relative z-20 shrink-0 rounded-t-bubble bg-white px-page pb-5 pt-3 shadow-drawer">
        {amountValid && fundingPlan.message ? (
          <div
            className={`animate-rise-in mb-3 flex items-start gap-2 rounded-card border p-3 text-caption shadow-card ${
              fundingPlan.status === "split"
                ? "border-warning-border bg-warning-soft text-warning-ink"
                : "border-danger bg-danger-soft text-danger"
            }`}
            role={fundingPlan.status === "split" ? "status" : "alert"}
            aria-live="polite"
          >
            <ScanPayIcon name="warning" className="mt-0.5 shrink-0" size={18} />
            <span className="font-bold">{fundingPlan.message}</span>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {state.mode === "pluspay" ? (
            <div className="flex min-h-14 min-w-0 items-center rounded-control px-2 text-left">
              <span className="min-w-0">
                <span className="block text-caption text-ink-secondary">Pay Using</span>
                <span className="block truncate text-body-sm font-bold text-pine">ANQ</span>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_WALLET_PICKER" })}
              className="flex min-h-14 min-w-0 items-center justify-between rounded-control px-2 text-left"
            >
            <span className="min-w-0">
              <span className="block text-caption text-ink-secondary">Pay Using</span>
              <span className="block truncate text-body-sm font-bold text-pine">
                {walletLabel(state.walletId).replace(" Wallet", "")}
              </span>
            </span>
            <ScanPayIcon name="arrow" size={16} className="rotate-90" />
            </button>
          )}
          <button
            type="button"
            disabled={!valid}
            onClick={() =>
              dispatch({
                type: "PAY",
                fundingAllocations:
                  state.mode === "benefits" ? fundingPlan.allocations : [],
              })
            }
            className="btn-primary h-auto min-h-14"
          >
            Pay
          </button>
        </div>
      </footer>

      <CategoryDrawer state={state} dispatch={dispatch} />
      <WalletDrawer state={state} dispatch={dispatch} />
    </AppShell>
  );
}

function CategoryButton({
  category,
  displayLabel,
  subcategoryIcon,
  selected,
  onClick,
}: {
  category: ScanPayCategory;
  displayLabel?: string;
  subcategoryIcon?: "bank" | "trading";
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="scan-pay-category-option flex min-h-11 flex-col items-center justify-start"
    >
      <span className="relative" aria-hidden="true">
        <span
          className={`scan-pay-category-icon-well flex h-14 w-14 items-center justify-center rounded-control border transition-colors ${
            selected
              ? "border-pine-primary bg-surface-tint text-pine-primary"
              : "border-border-line bg-white text-ink-secondary"
          }`}
        >
          <span className="scan-pay-category-glyph flex items-center justify-center">
            {subcategoryIcon ? (
              <ScanPayIcon name={subcategoryIcon} />
            ) : (
              categoryEmojis[category.id]
            )}
          </span>
        </span>
        {selected ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-pill bg-pine-primary text-white">
            <ScanPayIcon name="check" size={12} />
          </span>
        ) : null}
      </span>
      <span
        className={`scan-pay-category-label ${
          selected ? "text-pine-primary" : "text-ink-tertiary"
        }`}
      >
        {displayLabel ?? category.label}
      </span>
    </button>
  );
}

function CategoryDrawer({
  state,
  dispatch,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
}) {
  const pending = categoryById(state.pendingCategoryId);
  return (
    <ScanPayDrawer
      open={state.step === "categoryPicker"}
      title="Select category for the payment"
      description="Transaction Category"
      onClose={() => dispatch({ type: "BACK" })}
    >
      <div className="scan-pay-category-grid">
        {SCAN_PAY_CATEGORIES.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            selected={state.pendingCategoryId === category.id}
            onClick={() =>
              dispatch({ type: "SELECT_CATEGORY", categoryId: category.id })
            }
          />
        ))}
      </div>

      {pending?.subcategories?.length ? (
        <section className="mt-4 rounded-card bg-surface p-card">
          <p className="type-field-label">Select Sub-Category</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {pending.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SELECT_SUBCATEGORY",
                    subcategoryId: subcategory.id,
                  })
                }
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-control border text-body-sm font-bold ${
                  state.selectedSubcategoryId === subcategory.id
                    ? "border-pine-primary bg-white text-pine-primary"
                    : "border-border-line bg-input-soft text-ink-secondary"
                }`}
              >
                <ScanPayIcon
                  name={subcategory.id === "bank" ? "bank" : "trading"}
                />
                {subcategory.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={!state.selectedSubcategoryId}
            onClick={() => dispatch({ type: "CONFIRM_CATEGORY" })}
          >
            Confirm
          </button>
        </section>
      ) : null}
    </ScanPayDrawer>
  );
}

function WalletDrawer({
  state,
  dispatch,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
}) {
  const { personaId } = useActivePersona();
  return (
    <ScanPayDrawer
      open={state.step === "walletPicker"}
      title="Choose your wallet"
      description="Please select"
      onClose={() => dispatch({ type: "BACK" })}
    >
      <div className="flex flex-col gap-2.5">
        {WALLET_FILTER_OPTIONS.filter((wallet) =>
          SCAN_PAY_WALLET_IDS.some((id) => id === wallet.id),
        ).map((wallet) => {
          const selected = state.walletId === wallet.id;
          const eligible = walletIsEligibleForMerchant(
            wallet.id,
            state.mode,
            state.merchantType,
          );
          return (
            <button
              key={wallet.id}
              type="button"
              disabled={!eligible}
              aria-disabled={!eligible}
              onClick={() => {
                if (eligible) {
                  dispatch({ type: "SELECT_WALLET", walletId: wallet.id });
                }
              }}
              className={`flex min-h-14 items-center justify-between rounded-card border p-card text-left ${
                selected
                  ? "border-pine-primary bg-surface-tint shadow-card"
                  : eligible
                    ? "border-border-line bg-white"
                    : "border-border-line bg-surface-muted opacity-55"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${wallet.toneClass} ${wallet.iconClass}`}
                >
                  <ScanPayIcon
                    name={walletIcons[wallet.id as ScanPayBenefitWalletId]}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-body-sm font-bold text-pine">
                    {wallet.label}
                  </span>
                  <span className="mt-0.5 block text-caption text-ink-secondary">
                    {eligible
                      ? getWalletBalance(wallet.id, personaId).display
                      : "Not available for this merchant"}
                  </span>
                </span>
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border ${
                  selected
                    ? "border-pine-primary bg-pine-primary text-white"
                    : "border-input-border bg-white"
                }`}
              >
                {selected ? <ScanPayIcon name="check" size={14} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </ScanPayDrawer>
  );
}
