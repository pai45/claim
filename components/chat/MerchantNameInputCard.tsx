"use client";

import { useState, type FormEvent } from "react";
import type { BenefitType } from "@/lib/merchants/types";

type MerchantNameInputCardProps = {
  benefitType?: BenefitType;
  onSearch: (query: string) => void;
  disabled?: boolean;
};

export function MerchantNameInputCard({
  benefitType,
  onSearch,
  disabled,
}: MerchantNameInputCardProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (disabled || !query.trim()) return;
    onSearch(query.trim());
  }

  const placeholder =
    benefitType === "fuel"
      ? "e.g. Indian Oil, HPCL, Shell"
      : "e.g. McDonald's, Domino's, Starbucks";

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        Merchant name
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Enter the merchant to check eligibility
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2.5 font-sans text-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="rounded-xl bg-pine-primary px-3 py-2.5 font-sans text-sm font-semibold text-white disabled:opacity-50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
