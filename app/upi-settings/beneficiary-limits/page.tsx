import { Suspense } from "react";
import type { Metadata } from "next";
import { BeneficiaryLimitsScreen } from "@/components/beneficiary-limits/BeneficiaryLimitsScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Beneficiary Limits",
};

export default function BeneficiaryLimitsPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireUpi>
        <Suspense
          fallback={<div className="mx-auto h-dvh w-full max-w-phone bg-white" />}
        >
          <BeneficiaryLimitsScreen />
        </Suspense>
      </PersonaAccessGate>
    </main>
  );
}
