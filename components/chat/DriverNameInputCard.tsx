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
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">
        Driver name
      </h3>
      <p className="mt-0.5 type-body-secondary text-subtle">
        Enter the full name as on the driving licence
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ramesh Kumar"
          disabled={disabled}
          className="w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm text-body outline-none placeholder:text-muted focus:border-pine disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !name.trim()}
          className="rounded-control bg-pine-primary px-3 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
