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
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        Salary details
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Enter monthly salary and employment start date
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold uppercase text-[#768783]">
            Monthly salary
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="e.g. ₹25,000"
            disabled={disabled}
            className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2.5 font-sans text-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold uppercase text-[#768783]">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2.5 font-sans text-sm text-body outline-none focus:border-pine disabled:opacity-50"
          />
        </label>
        <button
          type="submit"
          disabled={disabled || !salary.trim() || !startDate.trim()}
          className="rounded-xl bg-pine-primary px-3 py-2.5 font-sans text-sm font-semibold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
