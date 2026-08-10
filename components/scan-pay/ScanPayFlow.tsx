"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ScanPayConfirm } from "@/components/scan-pay/ScanPayConfirm";
import { ScanPayMerchantScenarioSheet } from "@/components/scan-pay/ScanPayMerchantScenarioSheet";
import { ScanPayReward } from "@/components/scan-pay/ScanPayReward";
import {
  ScanPayPaymentDetails,
  ScanPayReceiptCapture,
  ScanPayReceiptReview,
  ScanPayResult,
  ScanPaySubmitting,
} from "@/components/scan-pay/ScanPayResult";
import { ScanPayFaq, ScanPayScanner } from "@/components/scan-pay/ScanPayScanner";
import { createInitialScanPayState, scanPayReducer } from "@/features/scan-pay/machine";
import { createScanPayLedgerRows } from "@/features/scan-pay/ledger";
import {
  downloadScanPayReceipt,
  shareScanPayReceipt,
} from "@/features/scan-pay/receipt";
import type {
  ScanPayFlowProps,
  ScanPayTransaction,
} from "@/features/scan-pay/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { getBaseWalletBalances } from "@/features/transactions/constants";
import { commitBenefitPayment } from "@/features/transactions/financialState";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import "./scanPay.css";

const SCANNER_DURATION_MS = 3000;
const QR_DETECTED_AT_MS = 2400;

export function ScanPayFlow({
  open,
  scenario,
  mode,
  merchantType,
  onClose,
}: ScanPayFlowProps) {
  const flowRef = useRef<HTMLDivElement>(null);
  const { personaId } = useActivePersona();
  const [state, dispatch] = useReducer(
    scanPayReducer,
    createInitialScanPayState(scenario, mode, merchantType),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [scannerDetected, setScannerDetected] = useState(false);
  useModalFocus(flowRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    dispatch({ type: "RESET", scenario, mode, merchantType });
  }, [merchantType, mode, open, scenario]);

  useEffect(() => {
    if (!open || state.step !== "scanner" || state.qrErrorVisible) return;

    const resetTimer = window.setTimeout(() => setScannerDetected(false), 0);
    const detectedTimer = window.setTimeout(
      () => setScannerDetected(true),
      QR_DETECTED_AT_MS,
    );
    const transitionTimer = window.setTimeout(
      () => dispatch({ type: "DETECT_QR" }),
      SCANNER_DURATION_MS,
    );

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(detectedTimer);
      window.clearTimeout(transitionTimer);
    };
  }, [open, state.qrErrorVisible, state.step]);

  useEffect(() => {
    if (!open || state.step !== "submitting") return;
    const timer = window.setTimeout(
      () => dispatch({ type: "RESOLVE_PAYMENT" }),
      1450,
    );
    return () => window.clearTimeout(timer);
  }, [open, state.step]);

  useEffect(() => {
    const transaction = state.transaction;
    if (
      !open ||
      state.mode !== "benefits" ||
      state.outcome !== "success" ||
      state.step !== "successReward" ||
      !transaction
    ) {
      return;
    }
    const result = commitBenefitPayment({
      personaId,
      paymentId: transaction.paymentGroupId,
      allocations: transaction.fundingAllocations,
      rows: createScanPayLedgerRows(transaction),
      baseBalances: getBaseWalletBalances(personaId),
    });
    if (result.status === "insufficient") {
      const timer = window.setTimeout(() => {
        setNotice("Wallet balance changed. Review the payment and try again.");
        dispatch({ type: "PAYMENT_COMMIT_FAILED" });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open, personaId, state.mode, state.outcome, state.step, state.transaction]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const preview = state.receiptPreview;
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [state.receiptPreview]);

  const handleDownload = useCallback(async (transaction: ScanPayTransaction) => {
    await downloadScanPayReceipt(transaction);
    setNotice("Receipt downloaded");
  }, []);

  const handleShare = useCallback(async (transaction: ScanPayTransaction) => {
    const result = await shareScanPayReceipt(transaction);
    if (result === "shared") setNotice("Receipt shared");
    if (result === "copied") setNotice("Receipt details copied");
  }, []);

  if (!open) return null;

  let content;
  if (
    state.step === "scanner" ||
    state.step === "upiEntry" ||
    state.step === "merchantScenarioPicker"
  ) {
    content = (
      <div className="relative h-full">
        <ScanPayScanner
          state={state}
          dispatch={dispatch}
          onClose={onClose}
          detected={scannerDetected && !state.qrErrorVisible}
        />
        <ScanPayMerchantScenarioSheet state={state} dispatch={dispatch} />
      </div>
    );
  } else if (state.step === "faq") {
    content = <ScanPayFaq onBack={() => dispatch({ type: "BACK" })} />;
  } else if (
    state.step === "confirmPayment" ||
    state.step === "categoryPicker" ||
    state.step === "walletPicker"
  ) {
    content = (
      <div className="h-full">
        <ScanPayConfirm state={state} dispatch={dispatch} />
      </div>
    );
  } else if (state.step === "submitting") {
    content = (
      <ScanPaySubmitting
        transactionAmount={Number(state.amount)}
        onBack={() => dispatch({ type: "BACK" })}
      />
    );
  } else if (state.step === "result") {
    content = (
      <ScanPayResult
        state={state}
        dispatch={dispatch}
        onClose={onClose}
      />
    );
  } else if (state.step === "successReward" && state.transaction) {
    content = (
      <ScanPayReward
        transaction={state.transaction}
        revealed={state.rewardRevealed}
        onReveal={() => dispatch({ type: "REVEAL_REWARD" })}
        onViewDetails={() => dispatch({ type: "OPEN_PAYMENT_DETAILS" })}
        onDownload={handleDownload}
        onShare={handleShare}
        onClose={onClose}
      />
    );
  } else if (state.step === "paymentDetails") {
    content = (
      <ScanPayPaymentDetails
        state={state}
        dispatch={dispatch}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    );
  } else if (state.step === "receiptCapture") {
    content = <ScanPayReceiptCapture dispatch={dispatch} />;
  } else if (state.step === "receiptReview") {
    content = <ScanPayReceiptReview state={state} dispatch={dispatch} />;
  }

  return (
    <div
      ref={flowRef}
      className="fixed inset-0 z-[120] bg-surface-muted"
      role="dialog"
      aria-modal="true"
      aria-label="Scan & Pay"
    >
      {content}
      {notice ? (
        <div
          className="fixed bottom-24 left-1/2 z-[160] -translate-x-1/2 rounded-pill bg-pine px-4 py-2 text-body-sm font-bold text-white shadow-menu"
          role="status"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
