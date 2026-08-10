import { describe, expect, it } from "vitest";
import { resolveScanPayScenario } from "@/features/scan-pay/fixtures";
import {
  cleanScanPayAmount,
  createInitialScanPayState,
  scanPayAmountIsValid,
  scanPayReducer,
} from "@/features/scan-pay/machine";

describe("scan pay machine", () => {
  it("resolves every supported QA scenario and defaults safely", () => {
    expect(resolveScanPayScenario("failed")).toBe("failed");
    expect(resolveScanPayScenario("processing")).toBe("processing");
    expect(resolveScanPayScenario("invalid-qr")).toBe("invalid-qr");
    expect(resolveScanPayScenario("no-category")).toBe("no-category");
    expect(resolveScanPayScenario("unknown")).toBe("success");
    expect(resolveScanPayScenario(null)).toBe("success");
  });

  it("keeps invalid QR scans on the scanner with an error", () => {
    const state = scanPayReducer(
      createInitialScanPayState("invalid-qr"),
      { type: "DETECT_QR" },
    );
    expect(state.step).toBe("scanner");
    expect(state.qrErrorVisible).toBe(true);
  });

  it("opens merchant scenario selection after a valid EB+ scan", () => {
    let state = scanPayReducer(createInitialScanPayState("success"), {
      type: "DETECT_QR",
    });
    expect(state.step).toBe("merchantScenarioPicker");
    state = scanPayReducer(state, {
      type: "SELECT_MERCHANT_SCENARIO",
      merchantType: "meal",
    });
    expect(state.step).toBe("confirmPayment");
  });

  it("cleans and validates currency input", () => {
    expect(cleanScanPayAmount("₹1,23.456")).toBe("123.45");
    expect(scanPayAmountIsValid("0")).toBe(false);
    expect(scanPayAmountIsValid("1")).toBe(true);
  });

  it("requires a finance subcategory before confirming", () => {
    let state = createInitialScanPayState("success");
    state = scanPayReducer(state, { type: "OPEN_CATEGORY_PICKER" });
    state = scanPayReducer(state, {
      type: "SELECT_CATEGORY",
      categoryId: "finance",
    });
    expect(state.step).toBe("categoryPicker");
    expect(state.pendingCategoryId).toBe("finance");
    expect(scanPayReducer(state, { type: "CONFIRM_CATEGORY" })).toEqual(state);

    state = scanPayReducer(state, {
      type: "SELECT_SUBCATEGORY",
      subcategoryId: "trading",
    });
    state = scanPayReducer(state, { type: "CONFIRM_CATEGORY" });
    expect(state.step).toBe("confirmPayment");
    expect(state.selectedCategoryId).toBe("finance");
    expect(state.selectedSubcategoryId).toBe("trading");
  });

  it("switches to an eligible reimbursement wallet", () => {
    let state = createInitialScanPayState("success");
    state = scanPayReducer(state, { type: "OPEN_WALLET_PICKER" });
    state = scanPayReducer(state, {
      type: "SELECT_WALLET",
      walletId: "misc",
    });
    expect(state.step).toBe("confirmPayment");
    expect(state.walletId).toBe("misc");
  });

  it("routes supported merchants and rejects ineligible wallet changes", () => {
    const meal = createInitialScanPayState("success", "benefits", "meal");
    const fuel = createInitialScanPayState("success", "benefits", "fuel");
    const luxury = createInitialScanPayState("success", "benefits", "luxury");
    expect(meal.walletId).toBe("meal");
    expect(fuel.walletId).toBe("fuel");
    expect(luxury.walletId).toBe("misc");

    const unchanged = scanPayReducer(meal, {
      type: "SELECT_WALLET",
      walletId: "fuel",
    });
    expect(unchanged).toEqual(meal);
  });

  it("blocks unsupported EB+ merchants on the scanner but allows PlusPay", () => {
    let benefits = scanPayReducer(
      createInitialScanPayState("success", "benefits", "unsupported"),
      { type: "DETECT_QR" },
    );
    expect(benefits.step).toBe("merchantScenarioPicker");
    benefits = scanPayReducer(benefits, {
      type: "SELECT_MERCHANT_SCENARIO",
      merchantType: "unsupported",
    });
    expect(benefits.step).toBe("scanner");
    expect(benefits.qrErrorReason).toBe("unsupported");

    const pluspay = scanPayReducer(
      createInitialScanPayState("success", "pluspay", "unsupported"),
      { type: "DETECT_QR" },
    );
    expect(pluspay.step).toBe("confirmPayment");
  });

  it("routes manual EB+ UPI entry to reimbursement", () => {
    const state = scanPayReducer(
      createInitialScanPayState("success", "benefits", "meal"),
      { type: "VERIFY_UPI" },
    );
    expect(state.merchantType).toBe("unclassified");
    expect(state.walletId).toBe("misc");
  });

  it("changes the post-scan merchant scenario and resets wallet eligibility", () => {
    let state = createInitialScanPayState("success", "benefits", "meal");
    state = scanPayReducer(state, { type: "DETECT_QR" });
    state = scanPayReducer(state, {
      type: "SELECT_MERCHANT_SCENARIO",
      merchantType: "fuel",
    });
    expect(state.merchantType).toBe("fuel");
    expect(state.walletId).toBe("fuel");
    expect(state.step).toBe("confirmPayment");

    state = scanPayReducer(state, {
      type: "SELECT_MERCHANT_SCENARIO",
      merchantType: "unsupported",
    });
    expect(state.step).toBe("scanner");
    expect(state.qrErrorReason).toBe("unsupported");
  });

  it("preserves payment input when retrying a failed transaction", () => {
    let state = createInitialScanPayState("failed");
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "780" });
    state = scanPayReducer(state, { type: "PAY" });
    state = scanPayReducer(state, { type: "RESOLVE_PAYMENT" });
    expect(state.step).toBe("result");
    expect(state.transaction?.outcome).toBe("failed");

    state = scanPayReducer(state, { type: "RETRY_PAYMENT" });
    expect(state.step).toBe("confirmPayment");
    expect(state.amount).toBe("780");
  });

  it("returns from payment submission with the entered amount intact", () => {
    let state = createInitialScanPayState("success");
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "780" });
    state = scanPayReducer(state, { type: "PAY" });
    expect(state.step).toBe("submitting");
    state = scanPayReducer(state, { type: "BACK" });
    expect(state.step).toBe("confirmPayment");
    expect(state.amount).toBe("780");
  });

  it("integrates reward reveal and receipt confirmation into success", () => {
    let state = createInitialScanPayState("success");
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "780" });
    state = scanPayReducer(state, { type: "PAY" });
    state = scanPayReducer(state, { type: "RESOLVE_PAYMENT" });
    expect(state.step).toBe("successReward");

    state = scanPayReducer(state, { type: "REVEAL_REWARD" });
    expect(state.rewardRevealed).toBe(true);
    state = scanPayReducer(state, { type: "OPEN_PAYMENT_DETAILS" });
    state = scanPayReducer(state, { type: "OPEN_RECEIPT_CAPTURE" });
    state = scanPayReducer(state, {
      type: "CAPTURE_RECEIPT",
      preview: "/receipt.jpg",
    });
    state = scanPayReducer(state, { type: "CONFIRM_RECEIPT" });
    expect(state.step).toBe("paymentDetails");
    expect(state.receiptState).toBe("confirmed");
  });

  it("returns support FAQs to the result that opened them", () => {
    let state = createInitialScanPayState("failed");
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "780" });
    state = scanPayReducer(state, { type: "PAY" });
    state = scanPayReducer(state, { type: "RESOLVE_PAYMENT" });
    state = scanPayReducer(state, {
      type: "OPEN_FAQ",
      returnStep: "result",
    });
    expect(state.step).toBe("faq");
    expect(scanPayReducer(state, { type: "BACK" }).step).toBe("result");
  });
});
