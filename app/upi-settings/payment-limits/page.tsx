import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentLimitsScreen } from "@/components/payment-limits/PaymentLimitsScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Payment Limits",
};

export default function PaymentLimitsPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireUpi>
        <Suspense
          fallback={<div className="mx-auto h-dvh w-full max-w-phone bg-white" />}
        >
          <PaymentLimitsScreen />
        </Suspense>
      </PersonaAccessGate>
    </main>
  );
}
