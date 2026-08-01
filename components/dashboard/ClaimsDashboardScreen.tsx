"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import {
  AVAILABLE_LIMIT,
  DASHBOARD_CATEGORIES,
  FY_LABEL,
  FY_LIMIT,
  UTILIZED_AMOUNT,
  formatINR,
} from "@/features/dashboard/constants";

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="#005656"
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
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 bg-white px-4 pb-4 pt-2">
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
        <h1 className="flex-1 truncate font-sans text-xl font-bold text-pine">
          Claims Dashboard
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-8">
        <section className="flex flex-col gap-5 rounded-2xl border border-[#36D7A6] bg-gradient-to-b from-[#FAFFF9] to-[#E8F2EE] p-5 shadow-[2px_3px_4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3">
            <p className="text-center font-sans text-xs font-bold leading-4 tracking-wide text-[#595E70]">
              AVAILABLE LIMIT
            </p>
            <p className="font-sans text-[32px] font-bold leading-8 text-[#003434]">
              {formatINR(AVAILABLE_LIMIT)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="h-2 w-full overflow-hidden rounded bg-[#DCE8E4]">
              <div
                className="h-full rounded bg-[#2D6A4F]"
                style={{ width: `${utilizedPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-xs text-[#566B66]">
                  Utilized for {FY_LABEL}:
                </span>
                <span className="font-sans text-sm font-bold text-[#0F2C25]">
                  {formatINR(UTILIZED_AMOUNT)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-sans text-xs text-[#566B66]">
                  Limit for {FY_LABEL}:
                </span>
                <span className="font-sans text-sm font-bold text-[#2D6A4F]">
                  {formatINR(FY_LIMIT)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-black/5 bg-white">
          {DASHBOARD_CATEGORIES.map((category, index) => {
            const isLast = index === DASHBOARD_CATEGORIES.length - 1;

            return (
              <Link
                key={category.id}
                href={`/dashboard/${category.id}/`}
                className={`flex w-full items-center gap-3 px-4 py-4 ${
                  !isLast ? "border-b border-black/5" : ""
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: category.iconBg }}
                >
                  <CategoryIcon icon={category.icon} color={category.iconColor} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-sans text-[15px] font-semibold leading-5 text-[#1E1F24]">
                    {category.name}
                  </span>
                  <span className="font-sans text-base font-medium text-[#595E70]">
                    {formatINR(category.amount)}
                  </span>
                </div>
                <ChevronRight />
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
