"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ClaimDetailsScreen } from "./ClaimDetailsScreen";

function ClaimDetailsInner() {
  const searchParams = useSearchParams();
  const claimId = searchParams.get("id") || "CLM-43872";
  return <ClaimDetailsScreen claimId={claimId} />;
}

export function ClaimDetailsPageClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-dvh w-full max-w-[402px] items-center justify-center bg-[#F8FAF8]">
          <p className="font-sans text-sm text-muted">Loading claim…</p>
        </div>
      }
    >
      <ClaimDetailsInner />
    </Suspense>
  );
}
