"use client";

import { useState, type FormEvent } from "react";

type DriverNameInputCardProps = {
  onSubmit: (name: string) => void;
  disabled?: boolean;
};

export function DriverNameInputCard({
  onSubmit,
  disabled,
}: DriverNameInputCardProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (disabled || !trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        Driver name
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Enter the full name as on the driving licence
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ramesh Kumar"
          disabled={disabled}
          className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2.5 font-sans text-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !name.trim()}
          className="rounded-xl bg-pine-primary px-3 py-2.5 font-sans text-sm font-semibold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
