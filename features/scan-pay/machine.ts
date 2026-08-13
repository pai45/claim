import {
  categoryById,
  createScanPayTransaction,
  outcomeForScenario,
} from "@/features/scan-pay/fixtures";
import { defaultWalletForMerchant } from "@/features/scan-pay/funding";
import {
  BANK_TRANSFER_CONVENIENCE_FEE,
  bankTransferTotal,
} from "@/features/bank-transfer/fees";
import type { BankRecipient } from "@/features/bank-transfer/validation";
import type {
  ScanPayAction,
  ScanPayMerchantType,
  ScanPayLaunch,
  ScanPayMode,
  ScanPayScenario,
  ScanPayState,
} from "@/features/scan-pay/types";

export function createInitialScanPayState(
  scenario: ScanPayScenario,
  mode: ScanPayMode = "benefits",
  merchantType: ScanPayMerchantType = "meal",
  launch: ScanPayLaunch = { kind: "scanner" },
): ScanPayState {
  const payeeLaunch = launch.kind === "payee" ? launch.payee : null;
  const startsWithUpi = launch.kind !== "scanner";
  return {
    paymentContext: payeeLaunch
      ? { origin: "upi-transfer", recipient: payeeLaunch }
      : { origin: "scan-pay" },
    upiIdDraft:
      launch.kind === "upi-entry"
        ? launch.initialUpiId ?? ""
        : payeeLaunch?.upiId ?? "",
    step:
      launch.kind === "upi-entry"
        ? "upiEntry"
        : launch.kind === "payee"
          ? "confirmPayment"
          : "scanner",
    mode,
    merchantType: startsWithUpi ? "unclassified" : merchantType,
    scenario,
    outcome: outcomeForScenario(scenario),
    qrErrorVisible: false,
    qrErrorReason: null,
    torchEnabled: false,
    amount: "",
    amountTouched: false,
    note: "",
    noteOpen: false,
    selectedCategoryId: null,
    pendingCategoryId: null,
    selectedSubcategoryId: null,
    walletId: defaultWalletForMerchant(
      mode,
      startsWithUpi ? "unclassified" : merchantType,
    ),
    fundingAllocations: [],
    transaction: null,
    receiptState: "empty",
    receiptPreview: null,
    faqReturnStep: "scanner",
  };
}

export function createInitialBankTransferState(
  recipient: BankRecipient,
): ScanPayState {
  return {
    ...createInitialScanPayState("success", "benefits", "unclassified"),
    paymentContext: {
      origin: "bank-transfer",
      recipient: {
        accountHolder: recipient.accountHolder.trim(),
        accountNumber: recipient.accountNumber,
        ifsc: recipient.ifsc,
      },
    },
    step: "confirmPayment",
    walletId: "misc",
    selectedCategoryId: "finance",
    selectedSubcategoryId: "bank",
  };
}

export function scanPayAmountIsValid(amount: string): boolean {
  const numeric = Number(amount);
  return Number.isFinite(numeric) && numeric >= 1;
}

export function cleanScanPayAmount(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...fractionParts] = cleaned.split(".");
  if (fractionParts.length === 0) return whole;
  return `${whole}.${fractionParts.join("").slice(0, 2)}`;
}

/** Formats the amount for the confirmation field without changing its numeric value. */
export function formatScanPayAmountInput(amount: string): string {
  if (!amount) return "";

  const [whole, fraction] = amount.split(".");
  const formattedWhole = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(whole || "0"));

  return fraction === undefined ? formattedWhole : `${formattedWhole}.${fraction}`;
}

export function scanPayReducer(
  state: ScanPayState,
  action: ScanPayAction,
): ScanPayState {
  switch (action.type) {
    case "RESET":
      return createInitialScanPayState(
        action.scenario,
        action.mode,
        action.merchantType,
        action.launch,
      );
    case "DETECT_QR":
      if (state.scenario === "invalid-qr") {
        return {
          ...state,
          qrErrorVisible: true,
          qrErrorReason: "invalid",
        };
      }
      if (
        state.mode === "benefits" &&
        state.merchantType === "unsupported"
      ) {
        return {
          ...state,
          step: "scanner",
          walletId: "misc",
          qrErrorVisible: true,
          qrErrorReason: "unsupported",
          fundingAllocations: [],
        };
      }
      return {
        ...state,
        step: "confirmPayment",
        qrErrorVisible: false,
        qrErrorReason: null,
        walletId: defaultWalletForMerchant(state.mode, state.merchantType),
      };
    case "DISMISS_QR_ERROR":
      return { ...state, qrErrorVisible: false, qrErrorReason: null };
    case "TOGGLE_TORCH":
      return { ...state, torchEnabled: !state.torchEnabled };
    case "OPEN_UPI_ENTRY":
      return { ...state, step: "upiEntry", qrErrorVisible: false };
    case "SET_UPI_ID":
      return { ...state, upiIdDraft: action.upiId };
    case "VERIFY_UPI":
      if (!state.upiIdDraft.trim().includes("@")) return state;
      return {
        ...state,
        paymentContext: {
          origin: "upi-transfer",
          recipient: payeeFromUpiId(state.upiIdDraft),
        },
        step: "confirmPayment",
        qrErrorVisible: false,
        qrErrorReason: null,
        merchantType:
          state.mode === "benefits" ? "unclassified" : state.merchantType,
        walletId: "misc",
      };
    case "OPEN_FAQ":
      return {
        ...state,
        step: "faq",
        faqReturnStep: action.returnStep ?? "scanner",
        qrErrorVisible: false,
      };
    case "OPEN_CATEGORY_PICKER":
      return {
        ...state,
        step: "categoryPicker",
        pendingCategoryId: state.selectedCategoryId,
      };
    case "SELECT_CATEGORY": {
      const category = categoryById(action.categoryId);
      if (category?.subcategories?.length) {
        return {
          ...state,
          pendingCategoryId: action.categoryId,
          selectedSubcategoryId: null,
        };
      }
      return {
        ...state,
        step: "confirmPayment",
        selectedCategoryId: action.categoryId,
        pendingCategoryId: null,
        selectedSubcategoryId: null,
      };
    }
    case "SELECT_SUBCATEGORY":
      return { ...state, selectedSubcategoryId: action.subcategoryId };
    case "CONFIRM_CATEGORY":
      if (!state.pendingCategoryId || !state.selectedSubcategoryId) return state;
      return {
        ...state,
        step: "confirmPayment",
        selectedCategoryId: state.pendingCategoryId,
        pendingCategoryId: null,
      };
    case "SET_AMOUNT":
      return {
        ...state,
        amount: cleanScanPayAmount(action.amount),
        amountTouched: true,
      };
    case "TOUCH_AMOUNT":
      return { ...state, amountTouched: true };
    case "OPEN_NOTE":
      return { ...state, noteOpen: true };
    case "SET_NOTE":
      return { ...state, note: action.note };
    case "PAY":
      if (!scanPayAmountIsValid(state.amount)) {
        return { ...state, amountTouched: true };
      }
      return {
        ...state,
        step: "submitting",
        fundingAllocations: action.fundingAllocations ?? [],
      };
    case "RESOLVE_PAYMENT": {
      if (!scanPayAmountIsValid(state.amount)) return state;
      const transaction =
        action.transaction ?? createPaymentTransactionForState(state);
      return {
        ...state,
        step:
          state.outcome === "success" &&
          state.paymentContext.origin !== "bank-transfer"
            ? "successReward"
            : "result",
        transaction,
      };
    }
    case "PAYMENT_COMMIT_FAILED":
      return {
        ...state,
        step: "confirmPayment",
        transaction: null,
        fundingAllocations: [],
      };
    case "RETRY_PAYMENT":
      return { ...state, step: "confirmPayment", transaction: null };
    case "OPEN_PAYMENT_DETAILS":
      return { ...state, step: "paymentDetails" };
    case "OPEN_RECEIPT_CAPTURE":
      return { ...state, step: "receiptCapture" };
    case "CAPTURE_RECEIPT":
      return {
        ...state,
        step: "receiptReview",
        receiptState: "captured",
        receiptPreview: action.preview,
      };
    case "RETAKE_RECEIPT":
      return {
        ...state,
        step: "receiptCapture",
        receiptState: "empty",
        receiptPreview: null,
      };
    case "CONFIRM_RECEIPT":
      return {
        ...state,
        step: "paymentDetails",
        receiptState: "confirmed",
      };
    case "BACK":
      return goBack(state);
  }
}

export function createPaymentTransactionForState(
  state: ScanPayState,
) {
  const transferAmount = Number(state.amount);
  const bankTransfer = state.paymentContext.origin === "bank-transfer";
  return createScanPayTransaction({
    amount: bankTransfer ? bankTransferTotal(transferAmount) : transferAmount,
    transferAmount: bankTransfer ? transferAmount : undefined,
    convenienceFee: bankTransfer ? BANK_TRANSFER_CONVENIENCE_FEE : undefined,
    walletId: state.walletId,
    categoryId: state.selectedCategoryId,
    subcategoryId: state.selectedSubcategoryId,
    note: state.note,
    outcome: state.outcome,
    mode: state.mode,
    merchantType: state.merchantType,
    fundingAllocations: state.fundingAllocations,
    paymentContext: state.paymentContext,
  });
}

function goBack(state: ScanPayState): ScanPayState {
  switch (state.step) {
    case "upiEntry":
      return { ...state, step: "scanner", qrErrorVisible: false };
    case "faq":
      return { ...state, step: state.faqReturnStep, qrErrorVisible: false };
    case "categoryPicker":
      return { ...state, step: "confirmPayment", pendingCategoryId: null };
    case "confirmPayment":
      return {
        ...state,
        step:
          state.paymentContext.origin === "upi-transfer"
            ? "upiEntry"
            : "scanner",
        qrErrorVisible: false,
      };
    case "submitting":
      return { ...state, step: "confirmPayment" };
    case "result":
      return { ...state, step: "confirmPayment", transaction: null };
    case "paymentDetails":
      return { ...state, step: "successReward" };
    case "receiptCapture":
      return { ...state, step: "paymentDetails" };
    case "receiptReview":
      return { ...state, step: "receiptCapture", receiptPreview: null };
    default:
      return state;
  }
}

function payeeFromUpiId(value: string) {
  const upiId = value.trim().toLowerCase();
  const handle = upiId.split("@")[0] ?? "upi";
  const words = handle
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const name = words
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ") || "UPI recipient";
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "UP";
  return {
    id: `upi-${upiId.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name,
    upiId,
    initials,
  };
}
