"use client";

import type { ReactNode } from "react";
import { formatINR } from "@/features/dashboard/constants";
import { getPolicyCategory } from "@/features/policy/constants";
import type {
  AppDataAnswerPayload,
  GroundedAppData,
} from "@/lib/assistant/appData";
import { StructuredAssistantBubble } from "@/components/chat/StructuredAssistantBubble";

type AppDataAnswerCardProps = {
  content: string;
  payload: AppDataAnswerPayload;
  reveal?: boolean;
  showAvatar?: boolean;
};

type DataRow = {
  label: string;
  value: ReactNode;
};

const statusClasses: Record<string, string> = {
  Approved: "border-success-border bg-success-soft text-success",
  Pending: "border-warning-border bg-warning-soft text-warning",
  "Under review": "border-warning-border bg-warning-soft text-warning",
  "Needs info": "border-warning-border bg-warning-soft text-warning",
  Rejected: "border-transparent bg-danger-soft text-danger",
  Revoked: "border-transparent bg-danger-soft text-danger",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-pill border px-2 py-0.5 text-caption font-bold ${
        statusClasses[status] ?? "border-border-muted bg-surface text-pine"
      }`}
    >
      {status}
    </span>
  );
}

/** Tables are reserved for the top-level claims dashboard. */
function DashboardDataTable({ label, rows }: { label: string; rows: DataRow[] }) {
  return (
    <div className="overflow-hidden rounded-card border border-border-line">
      <table className="w-full border-collapse" aria-label={label}>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.label}
              className={index < rows.length - 1 ? "border-b border-border-soft" : ""}
            >
              <th
                scope="row"
                className="w-2/5 bg-surface px-3 py-3 text-left align-top text-caption font-normal text-ink-secondary"
              >
                {row.label}
              </th>
              <td className="px-3 py-3 text-right align-top text-body-sm font-bold text-pine">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataList({ label, rows }: { label: string; rows: DataRow[] }) {
  return (
    <dl
      className="overflow-hidden rounded-card border border-border-line"
      aria-label={label}
    >
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-start justify-between gap-3 px-3 py-3 ${
            index < rows.length - 1 ? "border-b border-border-soft" : ""
          }`}
        >
          <dt className="text-caption text-ink-secondary">{row.label}</dt>
          <dd className="text-right text-body-sm font-bold text-pine">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const bounded = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-caption">
        <span className="text-ink-secondary">{label}</span>
        <span className="font-bold text-pine">{bounded}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-pill bg-surface-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={bounded}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-pill bg-pine-primary" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}

function ClaimsDashboardBody({ data }: { data: Extract<GroundedAppData, { kind: "claims_dashboard" }> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="type-field-label">Available</p>
        <p className="type-amount">{formatINR(data.overview.availableLimit)}</p>
      </div>
      <ProgressBar
        value={data.overview.utilizedPercent}
        label={`Utilized · ${data.overview.financialYear}`}
      />
      <DashboardDataTable
        label="Claims dashboard totals"
        rows={[
          { label: "Utilized", value: formatINR(data.overview.utilizedAmount) },
          { label: "FY limit", value: formatINR(data.overview.financialYearLimit) },
          { label: "Categories", value: data.categories.length },
        ]}
      />
    </div>
  );
}

function CategoryDashboardBody({ data }: { data: Extract<GroundedAppData, { kind: "category_dashboard" }> }) {
  const dashboard = data.dashboard;
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="type-field-label">Available</p>
        <p className="type-amount">{formatINR(dashboard.availableLimit)}</p>
      </div>
      <ProgressBar value={data.utilizedPercent} label={`Utilized · ${data.financialYear}`} />
      <DataList
        label={`${dashboard.title} balance`}
        rows={[
          { label: "Utilized", value: formatINR(dashboard.utilized) },
          { label: "Accrued", value: formatINR(dashboard.accrued) },
          { label: `${dashboard.monthLabel} total`, value: formatINR(dashboard.monthTotal) },
          { label: "Approved", value: formatINR(dashboard.monthApproved) },
          { label: "Pending", value: formatINR(dashboard.monthPending) },
        ]}
      />
    </div>
  );
}

function ClaimsBody({ data }: { data: Extract<GroundedAppData, { kind: "claims_history" }> }) {
  const claim = data.filters.claimId ? data.claims[0] : undefined;
  if (claim) {
    return (
      <DataList
        label={`Claim ${claim.id} details`}
        rows={[
          { label: "Claim ID", value: claim.id },
          { label: "Title", value: claim.title },
          { label: "Status", value: <StatusBadge status={claim.status} /> },
          { label: "Amount", value: formatINR(claim.amount) },
          { label: "Date", value: claim.date },
        ]}
      />
    );
  }

  if (data.claims.length === 0) {
    return (
      <div className="rounded-card border border-border-line bg-surface px-card py-6 text-center">
        <p className="type-body font-bold text-pine">No claims found</p>
        <p className="mt-1 type-body-secondary">Try a different category or status.</p>
      </div>
    );
  }

  const summary = data.summary;
  return (
    <div className="flex flex-col gap-4">
      <DataList
        label="Claim status summary"
        rows={[
          { label: "Count", value: summary.totalCount },
          { label: "Total", value: formatINR(summary.totalAmount) },
        ]}
      />

      <section className="flex flex-col gap-2" aria-label="Latest claims">
        <h3 className="type-field-label text-pine-primary">Latest</h3>
        <div className="overflow-hidden rounded-card border border-border-line">
          {data.claims.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-3 px-3 py-3 ${
                index < Math.min(3, data.claims.length) - 1
                  ? "border-b border-border-soft"
                  : ""
              }`}
            >
              <div>
                <p className="text-body-sm font-bold text-pine">{item.id}</p>
                <p className="mt-0.5 text-caption text-ink-secondary">{item.title}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-body-sm font-bold text-pine">{formatINR(item.amount)}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WalletBody({ data }: { data: Extract<GroundedAppData, { kind: "wallet_overview" }> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="type-field-label">Total available · {data.financialYear}</p>
        <p className="type-amount">{formatINR(data.totals.available)}</p>
      </div>
      <div className="overflow-hidden rounded-card border border-border-line">
        {data.wallets.map((wallet, index) => (
          <div
            key={wallet.categoryId}
            className={`flex flex-col gap-2 px-3 py-3 ${
              index < data.wallets.length - 1 ? "border-b border-border-soft" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-body-sm font-bold text-pine">{wallet.name}</span>
              <span className="shrink-0 text-body-sm font-bold text-pine-primary">
                {formatINR(wallet.available)}
              </span>
            </div>
            <ProgressBar value={wallet.utilizedPercent} label={`Used of ${formatINR(wallet.allocation)}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesBody({ data }: { data: Extract<GroundedAppData, { kind: "claim_rules" }> }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h3 className="type-field-label text-pine-primary">Submission checks</h3>
        <div className="overflow-hidden rounded-card border border-border-line" aria-label="Submission checks">
          {data.checksAppliedAtSubmission.map((check, index) => (
            <div key={check.id} className={`flex items-start justify-between gap-3 px-3 py-3 ${index < data.checksAppliedAtSubmission.length - 1 ? "border-b border-border-soft" : ""}`}>
              <p className="text-body-sm text-ink">{check.rule}</p>
              <span className={`shrink-0 rounded-pill border px-2 py-0.5 text-caption font-bold ${
                check.blocking
                  ? "border-warning-border bg-warning-soft text-warning"
                  : "border-success-border bg-success-soft text-success"
              }`}>
                {check.blocking ? "Required" : "Review"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="type-field-label text-pine-primary">Category requirements</h3>
        <div className="overflow-hidden rounded-card border border-border-line">
          {data.categories.map((category, index) => (
            <div key={category.categoryId} className={`px-3 py-3 ${
              index < data.categories.length - 1 ? "border-b border-border-soft" : ""
            }`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-body-sm font-bold text-pine">{category.name}</p>
                <p className="shrink-0 text-caption font-bold text-pine-primary">
                  {formatINR(category.availableBalance)} left
                </p>
              </div>
              <p className="mt-1 text-caption text-ink-secondary">{category.proofRequired}</p>
              {category.submissionDeadlineDay ? (
                <p className="mt-1 text-caption text-ink-secondary">
                  Submit by the {category.submissionDeadlineDay}th of the next month
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MerchantsBody({ data }: { data: Extract<GroundedAppData, { kind: "merchant_allowlist" }> }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-border-line" aria-label="Allowed merchant networks">
        {data.networks.map((network, index) => {
          const brands = network.matches.length > 0 ? network.matches : network.brands.slice(0, 8);
          return (
            <div key={network.benefitType} className={`px-3 py-3 ${index < data.networks.length - 1 ? "border-b border-border-soft" : ""}`}>
              <p className="text-caption font-bold text-pine-primary">
                {network.benefitType === "meal" ? "Meal" : "Fuel"}
              </p>
              <p className="mt-1 text-body-sm font-bold text-pine">{brands.join(", ")}</p>
            </div>
          );
        })}
      </div>
      <p className="rounded-control bg-surface-tint px-3 py-2.5 text-caption text-pine">{data.note}</p>
    </div>
  );
}

function titleFor(data: GroundedAppData): string {
  switch (data.kind) {
    case "claims_dashboard":
      return `Claims dashboard (${data.overview.financialYear})`;
    case "category_dashboard":
      return `${data.dashboard.title} dashboard`;
    case "claims_history":
      if (data.filters.claimId) return `Claim ${data.filters.claimId}`;
      if (data.filters.status) {
        return `Your ${data.filters.status.toLowerCase()} claims`;
      }
      if (data.filters.categoryId) {
        return `${getPolicyCategory(data.filters.categoryId).tabLabel} claims`;
      }
      return "Your claims";
    case "wallet_overview":
      return `Your wallets (${data.financialYear})`;
    case "claim_rules":
      return "What a claim needs to pass";
    case "merchant_allowlist":
      return "Allowed merchants";
  }
}

function bodyFor(data: GroundedAppData) {
  switch (data.kind) {
    case "claims_dashboard":
      return <ClaimsDashboardBody data={data} />;
    case "category_dashboard":
      return <CategoryDashboardBody data={data} />;
    case "claims_history":
      return <ClaimsBody data={data} />;
    case "wallet_overview":
      return <WalletBody data={data} />;
    case "claim_rules":
      return <RulesBody data={data} />;
    case "merchant_allowlist":
      return <MerchantsBody data={data} />;
  }
}

function actionsFor(payload: AppDataAnswerPayload) {
  const policy = payload.categoryId ? getPolicyCategory(payload.categoryId) : undefined;
  if (payload.target === "none") return [];
  if (payload.target === "claim" && payload.claimId) {
    return [{ href: `/claim-details/?id=${encodeURIComponent(payload.claimId)}&from=assistant`, label: "View claim details" }];
  }
  if (payload.target === "policy" && policy) {
    return [{ href: `/policy-details/${policy.id}/`, label: `View all ${policy.tabLabel} details` }];
  }
  if (payload.target === "category_dashboard" && payload.categoryId) {
    const isDashboardEnabled = policy ? policy.id !== "meal" : true;
    if (!isDashboardEnabled) {
      return [{ href: `/policy-details/${payload.categoryId}/`, label: `View ${policy?.tabLabel ?? "benefit"} policy` }];
    }
    return [{ href: `/dashboard/${payload.categoryId}/`, label: `View ${policy?.tabLabel ?? "benefit"} dashboard` }];
  }
  if (payload.target === "claims_history") {
    return [{ href: "/claims-history/", label: "View claims history" }];
  }
  return [{ href: "/dashboard/", label: "View claims dashboard" }];
}

export function AppDataAnswerCard({
  content,
  payload,
  reveal = false,
  showAvatar = true,
}: AppDataAnswerCardProps) {
  const structured = payload.structured;
  if (!structured) return null;

  return (
    <StructuredAssistantBubble
      title={titleFor(structured)}
      summary={content}
      reveal={reveal}
      showAvatar={showAvatar}
      actions={actionsFor(payload)}
    >
      {bodyFor(structured)}
    </StructuredAssistantBubble>
  );
}
