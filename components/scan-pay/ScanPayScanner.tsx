"use client";

import { type ChangeEvent, type Dispatch } from "react";
import { ScanPayDrawer } from "@/components/scan-pay/ScanPayDrawer";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  BANK_TRANSFER_FAQS,
  SCAN_PAY_FAQS,
  merchantDetectedLabel,
} from "@/features/scan-pay/fixtures";
import type {
  PaymentContext,
  ScanPayAction,
  ScanPayState,
} from "@/features/scan-pay/types";
import { SCAN_PAY_ASSETS, UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";

export function ScanPayScanner({
  state,
  dispatch,
  onClose,
  onUpiEntryClose,
  detected,
}: {
  state: ScanPayState;
  dispatch: Dispatch<ScanPayAction>;
  onClose: () => void;
  onUpiEntryClose?: () => void;
  detected: boolean;
}) {
  function onGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;
    dispatch({ type: "DETECT_QR" });
    event.target.value = "";
  }

  return (
    <AppShell
      className={`scan-pay-shell scan-pay-scanner-stage relative overflow-hidden bg-pine-dark ${
        state.torchEnabled ? "is-torch-enabled" : ""
      } ${detected ? "is-detected" : ""}`}
    >
      <AppIcon
        src={SCAN_PAY_ASSETS.scannerDemo}
        alt="Pine Labs merchant QR on a payment terminal"
        width={402}
        height={874}
        priority
        className="scan-pay-scanner-image scan-pay-scanner-image--soft absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="scan-pay-camera-tint absolute inset-0 bg-pine-dark/10"
        aria-hidden="true"
      />
      <div
        className={`scan-pay-focus-window ${detected ? "is-detected" : ""}`}
        aria-hidden="true"
      >
        <AppIcon
          src={SCAN_PAY_ASSETS.scannerDemo}
          alt=""
          width={402}
          height={874}
          className="scan-pay-scanner-image scan-pay-scanner-image--sharp"
        />
      </div>

      <header className="relative z-10 flex shrink-0 items-center justify-between px-page pb-3 pt-6 text-white">
        <BackNavigationButton
          onClick={onClose}
          ariaLabel="Close Scan & Pay"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "OPEN_FAQ" })}
            className="flex h-12 min-h-11 w-12 min-w-11 items-center justify-center rounded-control bg-white/90 text-pine shadow-soft"
            aria-label="Scan & Pay help"
          >
            <AppIcon
              src={SCAN_PAY_ASSETS.questionCircle}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={state.torchEnabled}
            onClick={() => dispatch({ type: "TOGGLE_TORCH" })}
            className={`flex h-12 min-h-11 w-12 min-w-11 items-center justify-center rounded-control shadow-soft ${
              state.torchEnabled
                ? "bg-mint text-pine-dark"
                : "bg-white/90 text-pine"
            }`}
            aria-label="Toggle torch"
          >
            <AppIcon
              src={SCAN_PAY_ASSETS.flashlight}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
        </div>
      </header>

      {state.qrErrorVisible ? (
        <div
          className="animate-rise-in relative z-10 mx-page mt-1 flex items-start gap-3 rounded-card border border-danger bg-danger-soft p-card text-danger shadow-card"
          role="alert"
        >
          <ScanPayIcon name="warning" className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-bold">
              {state.qrErrorReason === "unsupported"
                ? "Merchant Not Supported"
                : "Invalid QR Code"}
            </p>
            <p className="mt-0.5 text-caption">
              {state.qrErrorReason === "unsupported"
                ? "EB+ wallets cannot be used at this merchant. Try another eligible merchant QR."
                : "This QR code could not be verified. Please scan a valid merchant QR."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "DISMISS_QR_ERROR" })}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control"
            aria-label={
              state.qrErrorReason === "unsupported"
                ? "Dismiss unsupported merchant message"
                : "Dismiss invalid QR message"
            }
          >
            <ScanPayIcon name="close" size={18} />
          </button>
        </div>
      ) : null}

      <main className="z-10 flex min-h-0 flex-1 items-end justify-center px-page pb-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "DETECT_QR" })}
          className={`scan-pay-beam min-h-11 rounded-pill ${
            state.qrErrorVisible ? "is-invalid" : ""
          } ${detected ? "is-detected" : ""}`}
          aria-label="Simulate QR detection"
        />
      </main>

      {detected ? (
        <div
          className="scan-pay-detected-status absolute left-1/2 z-20 flex min-h-11 items-center gap-2 rounded-pill bg-white px-4 text-body-sm font-bold text-pine shadow-icon"
          role="status"
          aria-live="polite"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-mint text-pine-dark">
            <ScanPayIcon name="check" size={16} />
          </span>
          {merchantDetectedLabel(state.merchantType)}
        </div>
      ) : null}

      <footer className="relative z-10 shrink-0 px-page pb-1">
        <label className="mx-auto flex h-12 min-h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-control border border-white/70 bg-pine-dark/35 px-4 text-body-sm font-bold text-white shadow-soft backdrop-blur-sm">
          <AppIcon
            src={SCAN_PAY_ASSETS.gallery}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5"
          />
          Pick from gallery
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onGalleryChange}
          />
        </label>
        <button
          type="button"
          onClick={() => dispatch({ type: "OPEN_UPI_ENTRY" })}
          className="mx-auto mt-3 flex h-14 min-h-11 w-full max-w-card items-center justify-center rounded-card bg-white px-4 text-body font-bold text-pine shadow-cta"
        >
          Enter a UPI ID
        </button>
        <AppIcon
          src={UPI_SETTINGS_ASSETS.poweredByUpi}
          alt="Powered by UPI"
          width={62}
          height={24}
          className="mx-auto mt-3 h-auto w-14 brightness-0 invert"
        />
      </footer>

      <ScanPayDrawer
        open={state.step === "upiEntry"}
        title="Will be deducted from UPI ID"
        description="Enter the merchant’s UPI ID to continue"
        onClose={onUpiEntryClose ?? (() => dispatch({ type: "BACK" }))}
      >
        <label htmlFor="scan-pay-upi" className="type-field-label">
          UPI ID
        </label>
        <div className="field-focus-shell mt-1.5 flex min-h-11 items-center gap-2 rounded-control border border-input-border bg-input-soft px-3">
          <input
            id="scan-pay-upi"
            value={state.upiIdDraft}
            onChange={(event) =>
              dispatch({ type: "SET_UPI_ID", upiId: event.target.value })
            }
            className="min-w-0 flex-1 bg-transparent text-body-sm font-bold text-pine outline-none"
            autoComplete="off"
          />
          <span className="text-success">
            <ScanPayIcon name="check" />
          </span>
        </div>
        <button
          type="button"
          className="btn-primary mt-5"
          disabled={!state.upiIdDraft.includes("@")}
          onClick={() => dispatch({ type: "VERIFY_UPI" })}
        >
          Verify
        </button>
      </ScanPayDrawer>
    </AppShell>
  );
}

export function ScanPayFaq({
  onBack,
  origin = "scan-pay",
}: {
  onBack: () => void;
  origin?: PaymentContext["origin"];
}) {
  const bankTransfer = origin === "bank-transfer";
  const faqs = bankTransfer ? BANK_TRANSFER_FAQS : SCAN_PAY_FAQS;
  return (
    <AppShell className="scan-pay-shell overflow-hidden bg-white">
      <ScreenHeader
        title={bankTransfer ? "Bank Transfer Help" : "Scan & Pay Help"}
        onBack={onBack}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-4">
        <h2 className="type-section-title text-pine">
          {bankTransfer
            ? "Got a question about your bank transfer?"
            : "Got a question about paying with QR codes?"}
        </h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-card border border-success-border bg-white shadow-card"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-card py-3 text-body-sm font-bold text-ink">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-surface-tint text-pine-primary group-open:rotate-45">
                  +
                </span>
                {faq.question}
              </summary>
              <p className="border-t border-border-soft px-card pb-4 pt-3 type-body-secondary">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
