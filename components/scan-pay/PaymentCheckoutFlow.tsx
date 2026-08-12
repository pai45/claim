"use client";

import { useCallback, useEffect, useState, type Dispatch } from "react";
import { useRouter } from "next/navigation";
import { ScanPayConfirm } from "@/components/scan-pay/ScanPayConfirm";
import { ScanPayReward } from "@/components/scan-pay/ScanPayReward";
import {
  ScanPayPaymentDetails,
  ScanPayReceiptCapture,
  ScanPayReceiptReview,
  ScanPayResult,
  ScanPaySubmitting,
} from "@/components/scan-pay/ScanPayResult";
import { ScanPayFaq } from "@/components/scan-pay/ScanPayScanner";
import { createPaymentLedgerRows } from "@/features/scan-pay/ledger";
import { recordBankTransfer } from "@/features/bank-transfer/history";
import { createPaymentTransactionForState } from "@/features/scan-pay/machine";
import { recordRecipientPayment } from "@/features/send-money/history";
import {
  downloadScanPayReceipt,
  shareScanPayReceipt,
} from "@/features/scan-pay/receipt";
import type {
  ScanPayAction,
  ScanPayState,
  ScanPayTransaction,
} from "@/features/scan-pay/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { getBaseWalletBalances } from "@/features/transactions/constants";
import { commitBenefitPayment } from "@/features/transactions/financialState";
import { recordPlusPayTransaction } from "@/features/transactions/plusPayHistory";
import "./scanPay.css";

export function PaymentCheckoutFlow({
  state,
  dispatch,
  onClose,
  onConfirmBack,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
  onClose: () => void;
  onConfirmBack?: () => void;
}) {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (state.step !== "submitting") return;
    const timer = window.setTimeout(() => {
      const transaction = createPaymentTransactionForState(state);
      if (
        state.mode === "benefits" &&
        state.outcome === "success"
      ) {
        const result = commitBenefitPayment({
          personaId,
          paymentId: transaction.paymentGroupId,
          allocations: transaction.fundingAllocations,
          rows: createPaymentLedgerRows(transaction),
          baseBalances: getBaseWalletBalances(personaId),
        });
        if (result.status === "insufficient") {
          setNotice("Wallet balance changed. Review the payment and try again.");
          dispatch({ type: "PAYMENT_COMMIT_FAILED" });
          return;
        }
      }
      recordPlusPayTransaction(personaId, transaction);
      recordRecipientPayment(transaction);
      recordBankTransfer(personaId, transaction);
      dispatch({ type: "RESOLVE_PAYMENT", transaction });
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [dispatch, personaId, state]);

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

  const openTransactionDetails = useCallback(
    (transaction: ScanPayTransaction) => {
      router.push(
        `/transaction-details/?id=${encodeURIComponent(transaction.transactionId)}&mode=${transaction.mode}`,
      );
    },
    [router],
  );

  let content = null;
  if (
    state.step === "confirmPayment" ||
    state.step === "categoryPicker"
  ) {
    content = (
      <div className="h-full">
        <ScanPayConfirm
          state={state}
          dispatch={dispatch}
          onBack={
            state.step === "confirmPayment" ? onConfirmBack : undefined
          }
        />
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
      <ScanPayResult state={state} dispatch={dispatch} onClose={onClose} />
    );
  } else if (state.step === "successReward" && state.transaction) {
    content = (
      <ScanPayReward
        transaction={state.transaction}
        revealed={state.rewardRevealed}
        onReveal={() => dispatch({ type: "REVEAL_REWARD" })}
        onViewDetails={() => openTransactionDetails(state.transaction!)}
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
  } else if (state.step === "faq") {
    content = (
      <ScanPayFaq
        origin={state.paymentContext.origin}
        onBack={() => dispatch({ type: "BACK" })}
      />
    );
  }

  return (
    <>
      {content}
      {notice ? (
        <div
          className="fixed bottom-24 left-1/2 z-[160] -translate-x-1/2 rounded-pill bg-pine px-4 py-2 text-body-sm font-bold text-white shadow-menu"
          role="status"
        >
          {notice}
        </div>
      ) : null}
    </>
  );
}
