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
      <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
        <p className="font-sans text-sm text-body">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
        <p className="font-sans text-sm text-body">
          No merchants found
          {benefitType ? ` for ${benefitType}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">Results</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {results.map((merchant) => {
          const distance = formatDistance(merchant.distanceMeters);
          return (
            <li
              key={merchant.id}
              className="rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-semibold text-pine">
                    {merchant.name}
                  </p>
                  <p className="mt-0.5 font-sans text-[11px] leading-4 text-subtle">
                    {merchant.address}
                  </p>
                  {distance ? (
                    <p className="mt-1 font-sans text-[11px] text-muted">
                      {distance}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 font-sans text-[10px] font-semibold ${
                    merchant.allowed
                      ? "bg-[#E7F6EF] text-[#0F3F37]"
                      : "bg-[#F4E8E6] text-[#7A2E24]"
                  }`}
                >
                  {merchant.allowed ? "Allowed" : "Not allowed"}
                </span>
              </div>
              {merchant.networkPartner ? (
                <p className="mt-2 font-sans text-[11px] font-medium text-[#005656]">
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
