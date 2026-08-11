"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { TokenIcon } from "./TokenIcon";
import { MOCK_TOKENS, type TokenItem } from "./ManageTokensList";
import { AppIcon } from "@/components/shared/AppIcon";

export function TokenDetails({ tokenId }: { tokenId: string }) {
  const router = useRouter();
  const token = MOCK_TOKENS.find((t) => t.id === tokenId);

  if (!token) {
    return (
      <AppShell className="bg-surface">
        <ScreenHeader title="Token Details" onBack={() => router.push("/manage-tokens")} />
        <div className="flex h-full items-center justify-center">
          <p className="text-body-secondary">Token not found.</p>
        </div>
      </AppShell>
    );
  }

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
    <AppShell className="bg-surface">
      <ScreenHeader title="Token Details" onBack={() => router.push("/manage-tokens")} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-6 pt-4 gap-4">
        {/* Header Card */}
        <div className="flex items-center justify-between rounded-card bg-white p-4 shadow-card animate-rise-in">
          <div className="flex items-center gap-4">
            <TokenIcon brand={token.brand} />
            <h2 className="type-body font-bold text-pine">{token.name}</h2>
          </div>
          <span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
            {token.status}
          </span>
        </div>

        <h3 className="type-section-title text-pine mt-2">Token Information</h3>

        {/* Details Card */}
        <div className="flex flex-col gap-4 rounded-card bg-white p-4 shadow-card animate-rise-in" style={{ animationDelay: "50ms" }}>
          <DetailRow
            icon={<ReceiptIcon />}
            label="Token Reference ID (TRID)"
            value={token.trid}
          />
          <DetailRow
            icon={<CubeIcon />}
            label="Token Type"
            value={token.type}
          />
          <DetailRow
            icon={<CardIcon />}
            label="Card Details"
            value={
              <span className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-800 italic">RuPay</span>
                <span>{token.cardDetails}</span>
              </span>
            }
          />
          <DetailRow
            icon={<ClockIcon />}
            label="Last Used"
            value={token.lastUsed}
          />
          <DetailRow
            icon={<CalendarIcon />}
            label="Created Date"
            value={token.createdDate}
          />
          <DetailRow
            icon={<DeviceIcon />}
            label="Device"
            value={token.device}
          />
        </div>

        {/* Actions Card */}
        <div className="flex flex-col rounded-card bg-white shadow-card animate-rise-in overflow-hidden" style={{ animationDelay: "100ms" }}>
          <button className="flex items-center justify-between p-4 transition-colors hover:bg-surface-muted border-b border-border-soft text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-soft text-pine">
                <PauseIcon className="h-5 w-5" />
              </div>
              <span className="type-body font-bold text-pine">Suspend Token</span>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-ink-tertiary" />
          </button>
          <button className="flex items-center justify-between p-4 transition-colors hover:bg-surface-muted text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-soft text-pine">
                <TrashIcon className="h-5 w-5" />
              </div>
              <span className="type-body font-bold text-pine">Delete Token</span>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-ink-tertiary" />
          </button>
        </div>
      </main>
    </AppShell>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 pt-0.5 text-ink-secondary">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-ink-secondary">{label}</span>
        <span className="text-body-sm font-medium text-pine mt-0.5">{value}</span>
      </div>
    </div>
  );
}

// Icons
function ReceiptIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="m21 16-9 5-9-5V8l9-5 9 5Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="4" height="16" x="6" y="4" />
      <rect width="4" height="16" x="14" y="4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
