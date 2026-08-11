"use client";

import { PrimaryFooter } from "@/components/onboarding/PrimaryFooter";
import { SuccessSealIcon } from "@/components/onboarding/SuccessSealIcon";
import { MpinHeader } from "./MpinHeader";

type MpinSuccessStepProps = {
  onContinue: () => void;
};

/** Structural twin of `KycCompletedStep`, so both confirmations read alike. */
export function MpinSuccessStep({ onContinue }: MpinSuccessStepProps) {
  return (
    <>
      <MpinHeader />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-page pb-4 pt-5 text-center">
        <SuccessSealIcon size={64} />
        <h1 className="type-section-title mt-5">MPIN Created Successfully</h1>
        <p className="type-body-secondary mt-2 max-w-[280px]">
          Your 4-digit MPIN is set. You&rsquo;ll use it to sign in and authorise
          payments.
        </p>
      </main>

      <PrimaryFooter label="Continue" onClick={onContinue} />
    </>
  );
}
