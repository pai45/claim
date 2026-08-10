import {
  categoryById,
  createScanPayTransaction,
  outcomeForScenario,
} from "@/features/scan-pay/fixtures";
import {
  defaultWalletForMerchant,
  walletIsEligibleForMerchant,
} from "@/features/scan-pay/funding";
import type {
  ScanPayAction,
  ScanPayMerchantType,
  ScanPayMode,
  ScanPayScenario,
  ScanPayState,
} from "@/features/scan-pay/types";

export function createInitialScanPayState(
  scenario: ScanPayScenario,
  mode: ScanPayMode = "benefits",
  merchantType: ScanPayMerchantType = "meal",
): ScanPayState {
  return {
    step: "scanner",
    mode,
    merchantType,
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
    walletId: defaultWalletForMerchant(mode, merchantType),
    fundingAllocations: [],
    transaction: null,
    rewardRevealed: false,
    receiptState: "empty",
    receiptPreview: null,
    faqReturnStep: "scanner",
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
      );
    case "DETECT_QR":
      if (state.scenario === "invalid-qr") {
        return {
          ...state,
          qrErrorVisible: true,
          qrErrorReason: "invalid",
        };
      }
      return {
        ...state,
        step:
          state.mode === "benefits"
            ? "merchantScenarioPicker"
            : "confirmPayment",
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
    case "VERIFY_UPI":
      return {
        ...state,
        step: "confirmPayment",
        qrErrorVisible: false,
        qrErrorReason: null,
        merchantType:
          state.mode === "benefits" ? "unclassified" : state.merchantType,
        walletId: "misc",
      };
    case "SELECT_MERCHANT_SCENARIO":
      if (
        state.mode === "benefits" &&
        action.merchantType === "unsupported"
      ) {
        return {
          ...state,
          step: "scanner",
          merchantType: action.merchantType,
          walletId: "misc",
          qrErrorVisible: true,
          qrErrorReason: "unsupported",
          fundingAllocations: [],
        };
      }
      return {
        ...state,
        step: "confirmPayment",
        merchantType: action.merchantType,
        walletId: defaultWalletForMerchant(state.mode, action.merchantType),
        fundingAllocations: [],
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
    case "OPEN_WALLET_PICKER":
      return { ...state, step: "walletPicker" };
    case "SELECT_WALLET":
      if (
        !walletIsEligibleForMerchant(
          action.walletId,
          state.mode,
          state.merchantType,
        )
      ) {
        return state;
      }
      return {
        ...state,
        step: "confirmPayment",
        walletId: action.walletId,
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
      const transaction = createScanPayTransaction({
        amount: Number(state.amount),
        walletId: state.walletId,
        categoryId: state.selectedCategoryId,
        subcategoryId: state.selectedSubcategoryId,
        note: state.note,
        outcome: state.outcome,
        mode: state.mode,
        merchantType: state.merchantType,
        fundingAllocations: state.fundingAllocations,
      });
      return {
        ...state,
        step: state.outcome === "success" ? "successReward" : "result",
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
    case "REVEAL_REWARD":
      return { ...state, rewardRevealed: true };
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

function goBack(state: ScanPayState): ScanPayState {
  switch (state.step) {
    case "upiEntry":
      return { ...state, step: "scanner", qrErrorVisible: false };
    case "merchantScenarioPicker":
      return { ...state, step: "scanner", qrErrorVisible: false };
    case "faq":
      return { ...state, step: state.faqReturnStep, qrErrorVisible: false };
    case "categoryPicker":
    case "walletPicker":
      return { ...state, step: "confirmPayment", pendingCategoryId: null };
    case "confirmPayment":
      return { ...state, step: "scanner", qrErrorVisible: false };
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
