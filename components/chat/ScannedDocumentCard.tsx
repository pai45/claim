import type {
  DocumentProcessingStage,
  DocumentUploadKind,
} from "@/features/chat/types";

type ScannedDocumentCardProps = {
  stage?: DocumentProcessingStage | null;
  documentKind?: DocumentUploadKind;
  complete?: boolean;
};

const BILL_STEPS = [
  "Vendor detected",
  "Amount detected",
  "Bill date detected",
  "Checking policy",
] as const;

const DL_STEPS = [
  "Licence uploaded",
  "Checking document",
  "Preparing details",
] as const;

function completedSteps(
  total: number,
  stage?: DocumentProcessingStage | null,
  complete?: boolean,
) {
  if (complete) return total;
  if (stage === "checking") return Math.min(3, total);
  if (stage === "reading") return Math.min(2, total);
  return 0;
}

function ScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7 3H5a2 2 0 0 0-2 2v2M13 3h2a2 2 0 0 1 2 2v2M17 13v2a2 2 0 0 1-2 2h-2M7 17H5a2 2 0 0 1-2-2v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border ${
        active
          ? "border-success bg-success text-white"
          : "border-border-muted bg-white text-transparent"
      }`}
      aria-hidden
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="m2 5.1 1.8 1.8L8 2.9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ScannedDocumentCard({
  stage,
  documentKind = "bill",
  complete = false,
}: ScannedDocumentCardProps) {
  const isDl = documentKind === "dl";
  const steps = isDl ? DL_STEPS : BILL_STEPS;
  const done = completedSteps(steps.length, stage, complete);

  return (
    <article
      className="w-full rounded-card border border-border-line bg-white p-card shadow-card"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-control bg-surface-tint text-pine-primary ${
            complete ? "" : "claim-scan-pulse"
          }`}
        >
          <ScanIcon />
        </span>
        <div className="min-w-0">
          <h3 className="text-body-sm font-bold text-pine">
            {complete
              ? isDl
                ? "Licence checked"
                : "Bill scanned"
              : isDl
                ? "Checking licence..."
                : "Scanning bill..."}
          </h3>
          <p className="type-body-secondary">
            {isDl
              ? "Preparing the selected demo licence"
              : "Extracting key details from the selected demo bill"}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-2.5">
        {steps.map((step, index) => {
          const active = index < done;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 text-body-sm font-bold ${
                active ? "text-pine-primary" : "text-muted"
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
