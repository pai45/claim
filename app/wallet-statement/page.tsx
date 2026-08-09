import { Suspense } from "react";
import { WalletStatementScreen } from "@/components/wallet-statement/WalletStatementScreen";

export default function WalletStatementPage() {
  return (
    <main className="min-h-dvh w-full">
      <Suspense
        fallback={
          <div className="mx-auto flex h-dvh w-full max-w-phone items-center justify-center bg-bg">
            <p className="type-body-secondary">Loading…</p>
          </div>
        }
      >
        <WalletStatementScreen />
      </Suspense>
    </main>
  );
}
