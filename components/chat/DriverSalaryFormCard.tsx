"use client";

import { useState, type FormEvent } from "react";

type DriverSalaryFormCardProps = {
  onSubmit: (salary: string, startDate: string) => void;
  disabled?: boolean;
};

export function DriverSalaryFormCard({
  onSubmit,
  disabled,
}: DriverSalaryFormCardProps) {
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedSalary = salary.trim();
    const trimmedDate = startDate.trim();
    if (disabled || !trimmedSalary || !trimmedDate) return;
    onSubmit(trimmedSalary, trimmedDate);
  }

  return (
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">
        Salary details
      </h3>
      <p className="mt-0.5 type-body-secondary text-subtle">
        Enter monthly salary and employment start date
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="type-field-label">Monthly salary</span>
          <input
            type="text"
            inputMode="decimal"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="e.g. ₹25,000"
            disabled={disabled}
            className="w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="type-field-label">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={disabled}
            className="w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm text-body outline-none focus:border-pine disabled:opacity-50"
          />
        </label>
        <button
          type="submit"
          disabled={disabled || !salary.trim() || !startDate.trim()}
          className="rounded-control bg-pine-primary px-3 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
