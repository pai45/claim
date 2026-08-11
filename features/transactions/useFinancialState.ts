"use client";

import { useSyncExternalStore } from "react";
import {
  getFinancialSnapshot,
  subscribeToFinancialState,
} from "@/features/transactions/financialState";

export function useFinancialStateVersion(): string | null {
  return useSyncExternalStore(
    subscribeToFinancialState,
    getFinancialSnapshot,
    () => null,
  );
}
