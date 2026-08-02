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
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">
        Merchant name
      </h3>
      <p className="mt-0.5 type-body-secondary text-subtle">
        Enter the merchant to check eligibility
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="rounded-control bg-pine-primary px-3 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
