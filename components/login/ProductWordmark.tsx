"use client";

import { useActivePersona } from "@/features/persona/useActivePersona";
import { PlusPayWordmark } from "@/components/login/PlusPayWordmark";

export function ProductWordmark({ className = "" }: { className?: string }) {
  const { persona } = useActivePersona();

  if (persona.access.products.plusPay) {
    return <PlusPayWordmark className={className} />;
  }

  return (
    <span
      className={`font-display text-title font-semibold tracking-tight text-pine-dark ${className}`.trim()}
    >
      EB+
    </span>
  );
}
