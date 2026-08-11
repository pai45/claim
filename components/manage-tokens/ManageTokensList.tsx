"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { TokenIcon, type TokenBrand } from "./TokenIcon";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { AppIcon } from "@/components/shared/AppIcon";

export type TokenStatus = "Active" | "Suspended" | "Inactive";
export type TokenCategory = "Wallets" | "Merchants" | "Rupay";

export interface TokenItem {
  id: string;
  brand: TokenBrand;
  name: string;
  trid: string;
  lastUsed: string;
  createdDate: string;
  device: string;
  status: TokenStatus;
  category: TokenCategory;
  cardDetails: string;
  type: string;
}

export const MOCK_TOKENS: TokenItem[] = [
  {
    id: "apple-pay-1",
    brand: "apple",
    name: "Apple Pay",
    trid: "TRID-APL-4821-9032",
    lastUsed: "20 Jan 2026",
    createdDate: "11 Dec 2025",
    device: "Iphone 16 Pro",
    status: "Active",
    category: "Wallets",
    cardDetails: "•••• •••• •••• 7845",
    type: "Wallet Token",
  },
  {
    id: "google-pay-1",
    brand: "google",
    name: "Google Pay",
    trid: "TRID-GPL-4821-9032",
    lastUsed: "20 Jan 2026",
    createdDate: "10 Dec 2025",
    device: "Pixel 8",
    status: "Suspended",
    category: "Wallets",
    cardDetails: "•••• •••• •••• 1234",
    type: "Wallet Token",
  },
  {
    id: "amazon-1",
    brand: "amazon",
    name: "Amazon",
    trid: "TRID-AMZ-4821-9032",
    lastUsed: "12 Feb 2026",
    createdDate: "01 Jan 2026",
    device: "Web",
    status: "Active",
    category: "Merchants",
    cardDetails: "•••• •••• •••• 5678",
    type: "Merchant Token",
  },
  {
    id: "netflix-1",
    brand: "netflix",
    name: "Netflix",
    trid: "TRID-NTF-4821-9032",
    lastUsed: "20 Nov 2025",
    createdDate: "15 Nov 2025",
    device: "Smart TV",
    status: "Active",
    category: "Merchants",
    cardDetails: "•••• •••• •••• 9012",
    type: "Merchant Token",
  },
  {
    id: "spotify-1",
    brand: "spotify",
    name: "Spotify",
    trid: "TRID-SPT-4821-9032",
    lastUsed: "20 Nov 2025",
    createdDate: "12 Nov 2025",
    device: "Iphone 16 Pro",
    status: "Inactive",
    category: "Merchants",
    cardDetails: "•••• •••• •••• 3456",
    type: "Merchant Token",
  },
];

const TABS = ["All", "Wallets", "Merchants", "Rupay"] as const;
const FILTERS = ["All", "Active", "Suspended", "Inactive"] as const;

export function ManageTokensList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useModalFocus(filterRef, filterOpen, () => setFilterOpen(false));

  const filteredTokens = MOCK_TOKENS.filter((token) => {
    if (activeTab !== "All" && token.category !== activeTab) return false;
    if (activeFilter !== "All" && token.status !== activeFilter) return false;
    return true;
  });

  return (
    <AppShell className="bg-surface relative">
      <ScreenHeader title="Manage Tokens" onBack={() => router.push("/")} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-page px-page">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-pill px-4 py-1.5 text-body-sm font-medium transition-colors ${
                  isActive
                    ? "bg-pine text-white"
                    : "border border-border-muted bg-white text-ink-secondary"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between py-2 relative">
          <h2 className="type-section-title text-pine">All Tokens</h2>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 rounded-control border border-border-muted bg-white px-3 py-1.5 text-body-sm font-medium text-ink shadow-sm"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>

          {/* Filter Popover */}
          {filterOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFilterOpen(false)}
              />
              <div
                ref={filterRef}
                className="absolute right-0 top-12 z-50 w-48 rounded-card bg-white p-2 shadow-menu animate-rise-in"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex flex-col">
                  {FILTERS.map((f) => {
                    const isSelected = activeFilter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          setActiveFilter(f);
                          setFilterOpen(false);
                        }}
                        className="flex items-center justify-between rounded-control px-3 py-3 text-left text-body-sm transition-colors hover:bg-surface-muted"
                      >
                        <span className={isSelected ? "text-pine font-bold" : "text-ink-secondary"}>
                          {f}
                        </span>
                        {isSelected && <CheckIcon className="h-5 w-5 text-pine" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Token List */}
        <div className="flex flex-col gap-3 mt-4">
          {filteredTokens.length === 0 ? (
            <p className="text-center text-body-secondary py-8">
              No tokens found for the selected filters.
            </p>
          ) : (
            filteredTokens.map((token, index) => (
              <TokenCard
                key={token.id}
                token={token}
                index={index}
                onClick={() => router.push(`/manage-tokens/${token.id}`)}
              />
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}

function TokenCard({
  token,
  index,
  onClick,
}: {
  token: TokenItem;
  index: number;
  onClick: () => void;
}) {
  let statusClass = "";
  switch (token.status) {
    case "Active":
      statusClass = "bg-success-soft text-success";
      break;
    case "Suspended":
      statusClass = "bg-warning-soft text-warning-ink";
      break;
    case "Inactive":
      statusClass = "bg-surface-muted text-subtle";
      break;
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-card bg-white p-4 shadow-card transition-transform active:scale-[0.98] animate-rise-in text-left"
      style={staggerStyle(index)}
    >
      <TokenIcon brand={token.brand} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="truncate type-body font-bold text-pine">{token.name}</h3>
          <span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
            {token.status}
          </span>
        </div>
        <p className="truncate text-body-sm text-ink-secondary mt-0.5">
          {token.trid}
        </p>
        <p className="text-xs text-ink-tertiary mt-1">
          Last used: {token.lastUsed}
        </p>
      </div>

      <div className="shrink-0 text-ink-tertiary ml-2">
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    </button>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
