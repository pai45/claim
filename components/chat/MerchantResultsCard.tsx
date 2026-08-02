"use client";

import type { BenefitType, MerchantResult } from "@/lib/merchants/types";

type MerchantResultsCardProps = {
  benefitType?: BenefitType;
  results?: MerchantResult[];
  error?: string;
};

function formatDistance(meters?: number): string | null {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return null;
  if (meters < 1000) return `${meters} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export function MerchantResultsCard({
  benefitType,
  results = [],
  error,
}: MerchantResultsCardProps) {
  if (error) {
    return (
      <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
        <p className="type-body">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
        <p className="type-body">
          No merchants found
          {benefitType ? ` for ${benefitType}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">Results</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {results.map((merchant) => {
          const distance = formatDistance(merchant.distanceMeters);
          return (
            <li
              key={merchant.id}
              className="rounded-control border border-input-border bg-input-soft px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-body-sm font-bold text-pine">
                    {merchant.name}
                  </p>
                  <p className="mt-0.5 text-caption leading-4 text-subtle">
                    {merchant.address}
                  </p>
                  {distance ? (
                    <p className="mt-1 text-caption text-muted">
                      {distance}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-control px-2 py-1 text-caption font-bold ${
                    merchant.allowed
                      ? "bg-success-tint text-pine"
                      : "bg-danger-soft text-danger"
                  }`}
                >
                  {merchant.allowed ? "Allowed" : "Not allowed"}
                </span>
              </div>
              {merchant.networkPartner ? (
                <p className="mt-2 text-caption font-bold text-pine-primary">
                  Network partner
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
