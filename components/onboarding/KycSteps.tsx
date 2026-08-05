"use client";

import Image from "next/image";
import { colors } from "@/lib/ui/colors";
import { withBasePath } from "@/lib/basePath";
import { OnboardingHeader } from "./OnboardingHeader";
import { CenterModal } from "./OnboardingModals";
import { PrimaryFooter } from "./PrimaryFooter";

type KycIntroStepProps = {
  onStart: () => void;
  onCompleted: () => void;
  /** True once the VKYC page has been handed off to and not yet come back from. */
  awaitingReturn: boolean;
};

export function KycIntroStep({
  onStart,
  onCompleted,
  awaitingReturn,
}: KycIntroStepProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f1f1f1]">
      <main className="flex shrink-0 flex-col px-[19px]">
        <Image
          src={withBasePath("/assets/kyc-verification.svg")}
          alt=""
          width={181}
          height={128}
          unoptimized
          className="mx-auto mt-[18px] block h-32 w-[181px] shrink-0"
          aria-hidden="true"
        />
        <h1 className="mt-5 text-center font-display text-[28px] leading-[30px] font-bold text-[#0d3838]">
          Complete your
          <br />
          KYC Verification
        </h1>
        <p className="mt-6 text-center text-[18px] leading-[22px] text-[#5f6174]">
          KYC requires camera &amp; microphone access.
          <br />
          Please allow location and enable pop-ups in your
          <br />
          browser.
        </p>
        <ul className="mt-[25px] divide-y divide-[#eeeeee] rounded-2xl bg-white px-4 py-px text-[16px] leading-6 text-[#25282a]">
          <li className="flex min-h-14 items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Keep your original PAN card handy.</span>
          </li>
          <li className="flex min-h-[76px] items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Ensure access to your Aadhaar-linked mobile number.</span>
          </li>
          <li className="flex min-h-14 items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Return here after completing your KYC.</span>
          </li>
        </ul>
      </main>

      <div className="mt-auto shrink-0 px-[19px] pb-[max(17px,env(safe-area-inset-bottom))] pt-8">
        {awaitingReturn ? (
          <p className="mb-3 text-center text-[15px] leading-5 text-[#5f6174]">
            Finish the steps in the browser, then come back here.
          </p>
        ) : null}
        <button
          type="button"
          className="flex h-[50px] w-full items-center justify-center rounded-lg bg-[#196261] px-4 text-center text-[17px] leading-6 text-white"
          onClick={onStart}
        >
          {awaitingReturn
            ? "Reopen KYC tab"
            : "Ready? Let's begin KYC in browser."}
        </button>
        <button
          type="button"
          className="mt-3 flex h-[50px] w-full items-center justify-center rounded-lg border border-[#006060] bg-white px-4 text-center text-[17px] leading-6 text-[#006060]"
          onClick={onCompleted}
        >
          I&apos;ve completed my KYC
        </button>
      </div>
    </div>
  );
}

type KycProgressOverlayProps = {
  open: boolean;
  onDismiss: () => void;
};

export function KycProgressOverlay({
  open,
  onDismiss,
}: KycProgressOverlayProps) {
  return (
    <CenterModal
      open={open}
      variant="info"
      title="Verifying your KYC"
      description="Hang tight — we're confirming your Video KYC with Pine Labs."
      onConfirm={onDismiss}
      onClose={onDismiss}
    />
  );
}

type KycCompletedStepProps = {
  onContinue: () => void;
};

export function KycCompletedStep({ onContinue }: KycCompletedStepProps) {
  return (
    <>
      <OnboardingHeader title="KYC Verification" />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-page pb-4 text-center">
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: colors.success }}
          aria-hidden="true"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="m6.5 12.5 3.5 3.5 7.5-8"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="type-section-title mt-5">KYC Completed</h2>
        <p className="type-body-secondary mt-2 max-w-[280px]">
          Your KYC verification has been successfully completed.
        </p>
      </main>
      <PrimaryFooter label="Continue" onClick={onContinue} />
    </>
  );
}
