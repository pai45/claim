"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type FeatureScreenProps = {
  title?: string;
  eyebrow?: string;
};

export function FeatureScreenTemplate({
  title = "Feature Overview",
  eyebrow = "Benefits & Claims",
}: FeatureScreenProps) {
  const router = useRouter();

  return (
    <AppShell variant="surface">
      <ScreenHeader
        title={title}
        eyebrow={eyebrow}
        onBack={() => router.back()}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-8 pt-2">
        {/* Section 1: Hero / Summary */}
        <section
          className="animate-rise-in rounded-card border border-border-line bg-white p-card shadow-card"
          style={staggerStyle(0)}
        >
          <p className="type-field-label text-pine-primary">Total Available Limit</p>
          <p className="type-amount mt-1 text-display">₹45,000</p>
          <p className="mt-1 type-body-secondary text-caption">
            FY 2026-27 • Updated 2 hours ago
          </p>
        </section>

        {/* Section 2: Interactive List */}
        <section className="flex flex-col gap-2">
          <h2 className="type-section-title text-pine-primary">Recent Claims</h2>
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((item, idx) => (
              <div
                key={item}
                className="animate-rise-in flex items-center justify-between rounded-card border border-border-line bg-white p-card shadow-card"
                style={staggerStyle(idx + 1)}
              >
                <div className="flex flex-col">
                  <p className="text-body-sm font-bold text-pine">Fuel Reimbursement</p>
                  <p className="text-caption text-ink-secondary">HP Petrol • 12 May</p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm font-bold text-pine">₹1,200</p>
                  <span className="rounded-pill bg-success-soft px-2 py-0.5 text-caption font-semibold text-success border border-success-border">
                    Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action */}
      <footer className="shrink-0 border-t border-border-soft bg-white px-page pb-6 pt-3">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => router.push("/claims/new")}
        >
          Submit New Claim
        </button>
      </footer>
    </AppShell>
  );
}
