"use client";

import { useRouter } from "next/navigation";
import {
  getClaimDetails,
  type ClaimProgressStep,
} from "@/features/claims/constants";

type ClaimDetailsScreenProps = {
  claimId: string;
};

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke="#252B37"
        strokeWidth="1.5"
      />
      <path d="M14 3v4h4" stroke="#252B37" strokeWidth="1.5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#005656" />
      <path
        d="M8 12.2 10.6 14.7 16 9.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpcomingCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="#DFE5E2" strokeWidth="1.5" />
      <path
        d="M12 8v4.2l2.4 1.4"
        stroke="#DFE5E2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-[#EDF1EF] bg-white p-3">
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2px] text-[#667A74]">
        {label}
      </span>
      <span className="font-sans text-sm font-bold text-[#132D27]">{value}</span>
    </div>
  );
}

function ProgressRow({
  step,
  isLast,
}: {
  step: ClaimProgressStep;
  isLast: boolean;
}) {
  const done = step.status === "done";

  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex min-h-[56px] w-6 flex-col items-center">
        {done ? <CheckCircleIcon /> : <UpcomingCircleIcon />}
        {!isLast ? (
          done ? (
            <div className="mt-1 w-0.5 flex-1 bg-[#DFE5E2]" />
          ) : (
            <div className="mt-1 w-0 flex-1 border-l-2 border-dashed border-[#DFE5E2]" />
          )
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 pb-5">
        <p
          className={`font-sans text-sm font-bold ${
            done ? "text-[#132D27]" : "text-[#667A74]"
          }`}
        >
          {step.title}
        </p>
        <p
          className={`font-sans text-xs ${
            done ? "text-[#667A74]" : "text-[#8D92A3]"
          }`}
        >
          {step.detail}
        </p>
      </div>
    </div>
  );
}

export function ClaimDetailsScreen({ claimId }: ClaimDetailsScreenProps) {
  const router = useRouter();
  const claim = getClaimDetails(claimId);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 bg-white px-4 pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
          Claim details
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8 pt-4">
        <section className="flex flex-col gap-4 rounded-3xl border border-[#E5ECE8] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3F0]">
                <DocumentIcon />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="font-sans text-base font-bold text-[#132D27]">
                  {claim.id}
                </p>
                <p className="truncate font-sans text-sm text-[#667A74]">
                  {claim.vendor}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[#D1F3DF] bg-[#F3FCF6] px-2 py-0.5 font-sans text-xs font-medium leading-4 text-[#279E6C]">
              {claim.status}
            </span>
          </div>

          <div className="h-px w-full bg-[#EDF1EF]" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DetailField label="Category" value={claim.category} />
              <DetailField label="Amount" value={claim.amount} />
            </div>
            <div className="flex gap-2">
              <DetailField label="Submitted" value={claim.submittedAt} />
              <DetailField label="Current Status" value={claim.currentStatus} />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[19px] font-semibold text-[#003434]">
            Claim Progress
          </h2>
          <div className="flex flex-col gap-2 rounded-3xl border border-[#EDF1EF] bg-white p-4">
            <div className="flex flex-col py-2">
              {claim.progress.map((step, index) => (
                <ProgressRow
                  key={step.id}
                  step={step}
                  isLast={index === claim.progress.length - 1}
                />
              ))}
            </div>
            <p className="pt-2 font-sans text-[13px] font-bold text-[#667A74]">
              {claim.notifyNote}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            className="flex h-[51px] w-full items-center justify-center rounded-lg bg-[#005656] px-5 font-sans text-base font-bold text-white"
          >
            Contact Support
          </button>
          <button
            type="button"
            className="flex h-[51px] w-full items-center justify-center rounded-lg border border-[#005656] bg-white px-5 font-sans text-base font-bold text-[#1E4E45]"
          >
            Download Receipt
          </button>
        </section>
      </main>
    </div>
  );
}
