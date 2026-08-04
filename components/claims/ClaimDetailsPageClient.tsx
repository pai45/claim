"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ClaimDetailsScreen } from "./ClaimDetailsScreen";

function ClaimDetailsInner() {
  const searchParams = useSearchParams();
  const claimId = searchParams.get("id") || "CLM-43872";
  const source = searchParams.get("from");
  const backHref =
    source === "history"
      ? "/claims-history/"
      : source === "dashboard"
        ? "/dashboard/"
        : "/#claims";
  return <ClaimDetailsScreen claimId={claimId} backHref={backHref} />;
}

export function ClaimDetailsPageClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-surface">
          <p className="type-body-secondary">Loading claim…</p>
        </div>
      }
    >
      <ClaimDetailsInner />
    </Suspense>
  );
}

