import { EMPLOYER_BENEFITS_CATALOG } from "@/features/policy/constants";

type PrivacyNoticeProps = {
  onClearData?: () => void;
  compact?: boolean;
};

export function PrivacyNotice({ onClearData, compact }: PrivacyNoticeProps) {
  const privacy = EMPLOYER_BENEFITS_CATALOG.privacy;

  return (
    <div className="rounded-control border border-input-border bg-surface-tint px-3 py-2.5 text-ink-secondary">
      <p className="text-caption leading-4">
        <strong className="text-pine">Privacy:</strong> Your bill is processed
        on this device. The original file and raw scanned text are not saved.
        Extracted details and chat history remain in this browser for {privacy.retentionDays} days.
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-caption font-bold text-pine focus-visible:outline-none">
          Who can access it?
        </summary>
        <div className="mt-2 flex flex-col gap-2 text-caption leading-4">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Only people with access to this browser profile can see retained
              structured details.
            </li>
            <li>No bill file leaves this device in the current demo.</li>
            <li>
              Submission creates a local demo record; nothing is sent to HR or
              your employer.
            </li>
            {!compact ? (
              <>
            <li>Original files and raw OCR or DL text are never persisted.</li>
              </>
            ) : null}
          </ul>
          {onClearData ? (
          <button
            type="button"
            onClick={onClearData}
            className="min-h-11 w-fit rounded-control border border-pine-primary px-3 py-2 font-bold text-pine-primary"
          >
            Clear saved data
          </button>
          ) : null}
        </div>
      </details>
    </div>
  );
}
