import type { Metadata } from "next";
import { Suspense } from "react";
import { BankTransferScreen } from "@/components/bank-transfer/BankTransferScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Bank Transfer | EB+",
  description: "Transfer money from your EB+ balance to a bank account",
};

export default function BankTransferPage() {
  return (
    <PersonaAccessGate requireEbPlus>
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-surface">
            <p className="type-body-secondary">Loading…</p>
          </div>
        }
      >
        <BankTransferScreen />
      </Suspense>
    </PersonaAccessGate>
  );
}
