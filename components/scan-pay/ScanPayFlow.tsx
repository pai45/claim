"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { PaymentCheckoutFlow } from "@/components/scan-pay/PaymentCheckoutFlow";
import {
  ScanPayScanner,
  UpiEntryDrawer,
} from "@/components/scan-pay/ScanPayScanner";
import { createInitialScanPayState, scanPayReducer } from "@/features/scan-pay/machine";
import type { ScanPayFlowProps } from "@/features/scan-pay/types";
import { useModalFocus } from "@/lib/ui/useModalFocus";

const SCANNER_DURATION_MS = 3000;
const QR_DETECTED_AT_MS = 2400;
const DEFAULT_LAUNCH = { kind: "scanner" } as const;

export function ScanPayFlow({
  open,
  scenario,
  mode,
  merchantType,
  launch = DEFAULT_LAUNCH,
  onClose,
}: ScanPayFlowProps) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(
    scanPayReducer,
    createInitialScanPayState(scenario, mode, merchantType, launch),
  );
  const [scannerDetected, setScannerDetected] = useState(false);
  const isListUpiEntry =
    launch.kind === "upi-entry" && state.step === "upiEntry";
  useModalFocus(flowRef, open && !isListUpiEntry, onClose);

  useEffect(() => {
    if (!open) return;
    dispatch({ type: "RESET", scenario, mode, merchantType, launch });
  }, [launch, merchantType, mode, open, scenario]);

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

  if (!open) return null;

  if (isListUpiEntry) {
    return (
      <div className="fixed inset-0 z-[120] mx-auto max-w-phone">
        <UpiEntryDrawer
          open
          upiId={state.upiIdDraft}
          onChange={(upiId) => dispatch({ type: "SET_UPI_ID", upiId })}
          onVerify={() => dispatch({ type: "VERIFY_UPI" })}
          onClose={onClose}
        />
      </div>
    );
  }

  let content;
  if (state.step === "scanner" || state.step === "upiEntry") {
    content = (
      <div className="relative h-full">
        <ScanPayScanner
          state={state}
          dispatch={dispatch}
          onClose={onClose}
          onUpiEntryClose={launch.kind === "upi-entry" ? onClose : undefined}
          detected={scannerDetected && !state.qrErrorVisible}
        />
      </div>
    );
  } else {
    content = (
      <PaymentCheckoutFlow
        state={state}
        dispatch={dispatch}
        onClose={onClose}
        onConfirmBack={launch.kind === "payee" ? onClose : undefined}
      />
    );
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
    </div>
  );
}
