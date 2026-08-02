"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { AppShell } from "@/components/shared/AppShell";
import {
  AVAILABLE_LIMIT,
  DASHBOARD_CATEGORIES,
  FY_LABEL,
  FY_LIMIT,
  UTILIZED_AMOUNT,
  formatINR,
} from "@/features/dashboard/constants";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke={colors.pinePrimary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClaimsDashboardScreen() {
  const router = useRouter();
  const utilizedPercent = Math.min(100, (UTILIZED_AMOUNT / FY_LIMIT) * 100);

  return (
    <AppShell className="overflow-hidden">
      <header className="flex items-center gap-4 bg-white px-page pb-4 pt-2">
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
        <h1 className="type-screen-title flex-1 truncate">Claims Dashboard</h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-24 pt-8">
        <section className="animate-rise-in flex flex-col gap-5 rounded-card border border-mint bg-gradient-to-b from-white to-surface-tint-strong p-card shadow-soft">
          <div className="flex flex-col gap-3">
            <p className="type-field-label text-center tracking-wide">AVAILABLE LIMIT</p>
            <p className="type-amount">{formatINR(AVAILABLE_LIMIT)}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="h-2 w-full overflow-hidden rounded bg-border-muted">
              <div
                className="h-full rounded bg-success"
                style={{ width: `${utilizedPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Utilized for {FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-ink">
                  {formatINR(UTILIZED_AMOUNT)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Limit for {FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-success">
                  {formatINR(FY_LIMIT)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-card border border-border-line bg-white">
          {DASHBOARD_CATEGORIES.map((category, index) => {
            const isLast = index === DASHBOARD_CATEGORIES.length - 1;

            return (
              <Link
                key={category.id}
                href={`/dashboard/${category.id}/`}
                style={staggerStyle(index + 1)}
                className={`animate-rise-in flex w-full items-center gap-3 px-page py-4 ${
                  !isLast ? "border-b border-border-line" : ""
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control"
                  style={{ background: category.iconBg }}
                >
                  <CategoryIcon icon={category.icon} color={category.iconColor} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-body font-bold">{category.name}</span>
                  <span className="type-body-secondary font-bold">{formatINR(category.amount)}</span>
                </div>
                <ChevronRight />
              </Link>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
