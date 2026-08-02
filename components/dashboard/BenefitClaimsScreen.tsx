"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
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
        stroke="#252B37"
        strokeWidth="1.5"
      />
      <path
        d="M3 10h18"
        stroke="#252B37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 3v4M16 3v4"
        stroke="#252B37"
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
      className="inline-flex min-h-[22px] min-w-[22px] items-center rounded-full px-2 py-0.5"
      style={{
        background: styles.bg,
        boxShadow: `inset 0 0 0 1px ${styles.border}`,
      }}
    >
      <span
        className="text-center font-sans text-xs font-medium leading-4"
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
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 bg-white px-4 pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/dashboard/")}
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
          {data.title}
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-10 pt-4">
        <section className="animate-rise-in relative flex flex-col gap-5 rounded-2xl border border-[#25B35B] bg-gradient-to-b from-[#FBFFF9] to-[#E9F2E8] p-5 shadow-[2px_3.17px_4.33px_rgba(0,0,0,0.04)]">
          <div className="absolute right-3 top-2.5">
            <span className="inline-flex min-h-[22px] min-w-[22px] items-center rounded-full bg-[#FAFAFA] px-1.5 py-0.5 shadow-[inset_0_0_0_1px_#E9EAEB]">
              <span className="text-center font-sans text-[10px] font-bold leading-[14px] text-[#595E70]">
                {data.frequencyLabel}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <CategoryIcon icon={categoryMeta.icon} color="#166534" />
              <p className="font-sans text-xs font-bold leading-4 tracking-wide text-[#595E70]">
                AVAILABLE LIMIT
              </p>
            </div>
            <p className="font-sans text-[32px] font-bold leading-8 text-[#003434]">
              {formatINR(data.availableLimit)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="h-2 w-full overflow-hidden rounded bg-[#DCE8E4]">
              <div
                className="h-full bg-[#2D6A4F]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-xs text-[#566B66]">
                  Utilized for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="font-sans text-sm font-bold text-[#0F2C25]">
                  {formatINR(data.utilized)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-sans text-xs text-[#566B66]">
                  Accrued for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="font-sans text-sm font-bold text-[#2D6A4F]">
                  {formatINR(data.accrued)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-rise-in flex flex-col" style={staggerStyle(1)}>
          <div className="flex flex-col gap-3 rounded-t-[20px] border border-[#E5ECE8] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-bold text-[#1E1F24]">
                {data.monthLabel}
              </h2>
              <CalendarIcon />
            </div>

            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1 rounded-xl bg-[#F8FAF8] p-3">
                <span className="font-sans text-[10px] font-bold uppercase text-[#768E89]">
                  Total Claims
                </span>
                <span className="font-sans text-base font-bold text-[#0F2C25]">
                  {formatINR(data.monthTotal)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-xl bg-[#ECFDF3] p-3">
                <span className="font-sans text-[10px] font-bold uppercase text-[#105C42]">
                  Approved
                </span>
                <span className="font-sans text-base font-bold text-[#105C42]">
                  {formatINR(data.monthApproved)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-xl bg-[#FFFAEB] p-3">
                <span className="font-sans text-[10px] font-bold uppercase text-[#B25E00]">
                  Pending
                </span>
                <span className="font-sans text-base font-bold text-[#B25E00]">
                  {formatINR(data.monthPending)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-b-2xl border border-t-0 border-black/5 bg-white">
            {data.claims.map((claim, index) => (
              <Link
                key={claim.id}
                href={`/claim-details/?id=${encodeURIComponent(claim.id)}`}
                style={staggerStyle(index + 2)}
                className="animate-rise-in flex w-full items-start gap-3 border-b border-[#EDEDF1] px-4 py-3 last:border-b-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F2EE]">
                  <CategoryIcon icon={categoryMeta.icon} color="#114B4F" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-sans text-[15px] font-bold text-[#1E1F24]">
                    {claim.title}
                  </span>
                  <span className="font-sans text-[13px] text-[#8D92A3]">
                    {claim.category}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-sans text-[17px] font-bold text-[#1E1F24]">
                    {formatINR(claim.amount)}
                  </span>
                  <span className="font-sans text-[13px] text-[#8D92A3]">
                    {claim.date}
                  </span>
                  <StatusBadge status={claim.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
