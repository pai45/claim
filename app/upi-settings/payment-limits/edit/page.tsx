import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentLimitEditScreen } from "@/components/payment-limits/PaymentLimitEditScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Edit Payment Limit",
};

export default function PaymentLimitEditPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireUpi>
        <Suspense
          fallback={<div className="mx-auto h-dvh w-full max-w-phone bg-white" />}
        >
          <PaymentLimitEditScreen />
        </Suspense>
      </PersonaAccessGate>
    </main>
  );
}
