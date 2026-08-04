"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { AppShell } from "@/components/shared/AppShell";
import {
  BENEFIT_DASHBOARD_FY_LABEL,
  getBenefitClaimsDashboard,
  statusStyles,
  type BenefitClaimStatus,
} from "@/features/dashboard/benefitClaims";
import {
  DASHBOARD_CATEGORIES,
  formatINR,
} from "@/features/dashboard/constants";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type BenefitClaimsScreenProps = {
  categoryId: string;
};

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={colors.ink}
        strokeWidth="1.5"
      />
      <path
        d="M3 10h18"
        stroke={colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 3v4M16 3v4"
        stroke={colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: BenefitClaimStatus }) {
  const styles = statusStyles(status);

  return (
    <span
      className="inline-flex min-h-6 min-w-6 items-center rounded-full px-2 py-0.5"
      style={{
        background: styles.bg,
        boxShadow: `inset 0 0 0 1px ${styles.border}`,
      }}
    >
      <span
        className="text-center text-caption font-normal leading-4"
        style={{ color: styles.text }}
      >
        {status}
      </span>
    </span>
  );
}

export function BenefitClaimsScreen({ categoryId }: BenefitClaimsScreenProps) {
  const router = useRouter();
  const data = getBenefitClaimsDashboard(categoryId);
  const categoryMeta =
    DASHBOARD_CATEGORIES.find((item) => item.id === data.categoryId) ??
    DASHBOARD_CATEGORIES[0];

  const progressPercent = Math.min(
    100,
    data.accrued > 0 ? (data.utilized / data.accrued) * 100 : 0,
  );

  return (
    <AppShell className="overflow-hidden">
      <header className="flex items-center gap-4 bg-white px-page pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/dashboard/")}
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
        <h1 className="type-screen-title flex-1 truncate">{data.title}</h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-10 pt-4">
        <section className="animate-rise-in relative flex flex-col gap-5 rounded-card border border-success bg-linear-to-b from-white to-success-tint p-card shadow-soft">
          <div className="absolute right-3 top-2.5">
            <span className="inline-flex min-h-6 min-w-6 items-center rounded-full bg-surface px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--color-border-muted)]">
              <span className="type-field-label text-center normal-case">
                {data.frequencyLabel}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <CategoryIcon icon={categoryMeta.icon} color={colors.pine} />
              <p className="type-field-label tracking-wide">AVAILABLE LIMIT</p>
            </div>
            <p className="type-amount">{formatINR(data.availableLimit)}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="h-2 w-full overflow-hidden rounded bg-border-muted">
              <div
                className="h-full rounded bg-success"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Utilized for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-ink">
                  {formatINR(data.utilized)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Accrued for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-success">
                  {formatINR(data.accrued)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-rise-in flex flex-col" style={staggerStyle(1)}>
          <div className="flex flex-col gap-3 rounded-t-bubble border border-border-line bg-white p-card">
            <div className="flex items-center justify-between">
              <h2 className="type-body font-bold text-ink">{data.monthLabel}</h2>
              <CalendarIcon />
            </div>

            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1 rounded-control bg-surface p-3">
                <span className="type-field-label">Total Claims</span>
                <span className="text-body font-bold text-ink">
                  {formatINR(data.monthTotal)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-control bg-success-soft p-3">
                <span className="type-field-label text-success">Approved</span>
                <span className="text-body font-bold text-success">
                  {formatINR(data.monthApproved)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-control bg-warning-soft p-3">
                <span className="type-field-label text-warning">Pending</span>
                <span className="text-body font-bold text-warning">
                  {formatINR(data.monthPending)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-b-card border border-t-0 border-border-line bg-white">
            {data.claims.map((claim, index) => (
              <Link
                key={claim.id}
                href={`/claim-details/?id=${encodeURIComponent(claim.id)}&from=dashboard`}
                style={staggerStyle(index + 2)}
                className="animate-rise-in flex w-full items-start gap-3 border-b border-border-line px-page py-3 last:border-b-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
                  <CategoryIcon icon={categoryMeta.icon} color={colors.pinePrimary} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-body font-bold">{claim.title}</span>
                  <span className="type-body-secondary">{claim.category}</span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-title-sm font-bold text-ink">
                    {formatINR(claim.amount)}
                  </span>
                  <span className="type-body-secondary">{claim.date}</span>
                  <StatusBadge status={claim.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

