"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionDetailsScreen } from "@/components/transactions/TransactionDetailsScreen";

function TransactionDetailsInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "txn-amazon";
  return <TransactionDetailsScreen transactionId={id} />;
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
