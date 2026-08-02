"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import {
  CLAIM_HISTORY_ITEMS,
  CLAIM_STATUS_STYLES,
  CLAIM_STATUS_TABS,
  formatINR,
  isClaimStatusFilter,
  type ClaimStatusFilter,
} from "@/features/claims-history/constants";
import { colors } from "@/lib/ui/colors";
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
      <header className="flex items-center gap-4 bg-surface px-page pb-3 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Claims History</h1>
        </div>
      </header>

      <div className="overflow-x-auto border-b border-border-tab bg-surface pt-2">
        <div className="flex min-w-max items-end">
          {CLAIM_STATUS_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center justify-center px-page pt-2"
              >
                <span className="flex flex-col items-center gap-2">
                  <span
                    className={`type-body text-center ${
                      active
                        ? "font-bold text-ink"
                        : "font-normal text-ink-secondary"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`h-0.5 w-full rounded-t-full ${
                      active ? "bg-pine-primary" : "bg-transparent"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-2">
        {claims.length === 0 ? (
          <p className="type-body-secondary px-2 py-8 text-center">
            No claims in this status yet.
          </p>
        ) : (
          <section
            key={activeTab}
            className="overflow-hidden rounded-card border border-border-line bg-white"
          >
            {claims.map((claim, index) => {
              const status = CLAIM_STATUS_STYLES[claim.status];
              const isLast = index === claims.length - 1;

              return (
                <Link
                  key={claim.id}
                  href={`/claim-details/?id=${encodeURIComponent(claim.id)}`}
                  style={staggerStyle(index)}
                  className={`animate-rise-in flex items-start gap-3 px-page py-3 transition-colors hover:bg-surface ${
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
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-title-sm font-bold text-ink">
                      {formatINR(claim.amount)}
                    </p>
                    <p className="type-body-secondary">{claim.date}</p>
                    <span
                      className="rounded-full border px-2 py-0.5 text-center text-caption leading-4"
                      style={{
                        background: status.bg,
                        borderColor: status.border,
                        color: status.text,
                      }}
                    >
                      {status.label}
                    </span>
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
