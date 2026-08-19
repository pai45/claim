import type { ClaimExtract } from "@/features/chat/types";
import { getDemoPrecheckDate } from "@/features/chat/demoUploadScenarios";
import { colors } from "@/lib/ui/colors";
import { formatINR } from "@/features/dashboard/constants";
import { evaluateAutoApproval } from "@/lib/claims/autoApproval";
import { evaluateClaimPrecheck, parseClaimAmount } from "@/lib/claims/precheck";

type ClaimReceiptCardProps = {
  claimId: string;
  extract: ClaimExtract;
  submittedAt: number;
  action?: "submitted" | "updated";
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill={colors.success} />
      <path
        d="M5.5 9.2 7.6 11.2 12.5 6.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 text-caption text-ink-secondary">
        {label}
      </span>
      <span
        className={`truncate text-right ${
          emphasize
            ? "text-body font-bold text-pine"
            : "text-body-sm font-bold text-pine"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatSubmittedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ClaimReceiptCard({
  claimId,
  extract,
  submittedAt,
  action = "submitted",
}: ClaimReceiptCardProps) {
  const vendor = extract.vendor || extract.merchant || "Vendor";
  const category = extract.category || "—";
  const parsedAmount = parseClaimAmount(extract.amount);
  const amount = parsedAmount ? formatINR(parsedAmount) : extract.amount || "—";
  const claimDate = extract.claimDate || extract.date || "";
  const claimMonth = extract.claimMonth || "";
  const invoiceNo = extract.invoiceNo || "";
  const autoApproval = evaluateAutoApproval(
    extract,
    evaluateClaimPrecheck(extract, getDemoPrecheckDate(extract)),
  );
  const reviewLabel = autoApproval.eligible ? "Auto Review" : "Manual Review";

  return (
    <div role="status" aria-live="polite" className="w-full max-w-card overflow-hidden rounded-bubble rounded-tl border border-border-line bg-white">
      <div className="flex items-center gap-3 bg-success-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CheckIcon />
          <div className="flex min-w-0 flex-col">
            <span className="text-caption font-bold uppercase tracking-[0.3px] text-success">
              Claim {action}
            </span>
            <span className="truncate text-body-sm font-bold text-pine">
              {claimId}
            </span>
          </div>
        </div>
        <span
          className={`ml-auto shrink-0 rounded-pill px-2.5 py-1 text-caption font-bold ${
            autoApproval.eligible
              ? "bg-success-tint text-success"
              : "bg-warning-tint text-warning-ink"
          }`}
        >
          {reviewLabel}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div>
          <p className="truncate text-body font-bold text-pine">
            {vendor}
          </p>
        </div>

        <div
          className="h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-input-border) 0 6px, transparent 6px 10px)",
          }}
        />

        <div className="flex flex-col">
          <ReceiptRow label="Category" value={category} />
          <ReceiptRow label="Amount" value={amount} emphasize />
          {claimDate ? <ReceiptRow label="Claim date" value={claimDate} /> : null}
          {claimMonth ? (
            <ReceiptRow label="Claim month" value={claimMonth} />
          ) : null}
          {invoiceNo ? (
            <ReceiptRow label="Invoice no." value={invoiceNo} />
          ) : null}
          <ReceiptRow
            label={action === "updated" ? "Updated" : "Submitted"}
            value={formatSubmittedAt(submittedAt)}
          />
        </div>
      </div>
    </div>
  );
}
