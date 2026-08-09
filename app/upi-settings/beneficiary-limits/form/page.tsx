import { Suspense } from "react";
import type { Metadata } from "next";
import { BeneficiaryLimitFormScreen } from "@/components/beneficiary-limits/BeneficiaryLimitFormScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Register Beneficiary",
};

export default function BeneficiaryLimitFormPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireUpi>
        <Suspense
          fallback={<div className="mx-auto h-dvh w-full max-w-phone bg-white" />}
        >
          <BeneficiaryLimitFormScreen />
        </Suspense>
      </PersonaAccessGate>
    </main>
  );
}
