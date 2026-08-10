import type { PersonaAccess } from "@/features/persona/types";

export type TransactionProductMode = "benefits" | "pluspay";

export function resolveTransactionMode(
  requested: unknown,
  access: PersonaAccess,
): TransactionProductMode {
  if (requested === "pluspay" && access.products.plusPay) return "pluspay";
  if (requested === "benefits" && access.products.ebPlus) return "benefits";

  if (access.defaultProduct === "pluspay" && access.products.plusPay) {
    return "pluspay";
  }
  if (access.products.ebPlus) return "benefits";
  return "pluspay";
}
