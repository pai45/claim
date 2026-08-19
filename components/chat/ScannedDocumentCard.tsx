import type {
  DocumentProcessingStage,
  DocumentUploadKind,
} from "@/features/chat/types";

type ScannedDocumentCardProps = {
  stage?: DocumentProcessingStage | null;
  documentKind?: DocumentUploadKind;
  complete?: boolean;
  /**
   * Drops the card chrome and the status role so a host card can own the
   * surface — used when the scan result shares a bubble with the confidence
   * score.
   */
  embedded?: boolean;
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
  if (stage === "extracting") return Math.min(2, total);
  if (stage === "reading") return Math.min(1, total);
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

function CheckIcon({
  active,
  inProgress = false,
}: {
  active: boolean;
  inProgress?: boolean;
}) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border transition-all duration-300 ${
        active
          ? "border-success bg-success text-white scale-100"
          : inProgress
            ? "border-mint bg-surface-tint text-pine-primary scale-100 animate-pulse"
            : "border-border-muted bg-white text-transparent scale-90 opacity-60"
      }`}
      aria-hidden
    >
      {active ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="m2 5.1 1.8 1.8L8 2.9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : inProgress ? (
        <span className="h-1.5 w-1.5 rounded-pill bg-mint" />
      ) : null}
    </span>
  );
}

export function ScannedDocumentCard({
  stage,
  documentKind = "bill",
  complete = false,
  embedded = false,
}: ScannedDocumentCardProps) {
  const isDl = documentKind === "dl";
  const steps = isDl ? DL_STEPS : BILL_STEPS;
  const done = completedSteps(steps.length, stage, complete);
  const Wrapper = embedded ? "div" : "article";

  return (
    <Wrapper
      className={
        embedded
          ? "relative w-full"
          : "relative w-full overflow-hidden rounded-card border border-border-line bg-white p-card shadow-card"
      }
      role={embedded ? undefined : "status"}
      aria-live={embedded ? undefined : "polite"}
    >
      {!complete && (
        <div className="absolute left-0 right-0 top-0 h-1 bg-surface-tint overflow-hidden">
          <div
            className="h-full bg-mint transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.round(((done + 0.5) / steps.length) * 100))}%`,
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-control bg-surface-tint text-pine-primary transition-all duration-300 ${
            complete ? "" : "claim-scan-pulse"
          }`}
        >
          <ScanIcon />
        </span>
        <div className="min-w-0">
          <h3 className="text-body-sm font-bold text-pine transition-colors duration-200">
            {complete
              ? isDl
                ? "Licence checked"
                : "Bill scanned"
              : isDl
                ? "Checking licence..."
                : "Scanning bill..."}
          </h3>
          <p className="type-body-secondary">
            {complete
              ? isDl
                ? "The selected demo licence is ready"
                : "Key details were read from the bill"
              : isDl
                ? "Preparing the selected demo licence"
                : "Extracting key details from the bill"}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-2.5">
        {steps.map((step, index) => {
          const active = index < done;
          const inProgress = !complete && index === done;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 text-body-sm transition-colors duration-300 ${
                active
                  ? "font-bold text-pine-primary"
                  : inProgress
                    ? "font-bold text-pine"
                    : "text-muted"
              }`}
            >
              <CheckIcon active={active} inProgress={inProgress} />
              {step}
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
}
