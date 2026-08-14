"use client";

import { useCallback, useEffect, useState, type Dispatch } from "react";
import { useRouter } from "next/navigation";
import { MobileOtpSheet } from "@/components/bank-transfer/MobileOtpSheet";
import { ScanPayConfirm } from "@/components/scan-pay/ScanPayConfirm";
import {
  ScanPayBankTransferPaid,
  ScanPayReward,
} from "@/components/scan-pay/ScanPayReward";
import {
  ScanPayPaymentDetails,
  ScanPayReceiptCapture,
  ScanPayReceiptReview,
  ScanPayResult,
  ScanPaySubmitting,
} from "@/components/scan-pay/ScanPayResult";
import { ScanPayFaq } from "@/components/scan-pay/ScanPayScanner";
import { ScanPaySuccessTick } from "@/components/scan-pay/ScanPaySuccessTick";
import { createPaymentLedgerRows } from "@/features/scan-pay/ledger";
import { recordBankTransfer } from "@/features/bank-transfer/history";
import { bankTransferTotal } from "@/features/bank-transfer/fees";
import { createPaymentTransactionForState } from "@/features/scan-pay/machine";
import { recordRecipientPayment } from "@/features/send-money/history";
import {
  downloadScanPayReceipt,
  shareScanPayReceipt,
  transactionStatusLabel,
} from "@/features/scan-pay/receipt";
import {
  buildCompletedPaymentReturnTo,
  saveCompletedPaymentReturn,
} from "@/features/scan-pay/paymentReturn";
import {
  PAID_ENTER_BASE_MS,
  SUBMIT_DELAY_MS,
  SUCCESS_VEIL_MS,
} from "@/features/scan-pay/timing";
import type {
  ScanPayAction,
  ScanPayState,
  ScanPayTransaction,
} from "@/features/scan-pay/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { getBaseWalletBalances } from "@/features/transactions/constants";
import { commitBenefitPayment } from "@/features/transactions/financialState";
import type { FundingAllocation } from "@/features/transactions/financialState";
import { recordPlusPayTransaction } from "@/features/transactions/plusPayHistory";
import { buildTransactionDetailsHref } from "@/features/transactions/navigation";
import "./scanPay.css";

/** Read lazily inside effects and handlers — tests render with `environment: "node"`. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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
  const { personaId, persona } = useActivePersona();
  const [notice, setNotice] = useState<string | null>(null);
  const [bankOtpOpen, setBankOtpOpen] = useState(false);
  const [pendingBankPayment, setPendingBankPayment] = useState<
    FundingAllocation[] | null
  >(null);
  /**
   * The transaction waiting behind the success tick. `RESOLVE_PAYMENT` is deferred
   * until the green covers the screen, so the step swap is never visible.
   */
  const [veiledTransaction, setVeiledTransaction] =
    useState<ScanPayTransaction | null>(null);
  /** Offsets the paid-to screen's entrance so it waits for the veil to lift. */
  const [paidEntranceBase, setPaidEntranceBase] = useState(0);

  const dispatchPaymentAction = useCallback<Dispatch<ScanPayAction>>(
    (action) => {
      if (
        action.type === "PAY" &&
        state.paymentContext.origin === "bank-transfer"
      ) {
        setPendingBankPayment(action.fundingAllocations ?? []);
        setBankOtpOpen(true);
        return;
      }
      // `goBack` returns from payment details to the paid-to screen, which by then
      // has no veil in front of it — a stale offset would leave it blank for a second.
      if (action.type === "OPEN_PAYMENT_DETAILS") setPaidEntranceBase(0);
      dispatch(action);
    },
    [dispatch, state.paymentContext.origin],
  );

  const closeBankOtp = useCallback(() => {
    setBankOtpOpen(false);
    setPendingBankPayment(null);
  }, []);

  const confirmBankOtp = useCallback(() => {
    if (!pendingBankPayment) return;
    setBankOtpOpen(false);
    setPendingBankPayment(null);
    dispatch({ type: "PAY", fundingAllocations: pendingBankPayment });
  }, [dispatch, pendingBankPayment]);

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

      // Only a settled success earns the tick. Failures and still-processing
      // payments resolve straight through, so a green tick never lands on top of
      // "Payment Failed".
      if (transaction.outcome === "success" && !prefersReducedMotion()) {
        setPaidEntranceBase(PAID_ENTER_BASE_MS);
        setVeiledTransaction(transaction);
        return;
      }
      setPaidEntranceBase(0);
      dispatch({ type: "RESOLVE_PAYMENT", transaction });
    }, SUBMIT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, personaId, state]);

  // Unmount the veil on its own clock, independent of the dispatch it triggers.
  useEffect(() => {
    if (!veiledTransaction) return;
    const timer = window.setTimeout(
      () => setVeiledTransaction(null),
      SUCCESS_VEIL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [veiledTransaction]);

  const resolveVeiledPayment = useCallback(() => {
    if (!veiledTransaction) return;
    dispatch({ type: "RESOLVE_PAYMENT", transaction: veiledTransaction });
  }, [dispatch, veiledTransaction]);

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
      saveCompletedPaymentReturn(transaction);
      router.push(
        buildTransactionDetailsHref({
          transactionId: transaction.transactionId,
          mode: transaction.mode,
          returnTo: buildCompletedPaymentReturnTo(transaction),
        }),
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
          dispatch={dispatchPaymentAction}
          onBack={
            state.step === "confirmPayment" ? onConfirmBack : undefined
          }
        />
      </div>
    );
  } else if (state.step === "submitting") {
    content = (
      <ScanPaySubmitting
        transactionAmount={
          state.paymentContext.origin === "bank-transfer"
            ? bankTransferTotal(Number(state.amount))
            : Number(state.amount)
        }
        onBack={() => dispatch({ type: "BACK" })}
      />
    );
  } else if (state.step === "result") {
    content = (
      state.transaction?.payee.kind === "bank-transfer" &&
      state.transaction.outcome !== "failed" ? (
        <ScanPayBankTransferPaid
          transaction={state.transaction}
          entranceBaseMs={paidEntranceBase}
          onDownload={handleDownload}
          onShare={handleShare}
          onClose={onClose}
        />
      ) : (
        <ScanPayResult state={state} dispatch={dispatch} onClose={onClose} />
      )
    );
  } else if (state.step === "successReward" && state.transaction) {
    content = (
      <ScanPayReward
        transaction={state.transaction}
        entranceBaseMs={paidEntranceBase}
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
      {veiledTransaction ? (
        <ScanPaySuccessTick
          statusLabel={
            transactionStatusLabel(veiledTransaction) === "Pending"
              ? "Transfer initiated"
              : "Payment successful"
          }
          onCovered={resolveVeiledPayment}
        />
      ) : null}
      {bankOtpOpen ? (
        <MobileOtpSheet
          open
          mobile={persona.profile.phone}
          onClose={closeBankOtp}
          onVerified={confirmBankOtp}
        />
      ) : null}
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
