"use client";

import { useState } from "react";

type FormCardTemplateProps = {
  onSubmit: (data: { merchant: string; amount: string; category: string }) => void;
  onCancel?: () => void;
};

export function FormCardTemplate({ onSubmit, onCancel }: FormCardTemplateProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Fuel");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant || !amount) return;
    onSubmit({ merchant, amount, category });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-card border border-border-line bg-white p-card shadow-card"
    >
      <h3 className="type-section-title text-pine">Claim Details</h3>

      {/* Field 1: Text input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="merchant" className="type-field-label">
          Merchant Name
        </label>
        <input
          id="merchant"
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g. Indian Oil Corporation"
          className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none transition-colors focus:border-pine placeholder:font-normal placeholder:text-placeholder"
        />
      </div>

      {/* Field 2: Composite Currency input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="type-field-label">
          Bill Amount
        </label>
        <div className="flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3 transition-colors focus-within:border-pine">
          <span className="mr-2 text-body-sm font-bold text-ink-secondary">₹</span>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder"
          />
        </div>
      </div>

      {/* Field 3: Select dropdown */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="type-field-label">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none transition-colors focus:border-pine"
        >
          <option value="Fuel">Fuel & Gas</option>
          <option value="Meal">Meal & Food</option>
          <option value="Driver">Driver Salary</option>
          <option value="Books">Books & Periodicals</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="submit"
          className="btn-primary min-h-11 h-auto py-3"
          disabled={!merchant || !amount}
        >
          Save & Proceed
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary min-h-11 h-auto py-3"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
