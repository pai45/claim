"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useActivePersona } from "@/features/persona/useActivePersona";
import type { PersonaConfig } from "@/features/persona/types";

type PersonaAccessGateProps = {
  children: ReactNode;
  requireUpi?: boolean;
  requirePlusPay?: boolean;
  requireEbPlus?: boolean;
};

export function hasPersonaAccess(
  persona: PersonaConfig,
  requirements: Pick<
    PersonaAccessGateProps,
    "requireUpi" | "requirePlusPay" | "requireEbPlus"
  >,
): boolean {
  return (
    (!requirements.requireUpi || persona.access.upiEnabled) &&
    (!requirements.requirePlusPay || persona.access.products.plusPay) &&
    (!requirements.requireEbPlus || persona.access.products.ebPlus)
  );
}

export function PersonaAccessGate({
  children,
  requireUpi = false,
  requirePlusPay = false,
  requireEbPlus = false,
}: PersonaAccessGateProps) {
  const router = useRouter();
  const { persona } = useActivePersona();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const allowed = hasPersonaAccess(persona, {
    requireUpi,
    requirePlusPay,
    requireEbPlus,
  });

  useEffect(() => {
    if (hydrated && !allowed) {
      router.replace("/");
    }
  }, [allowed, hydrated, router]);

  if (!hydrated || !allowed) {
    return <div className="mx-auto h-dvh w-full max-w-phone bg-white" aria-hidden="true" />;
  }

  return children;
}
