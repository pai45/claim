"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  applyClaimHistoryOverrides,
  getClaimHistoryItems,
  CLAIM_STATUS_STYLES,
  CLAIM_STATUS_TABS,
  formatINR,
  isClaimStatusFilter,
  type ClaimStatusFilter,
} from "@/features/claims-history/constants";
import { useClaimOverrides } from "@/features/claims/useClaimStore";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { CategoryIcon } from "./CategoryIcon";

export function ClaimsHistoryScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("status");
  const [activeTab, setActiveTab] = useState<ClaimStatusFilter>(
    isClaimStatusFilter(initialFilter) ? initialFilter : "all",
  );
  const overrides = useClaimOverrides();
  const { personaId } = useActivePersona();

  const claims = useMemo(() => {
    const baseItems = getClaimHistoryItems(personaId);
    const resolved = applyClaimHistoryOverrides(baseItems, overrides);
    if (activeTab === "all") return resolved;
    return resolved.filter((claim) => claim.status === activeTab);
  }, [activeTab, overrides, personaId]);

  function handleTabChange(tab: ClaimStatusFilter) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    const query = params.toString();
    router.replace(query ? `/claims-history?${query}` : "/claims-history", {
      scroll: false,
    });
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Claims History"
        onBack={() => router.push("/#claims")}
      />

      <div className="overflow-x-auto border-b border-border-tab bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-end px-2 pt-1" role="tablist" aria-label="Claim status">
          {CLAIM_STATUS_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(tab.id)}
                className="flex min-h-11 items-center justify-center px-3 pt-2"
              >
                <span className="flex flex-col items-center gap-2">
                  <span
                    className={`type-body whitespace-nowrap text-center ${
                      active
                        ? "font-bold text-ink"
                        : "font-normal text-ink-secondary"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`h-0.5 w-full rounded-pill ${
                      active ? "bg-pine-primary" : "bg-transparent"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-4">
        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-border-line bg-white p-card py-10 shadow-card text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-subtle mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="type-section-title text-ink mb-1">No claims found</h3>
            <p className="type-body-secondary max-w-[260px] mb-5">
              {activeTab === "all"
                ? "You haven't submitted any benefit claims yet. Use the Benefits Assistant to submit your first claim!"
                : `No claims currently in "${CLAIM_STATUS_TABS.find((t) => t.id === activeTab)?.label}" status.`}
            </p>
            <Link
              href="/#claims"
              className="btn-primary min-h-11 h-auto py-2.5 px-6 text-sm font-semibold inline-flex items-center gap-2"
            >
              Go to Claims
            </Link>
          </div>
        ) : (
          <section
            key={activeTab}
            className="overflow-hidden rounded-card border border-border-line bg-white shadow-card"
          >
            {claims.map((claim, index) => {
              const status = CLAIM_STATUS_STYLES[claim.status];
              const isLast = index === claims.length - 1;

              return (
                <Link
                  key={claim.id}
                  href={`/claim-details/?id=${encodeURIComponent(claim.id)}&from=history`}
                  style={staggerStyle(index)}
                  className={`animate-rise-in flex min-h-11 items-start gap-3 px-page py-3.5 transition-colors hover:bg-surface ${
                    !isLast ? "border-b border-border-line" : ""
                  }`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control"
                    style={{ background: claim.iconBg }}
                  >
                    <CategoryIcon icon={claim.icon} color={claim.iconColor} />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="type-body font-bold">{claim.merchant}</h2>
                    <p className="type-body-secondary">{claim.category}</p>
                    <span
                      className={`mt-0.5 w-fit rounded-pill border px-2 py-0.5 text-center text-caption leading-4 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-body-sm font-bold text-pine">
                      {formatINR(claim.amount)}
                    </p>
                    <p className="text-caption text-ink-secondary">{claim.date}</p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
