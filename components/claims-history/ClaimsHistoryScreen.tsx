"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  CLAIM_HISTORY_ITEMS,
  CLAIM_STATUS_STYLES,
  CLAIM_STATUS_TABS,
  formatINR,
  isClaimStatusFilter,
  type ClaimStatusFilter,
} from "@/features/claims-history/constants";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { CategoryIcon } from "./CategoryIcon";

export function ClaimsHistoryScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("status");
  const [activeTab, setActiveTab] = useState<ClaimStatusFilter>(
    isClaimStatusFilter(initialFilter) ? initialFilter : "all",
  );

  const claims = useMemo(() => {
    if (activeTab === "all") return CLAIM_HISTORY_ITEMS;
    return CLAIM_HISTORY_ITEMS.filter((claim) => claim.status === activeTab);
  }, [activeTab]);

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
          <div className="rounded-card border border-border-line bg-white p-card shadow-card">
            <p className="type-body-secondary py-6 text-center">
              No claims in this status yet.
            </p>
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
