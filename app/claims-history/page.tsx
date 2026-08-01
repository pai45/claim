import { Suspense } from "react";
import { ClaimsHistoryScreen } from "@/components/claims-history/ClaimsHistoryScreen";

export default function ClaimsHistoryPage() {
  return (
    <main className="min-h-dvh w-full">
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-[402px] items-center justify-center bg-[#F8FAF8]">
            <p className="font-sans text-sm text-[#595E70]">Loading…</p>
          </div>
        }
      >
        <ClaimsHistoryScreen />
      </Suspense>
    </main>
  );
}
