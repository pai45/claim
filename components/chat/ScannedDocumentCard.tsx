import type { DocumentProcessingStage } from "@/features/chat/types";

type ScannedDocumentCardProps = {
  stage?: DocumentProcessingStage | null;
  complete?: boolean;
};

const STEPS = [
  "Vendor detected",
  "Amount detected",
  "Bill date detected",
  "Checking policy",
] as const;

function completedSteps(
  stage?: DocumentProcessingStage | null,
  complete?: boolean,
) {
  if (complete) return STEPS.length;
  if (stage === "checking") return 3;
  if (stage === "reading") return 2;
  return 0;
}

function ScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7 3H5a2 2 0 0 0-2 2v2M13 3h2a2 2 0 0 1 2 2v2M17 13v2a2 2 0 0 1-2 2h-2M7 17H5a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        active
          ? "border-[#35bf73] bg-[#35bf73] text-white"
          : "border-[#b9c9c1] bg-white/70 text-transparent"
      }`}
      aria-hidden
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="m2 5.1 1.8 1.8L8 2.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ScannedDocumentCard({
  stage,
  complete = false,
}: ScannedDocumentCardProps) {
  const done = completedSteps(stage, complete);

  return (
    <article
      className="w-full rounded-[18px] border border-[#dfe8e1] bg-white/95 p-4 shadow-[0_8px_26px_rgba(24,70,47,0.04)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9faf1] text-[#174b40] ${complete ? "" : "claim-scan-pulse"}`}>
          <ScanIcon />
        </span>
        <div className="min-w-0">
          <h3 className="text-body-sm font-bold text-pine">
            {complete ? "Bill Scanned" : "Scanning bill..."}
          </h3>
          <p className="text-[11px] leading-4 text-[#82908b]">
            Extracting key details from your document
          </p>
        </div>
      </div>

      <ul className="mt-3.5 grid gap-2.5">
        {STEPS.map((step, index) => {
          const active = index < done;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 text-[13px] font-bold ${
                active ? "text-[#174b40]" : "text-[#8da099]"
              }`}
            >
              <CheckIcon active={active} />
              {step}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
