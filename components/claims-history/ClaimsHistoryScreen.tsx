"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 bg-[#F8FAF8] px-4 pb-3 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
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
              stroke="#1E1F24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate font-display text-xl font-bold text-pine">
            Claims History
          </h1>
        </div>
      </header>

      <div className="overflow-x-auto border-b border-[#D8DADF] bg-[#F8FAF8] pt-2">
        <div className="flex min-w-max items-end">
          {CLAIM_STATUS_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center justify-center px-4 pt-2"
              >
                <span className="flex flex-col items-center gap-2">
                  <span
                    className={`text-center font-sans text-[15px] leading-5 ${
                      active
                        ? "font-bold text-[#1E1F24]"
                        : "font-normal text-[#595E70]"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`h-0.5 w-full rounded-t-full ${
                      active ? "bg-[#005656]" : "bg-transparent"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 pt-2">
        {claims.length === 0 ? (
          <p className="px-2 py-8 text-center font-sans text-sm text-[#595E70]">
            No claims in this status yet.
          </p>
        ) : (
          <section
            key={activeTab}
            className="overflow-hidden rounded-2xl border border-black/5 bg-white"
          >
            {claims.map((claim, index) => {
              const status = CLAIM_STATUS_STYLES[claim.status];
              const isLast = index === claims.length - 1;

              return (
                <Link
                  key={claim.id}
                  href={`/claim-details/?id=${encodeURIComponent(claim.id)}`}
                  style={staggerStyle(index)}
                  className={`animate-rise-in flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#F8FAF8] ${
                    !isLast ? "border-b border-[#EDEDF1]" : ""
                  }`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: claim.iconBg }}
                  >
                    <CategoryIcon icon={claim.icon} color={claim.iconColor} />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="font-sans text-[15px] font-bold text-[#1E1F24]">
                      {claim.merchant}
                    </h2>
                    <p className="font-sans text-[13px] text-[#8D92A3]">
                      {claim.category}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="font-sans text-[17px] font-bold text-[#1E1F24]">
                      {formatINR(claim.amount)}
                    </p>
                    <p className="font-sans text-[13px] text-[#8D92A3]">
                      {claim.date}
                    </p>
                    <span
                      className="rounded-full border px-2 py-0.5 text-center font-sans text-xs leading-4"
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
    </div>
  );
}
