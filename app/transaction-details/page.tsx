"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionDetailsScreen } from "@/components/transactions/TransactionDetailsScreen";
import { resolveTransactionMode } from "@/features/transactions/mode";
import { resolveTransactionDetailsReturnTo } from "@/features/transactions/navigation";
import { useActivePersona } from "@/features/persona/useActivePersona";

function TransactionDetailsInner() {
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const id = searchParams.get("id") || "txn-amazon";
  const mode = resolveTransactionMode(searchParams.get("mode"), persona.access);
  const returnTo = resolveTransactionDetailsReturnTo(
    searchParams.get("returnTo"),
    mode,
  );
  return (
    <TransactionDetailsScreen
      transactionId={id}
      mode={mode}
      returnTo={returnTo}
    />
  );
}

export default function TransactionDetailsPage() {
  return (
    <main className="min-h-dvh w-full">
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-surface">
            <p className="type-body-secondary">Loading…</p>
          </div>
        }
      >
        <TransactionDetailsInner />
      </Suspense>
    </main>
  );
}
