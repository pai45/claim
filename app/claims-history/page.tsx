import { Suspense } from "react";
import { ClaimsHistoryScreen } from "@/components/claims-history/ClaimsHistoryScreen";

export default function ClaimsHistoryPage() {
  return (
    <main className="min-h-dvh w-full">
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-surface">
            <p className="type-body-secondary">Loading…</p>
          </div>
        }
      >
        <ClaimsHistoryScreen />
      </Suspense>
    </main>
  );
}
