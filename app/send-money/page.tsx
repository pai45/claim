import type { Metadata } from "next";
import { Suspense } from "react";
import { PayUpiScreen } from "@/components/send-money/PayUpiScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Pay to UPI ID | EB+",
  description: "Send money instantly to any UPI ID or recently paid contacts",
};

export default function SendMoneyPage() {
  return (
    <PersonaAccessGate requireUpi>
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-surface">
            <p className="type-body-secondary">Loading…</p>
          </div>
        }
      >
        <PayUpiScreen />
      </Suspense>
    </PersonaAccessGate>
  );
}
