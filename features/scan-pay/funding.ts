import type { FallbackControlState } from "@/features/fallback-control/store";
import type {
  PaymentContext,
  ScanPayMerchantType,
  ScanPayMode,
  ScanPayWalletId,
} from "@/features/scan-pay/types";
import type { FundingAllocation } from "@/features/transactions/financialState";

export const SCAN_PAY_WALLET_IDS = ["meal", "fuel", "misc"] as const;
export type ScanPayBenefitWalletId = (typeof SCAN_PAY_WALLET_IDS)[number];

export type ScanPayFundingPlan = {
  status: "idle" | "single" | "split" | "fallback-disabled" | "insufficient";
  allocations: FundingAllocation[];
  shortfall: number;
  message: string | null;
};

const LABELS: Record<ScanPayBenefitWalletId, string> = {
  meal: "Meal Wallet",
  fuel: "Fuel Wallet",
  misc: "Reimbursement Wallet",
};

export function defaultWalletForMerchant(
  mode: ScanPayMode,
  merchantType: ScanPayMerchantType,
): ScanPayBenefitWalletId {
  if (mode === "pluspay") return "misc";
  if (merchantType === "meal") return "meal";
  if (merchantType === "fuel") return "fuel";
  return "misc";
}

export function walletIsEligibleForMerchant(
  walletId: ScanPayWalletId,
  mode: ScanPayMode,
  merchantType: ScanPayMerchantType,
): boolean {
  if (mode === "pluspay") return false;
  if (walletId === "mobile") return false;
  if (walletId === "misc") return merchantType !== "unsupported";
  return walletId === merchantType;
}

export function walletIsEligibleForPayment(
  walletId: ScanPayWalletId,
  mode: ScanPayMode,
  merchantType: ScanPayMerchantType,
  paymentContext: PaymentContext,
): boolean {
  if (paymentContext.origin === "bank-transfer") return walletId === "misc";
  return walletIsEligibleForMerchant(walletId, mode, merchantType);
}

export function walletOrderForPayment(
  paymentContext: PaymentContext,
): readonly ScanPayBenefitWalletId[] {
  return paymentContext.origin === "bank-transfer"
    ? ["misc", "meal", "fuel"]
    : SCAN_PAY_WALLET_IDS;
}

export function calculateScanPayFunding({
  amount,
  walletId,
  mode,
  merchantType,
  balances,
  fallback,
}: {
  amount: number;
  walletId: ScanPayWalletId;
  mode: ScanPayMode;
  merchantType: ScanPayMerchantType;
  balances: Record<ScanPayBenefitWalletId, number>;
  fallback: FallbackControlState;
}): ScanPayFundingPlan {
  if (!Number.isFinite(amount) || amount < 1 || mode === "pluspay") {
    return emptyPlan();
  }
  if (
    !walletIsEligibleForMerchant(walletId, mode, merchantType) ||
    walletId === "mobile"
  ) {
    return {
      status: "insufficient",
      allocations: [],
      shortfall: amount,
      message: "This wallet is not available for the selected merchant.",
    };
  }

  const selected = walletId as ScanPayBenefitWalletId;
  const selectedBalance = balances[selected];
  if (amount <= selectedBalance) {
    return {
      status: "single",
      allocations: [allocation(selected, amount)],
      shortfall: 0,
      message: null,
    };
  }

  if (selected === "misc") {
    return {
      status: "insufficient",
      allocations: [],
      shortfall: amount - selectedBalance,
      message: "Reimbursement Wallet does not have enough balance for this payment.",
    };
  }

  const shortfall = amount - selectedBalance;
  if (!fallback[selected]) {
    return {
      status: "fallback-disabled",
      allocations: [],
      shortfall,
      message: `${LABELS[selected]} does not have enough balance. Enable Fallback Control, reduce the amount, or use Reimbursement Wallet.`,
    };
  }
  if (shortfall > balances.misc) {
    return {
      status: "insufficient",
      allocations: [],
      shortfall,
      message: `${LABELS[selected]} and Reimbursement Wallet do not have enough combined balance.`,
    };
  }

  const allocations: FundingAllocation[] = [];
  if (selectedBalance > 0) allocations.push(allocation(selected, selectedBalance));
  allocations.push(allocation("misc", shortfall));
  return {
    status: "split",
    allocations,
    shortfall,
    message: `${LABELS[selected]} has a low balance. ${formatINR(shortfall)} will be deducted from Reimbursement Wallet.`,
  };
}

function allocation(
  walletId: ScanPayBenefitWalletId,
  amount: number,
): FundingAllocation {
  return { walletId, walletLabel: LABELS[walletId], amount };
}

function emptyPlan(): ScanPayFundingPlan {
  return {
    status: "idle",
    allocations: [],
    shortfall: 0,
    message: null,
  };
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
