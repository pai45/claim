"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  FY_LABEL,
  formatINR,
  getDashboardCategories,
  getDashboardTotals,
} from "@/features/dashboard/constants";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function ClaimsDashboardScreen() {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const categories = getDashboardCategories(personaId);
  const { availableLimit, utilizedAmount, financialYearLimit } =
    getDashboardTotals(personaId);
  const utilizedPercent = Math.min(
    100,
    financialYearLimit > 0
      ? (utilizedAmount / financialYearLimit) * 100
      : 0,
  );

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Claims Dashboard"
        onBack={() => router.push("/#claims")}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto px-page pb-8 pt-4">
        <section
          className="animate-rise-in flex flex-col gap-5 rounded-card border border-border-line bg-white p-card shadow-card"
          style={staggerStyle(0)}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="type-field-label">Available limit</p>
            <p className="type-amount text-center">{formatINR(availableLimit)}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div
              className="h-2 w-full overflow-hidden rounded-pill bg-surface-muted"
              role="progressbar"
              aria-valuenow={Math.round(utilizedPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Utilized ${Math.round(utilizedPercent)} percent of ${FY_LABEL} limit`}
            >
              <div
                className="h-full rounded-pill bg-pine-primary"
                style={{ width: `${utilizedPercent}%` }}
              />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Utilized · {FY_LABEL}
                </span>
                <span className="text-body-sm font-bold text-ink">
                  {formatINR(utilizedAmount)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col items-end gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Limit · {FY_LABEL}
                </span>
                <span className="text-body-sm font-bold text-pine-primary">
                  {formatINR(financialYearLimit)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-section-label">Categories</h2>
          <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
            {categories.map((category, index) => {
              const isLast = index === categories.length - 1;

              return (
                <Link
                  key={category.id}
                  href={`/dashboard/${category.id}/`}
                  style={staggerStyle(index + 1)}
                  className={`animate-rise-in flex min-h-11 w-full items-center gap-3 px-page py-3.5 transition-colors hover:bg-surface ${
                    !isLast ? "border-b border-border-line" : ""
                  }`}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control"
                    style={{ background: category.iconBg }}
                  >
                    <CategoryIcon icon={category.icon} color={category.iconColor} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="type-body font-bold">{category.name}</span>
                    <span className="type-body-secondary">Available</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-body-sm font-bold text-pine">
                      {formatINR(category.amount)}
                    </span>
                    <ChevronRightIcon />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
