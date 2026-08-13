"use client";

import { useCallback, useEffect, useMemo, useRef, type Dispatch } from "react";
import { NumericKeypad } from "@/components/mpin/NumericKeypad";
import { ScanPayDrawer } from "@/components/scan-pay/ScanPayDrawer";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { BenefitWalletIcon } from "@/components/shared/BenefitWalletIcon";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  maskAccountNumber,
  validateBankTransferAmount,
} from "@/features/bank-transfer/validation";
import {
  BANK_TRANSFER_CONVENIENCE_FEE,
  bankTransferTotal,
} from "@/features/bank-transfer/fees";
import {
  SCAN_PAY_CATEGORIES,
  SCAN_PAY_QUICK_CATEGORIES,
  categoryById,
  merchantForType,
} from "@/features/scan-pay/fixtures";
import { calculateScanPayFunding } from "@/features/scan-pay/funding";
import { formatScanPayINR } from "@/features/scan-pay/receipt";
import {
  formatScanPayAmountInput,
  scanPayAmountIsValid,
} from "@/features/scan-pay/machine";
import type {
  ScanPayAction,
  ScanPayCategory,
  ScanPayCategoryId,
  ScanPayState,
} from "@/features/scan-pay/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  useFallbackControlState,
  writeFallbackControlState,
} from "@/features/fallback-control/store";
import {
  WALLET_FILTER_OPTIONS,
  getWalletBalance,
} from "@/features/transactions/constants";
import { useFinancialStateVersion } from "@/features/transactions/useFinancialState";
import { SCAN_PAY_ASSETS, UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";

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
  onBack,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
  onBack?: () => void;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const { personaId } = useActivePersona();
  const fallback = useFallbackControlState();
  const financialVersion = useFinancialStateVersion();
  void financialVersion;
  const bankRecipient =
    state.paymentContext.origin === "bank-transfer"
      ? state.paymentContext.recipient
      : null;
  const upiRecipient =
    state.paymentContext.origin === "upi-transfer"
      ? state.paymentContext.recipient
      : null;
  const scanAmountValid = scanPayAmountIsValid(state.amount);
  const transferAmount = Number(state.amount);
  const convenienceFee = bankRecipient ? BANK_TRANSFER_CONVENIENCE_FEE : 0;
  const totalPaymentAmount = bankRecipient
    ? bankTransferTotal(transferAmount)
    : transferAmount;
  const merchant = merchantForType(state.merchantType);
  const balances = useMemo(() => {
    void financialVersion;
    return {
      meal: getWalletBalance("meal", personaId).amount,
      fuel: getWalletBalance("fuel", personaId).amount,
      misc: getWalletBalance("misc", personaId).amount,
    };
  }, [financialVersion, personaId]);
  const selectedWallet =
    WALLET_FILTER_OPTIONS.find((wallet) => wallet.id === state.walletId) ??
    WALLET_FILTER_OPTIONS.find((wallet) => wallet.id === "misc")!;
  const selectedWalletBalance = getWalletBalance(
    selectedWallet.id,
    personaId,
  ).display;
  const fundingPlan = useMemo(
    () =>
      calculateScanPayFunding({
        amount: totalPaymentAmount,
        walletId: state.walletId,
        mode: state.mode,
        merchantType: state.merchantType,
        balances,
        fallback,
      }),
    [
      balances,
      fallback,
      state.merchantType,
      state.mode,
      state.walletId,
      totalPaymentAmount,
    ],
  );
  const bankAmountError = bankRecipient
    ? validateBankTransferAmount(state.amount, balances.misc, convenienceFee)
    : null;
  const amountValid = bankRecipient
    ? bankAmountError === null
    : scanAmountValid;
  const valid =
    amountValid &&
    (state.mode === "pluspay" ||
      fundingPlan.status === "single" ||
      fundingPlan.status === "split");
  const showError =
    state.amountTouched &&
    !amountValid &&
    (Boolean(bankRecipient) || state.amount !== "");
  const displayedAmount = formatScanPayAmountInput(state.amount);
  const amountFontSize = amountFontSizeFor(displayedAmount);
  const noCategory = state.scenario === "no-category";
  const showCategorySelection = state.mode === "pluspay";
  const quickCategories = useMemo(() => {
    if (
      state.selectedCategoryId &&
      !SCAN_PAY_QUICK_CATEGORIES.includes(state.selectedCategoryId)
    ) {
      return [state.selectedCategoryId, "food", "flights"] as const;
    }
    return SCAN_PAY_QUICK_CATEGORIES;
  }, [state.selectedCategoryId]);

  const appendAmount = useCallback(
    (value: string) => {
      dispatch({ type: "SET_AMOUNT", amount: `${state.amount}${value}` });
    },
    [dispatch, state.amount],
  );

  const removeAmountDigit = useCallback(() => {
    dispatch({ type: "SET_AMOUNT", amount: state.amount.slice(0, -1) });
  }, [dispatch, state.amount]);

  const enableFallbackForPayment = useCallback(() => {
    if (state.walletId !== "meal" && state.walletId !== "fuel") return;
    writeFallbackControlState({
      ...fallback,
      [state.walletId]: true,
    });
  }, [fallback, state.walletId]);

  // Keep the on-screen keypad from becoming a touch-only control. Ignore note
  // fields and any other text controls so their normal typing is unaffected.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      const isOtherTextControl =
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLInputElement && target !== amountRef.current) ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isOtherTextControl) return;

      if (/^\d$/.test(event.key) || event.key === ".") {
        event.preventDefault();
        appendAmount(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        removeAmountDigit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendAmount, removeAmountDigit]);

  return (
    <AppShell className="scan-pay-shell relative overflow-hidden bg-white">
      <ScreenHeader
        title="Confirm Payment"
        onBack={onBack ?? (() => dispatch({ type: "BACK" }))}
      />
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-3"
        onScroll={() => amountRef.current?.blur()}
        onPointerDown={(event) => {
          if (event.target !== amountRef.current) amountRef.current?.blur();
        }}
      >
        {showError ? (
          <div
            className="animate-rise-in mb-3 flex items-start gap-3 rounded-card border border-danger bg-danger-soft p-card text-danger shadow-card"
            role="alert"
          >
            <ScanPayIcon name="warning" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-body-sm font-bold">
                {bankRecipient
                  ? "Enter a valid amount"
                  : "Enter Value Before Payment"}
              </p>
              <p className="mt-0.5 text-caption">
                {bankAmountError ??
                  "Enter an amount of ₹1 or more to proceed with your transaction."}
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
              {bankRecipient?.accountHolder ??
                upiRecipient?.name ??
                merchant.name}
            </h2>
            <p className="scan-pay-receipt-upi mt-0.5 text-subtle">
              {bankRecipient
                ? `A/C ${maskAccountNumber(bankRecipient.accountNumber)} · IFSC ${bankRecipient.ifsc}`
                : `UPI ID: ${upiRecipient?.upiId ?? merchant.upiId}`}
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
                  {displayedAmount || "0"}
                </span>
                <input
                  ref={amountRef}
                  id="scan-pay-amount"
                  aria-label="Payment amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={displayedAmount}
                  readOnly
                  onChange={(event) =>
                    dispatch({ type: "SET_AMOUNT", amount: event.target.value })
                  }
                  onBlur={() => dispatch({ type: "TOUCH_AMOUNT" })}
                  className="scan-pay-amount-input border-b-2 border-mint bg-transparent text-center outline-none transition-colors placeholder:text-muted focus:border-pine-primary"
                />
              </span>
            </div>

            {bankRecipient && scanAmountValid ? (
              <dl className="mx-auto mt-3 w-full max-w-card divide-y divide-border-soft text-caption text-ink-secondary">
                <div className="flex items-center justify-between py-1.5">
                  <dt>Convenience fee</dt>
                  <dd className="font-bold text-ink">
                    {formatScanPayINR(convenienceFee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between pt-2 text-pine">
                  <dt className="font-bold">Total payable</dt>
                  <dd className="font-bold">
                    {formatScanPayINR(totalPaymentAmount)}
                  </dd>
                </div>
              </dl>
            ) : null}

            {showCategorySelection ? (
              <>
                <p className="scan-pay-receipt-prompt mt-9 type-body-secondary">
                  Paying for
                </p>
                {bankRecipient ? (
                  <div className="mx-auto mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-control border border-pine-primary bg-surface-tint px-card text-left shadow-card">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-white text-pine-primary"
                      aria-hidden="true"
                    >
                      <ScanPayIcon name="bank" />
                    </span>
                    <span>
                      <span className="block text-body-sm font-bold text-pine">
                        Bank Transfer
                      </span>
                      <span className="block text-caption text-ink-secondary">
                        Finance
                      </span>
                    </span>
                  </div>
                ) : noCategory ? (
                  <div className="mt-3">
                    {state.noteOpen ? (
                      <input
                        value={state.note}
                        onChange={(event) =>
                          dispatch({
                            type: "SET_NOTE",
                            note: event.target.value,
                          })
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
                            dispatch({
                              type: "SELECT_CATEGORY",
                              categoryId: id,
                            })
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
              </>
            ) : null}
          </section>
        </div>

        {!bankRecipient ? (
          <div className="scan-pay-brand-space relative flex min-h-28 flex-1 items-center justify-center py-6">
            <AppIcon
              src={SCAN_PAY_ASSETS.poweredByUpi}
              alt=""
              width={80}
              height={32}
              className="relative z-10 h-6 w-auto object-contain opacity-70"
            />
          </div>
        ) : null}
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
            <span className="min-w-0 flex-1 font-bold">
              {fundingPlan.message}
              {fundingPlan.status === "fallback-disabled" ? (
                <button
                  type="button"
                  onClick={enableFallbackForPayment}
                  className="mt-2 flex min-h-11 w-full items-center justify-center rounded-control border border-danger bg-white px-3 py-2 text-caption font-bold text-danger"
                >
                  Turn on Fallback Control
                </button>
              ) : null}
            </span>
          </div>
        ) : null}
        <section aria-label="Payment source">
          <p className="type-field-label">Will be deducted from</p>
          <div className="mt-2 flex min-h-16 items-center gap-3 rounded-card border border-border-line bg-input-soft p-card">
            {state.mode === "pluspay" ? (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-white shadow-soft">
                  <AppIcon
                    src={UPI_SETTINGS_ASSETS.anq}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                </span>
                <span className="min-w-0">
                  <span className="type-body block font-bold text-pine">
                    ANQ
                  </span>
                  <span className="type-body-secondary mt-0.5 block">
                    PlusPay
                  </span>
                </span>
              </>
            ) : (
              <>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${selectedWallet.toneClass} ${selectedWallet.iconClass}`}
                >
                  <BenefitWalletIcon wallet={selectedWallet.id} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="type-body block font-bold text-pine">
                    {selectedWallet.label}
                  </span>
                  <span className="type-body-secondary mt-0.5 block">
                    Available balance {selectedWalletBalance}
                  </span>
                </span>
              </>
            )}
          </div>
        </section>
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
          className="btn-primary mt-3 min-h-14"
        >
          Pay
        </button>
      </footer>

      <NumericKeypad
        onDigit={appendAmount}
        onBackspace={removeAmountDigit}
        allowDecimal
      />

      {showCategorySelection ? (
        <CategoryDrawer state={state} dispatch={dispatch} />
      ) : null}
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
