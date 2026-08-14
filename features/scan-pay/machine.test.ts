import { describe, expect, it } from "vitest";
import {
  createScanPayTransaction,
  resolveScanPayMerchantSelection,
  resolveScanPayScenario,
} from "@/features/scan-pay/fixtures";
import {
  cleanScanPayAmount,
  createInitialBankTransferState,
  createInitialScanPayState,
  createPaymentTransactionForState,
  formatScanPayAmountInput,
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

  it("rotates scan merchants in-session and preserves the cursor for QA overrides", () => {
    let rotationIndex = 0;
    const merchants = Array.from({ length: 5 }, () => {
      const selection = resolveScanPayMerchantSelection(null, rotationIndex);
      rotationIndex = selection.nextRotationIndex;
      return selection.merchantType;
    });

    expect(merchants).toEqual([
      "meal",
      "fuel",
      "luxury",
      "unsupported",
      "meal",
    ]);

    const override = resolveScanPayMerchantSelection("fuel", rotationIndex);
    expect(override).toEqual({
      merchantType: "fuel",
      nextRotationIndex: rotationIndex,
    });
  });

  it("keeps invalid QR scans on the scanner with an error", () => {
    const state = scanPayReducer(
      createInitialScanPayState("invalid-qr"),
      { type: "DETECT_QR" },
    );
    expect(state.step).toBe("scanner");
    expect(state.qrErrorVisible).toBe(true);
  });

  it("routes a valid EB+ scan directly to confirmation", () => {
    const state = scanPayReducer(createInitialScanPayState("success"), {
      type: "DETECT_QR",
    });
    expect(state.step).toBe("confirmPayment");
    expect(state.walletId).toBe("meal");
  });

  it("cleans and validates currency input", () => {
    expect(cleanScanPayAmount("₹1,23.456")).toBe("123.45");
    expect(formatScanPayAmountInput("12000")).toBe("12,000");
    expect(formatScanPayAmountInput("1234567.5")).toBe("12,34,567.5");
    expect(formatScanPayAmountInput("12000.")).toBe("12,000.");
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

  it("assigns the automatic wallet for each supported merchant", () => {
    const meal = createInitialScanPayState("success", "benefits", "meal");
    const fuel = createInitialScanPayState("success", "benefits", "fuel");
    const luxury = createInitialScanPayState("success", "benefits", "luxury");
    expect(meal.walletId).toBe("meal");
    expect(fuel.walletId).toBe("fuel");
    expect(luxury.walletId).toBe("misc");
  });

  it("blocks unsupported EB+ merchants on the scanner but allows PlusPay", () => {
    const benefits = scanPayReducer(
      createInitialScanPayState("success", "benefits", "unsupported"),
      { type: "DETECT_QR" },
    );
    expect(benefits.step).toBe("scanner");
    expect(benefits.qrErrorReason).toBe("unsupported");

    const pluspay = scanPayReducer(
      createInitialScanPayState("success", "pluspay", "unsupported"),
      { type: "DETECT_QR" },
    );
    expect(pluspay.step).toBe("confirmPayment");
  });

  it("routes manual EB+ UPI entry to reimbursement", () => {
    let state = createInitialScanPayState("success", "benefits", "meal", {
      kind: "upi-entry",
    });
    expect(state.step).toBe("upiEntry");
    state = scanPayReducer(state, {
      type: "SET_UPI_ID",
      upiId: "deevanshu@paytm",
    });
    state = scanPayReducer(state, { type: "VERIFY_UPI" });
    expect(state.merchantType).toBe("unclassified");
    expect(state.walletId).toBe("misc");
    expect(state.paymentContext).toMatchObject({
      origin: "upi-transfer",
      recipient: { upiId: "deevanshu@paytm" },
    });
  });

  it("starts Pay Again at confirmation with a blank amount and active mode", () => {
    const payee = {
      id: "deevanshu-sharma",
      name: "Deevanshu Sharma",
      upiId: "deevanshu@paytm",
      initials: "DS",
    };
    const benefits = createInitialScanPayState(
      "success",
      "benefits",
      "meal",
      { kind: "payee", payee },
    );
    const pluspay = createInitialScanPayState(
      "success",
      "pluspay",
      "meal",
      { kind: "payee", payee },
    );
    expect(benefits).toMatchObject({
      step: "confirmPayment",
      mode: "benefits",
      merchantType: "unclassified",
      walletId: "misc",
      amount: "",
    });
    expect(pluspay).toMatchObject({
      step: "confirmPayment",
      mode: "pluspay",
      walletId: "misc",
      amount: "",
    });
  });

  it("starts bank transfers at confirmation with reimbursement locked", () => {
    const state = createInitialBankTransferState({
      accountHolder: "Ananya Rao",
      accountNumber: "123456789012",
      ifsc: "HDFC0001234",
    });
    expect(state.step).toBe("confirmPayment");
    expect(state.walletId).toBe("misc");
    expect(state.paymentContext.origin).toBe("bank-transfer");
    expect(state.selectedCategoryId).toBe("finance");
  });

  it("creates bank-specific transaction details", () => {
    const state = {
      ...createInitialBankTransferState({
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
      }),
      amount: "500",
      fundingAllocations: [
        {
          walletId: "misc" as const,
          walletLabel: "Reimbursement Wallet",
          amount: 510,
        },
      ],
    };
    const transaction = createPaymentTransactionForState(state);
    expect(transaction.payee).toMatchObject({
      kind: "bank-transfer",
      name: "Ananya Rao",
      ifsc: "HDFC0001234",
    });
    expect(transaction.paymentMethod).toBe("Bank Transfer");
    expect(transaction.amount).toBe(510);
    expect(transaction.transferAmount).toBe(500);
    expect(transaction.convenienceFee).toBe(10);
    expect(transaction.transactionId).toMatch(/^EB\d{10}$/);
    expect(transaction.category).toBe("Finance");
    expect(transaction.subcategory).toBe("Bank");
  });

  it("restores a completed payment directly to its receipt", () => {
    const transaction = createScanPayTransaction({
      amount: 480,
      walletId: "meal",
      categoryId: "food",
      subcategoryId: null,
      note: "Lunch",
      outcome: "success",
      mode: "benefits",
      merchantType: "meal",
      fundingAllocations: [
        { walletId: "meal", walletLabel: "Meal Wallet", amount: 480 },
      ],
    });
    const state = createInitialScanPayState(
      "success",
      "benefits",
      "meal",
      { kind: "completed", transaction },
    );

    expect(state.step).toBe("successReward");
    expect(state.transaction).toEqual(transaction);
    expect(state.amount).toBe("480");
    expect(state.fundingAllocations).toEqual(transaction.fundingAllocations);
  });

  it("routes a successful bank transfer to the paid-to result step", () => {
    let state = createInitialBankTransferState({
      accountHolder: "Ananya Rao",
      accountNumber: "123456789012",
      ifsc: "HDFC0001234",
    });
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "500" });
    state = scanPayReducer(state, { type: "PAY" });
    state = scanPayReducer(state, { type: "RESOLVE_PAYMENT" });

    expect(state.step).toBe("result");
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

  it("integrates receipt confirmation into the success flow", () => {
    let state = createInitialScanPayState("success");
    state = scanPayReducer(state, { type: "SET_AMOUNT", amount: "780" });
    state = scanPayReducer(state, { type: "PAY" });
    state = scanPayReducer(state, { type: "RESOLVE_PAYMENT" });
    expect(state.step).toBe("successReward");

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
