import type { TransactionProductMode } from "@/features/transactions/mode";

const TRANSACTION_DETAILS_PATH = "/transaction-details/";
const ALLOWED_RETURN_PATHS = new Set([
  "/",
  "/transactions/",
  "/wallet-statement/",
  "/send-money/",
  "/bank-transfer/",
]);

const ALLOWED_RETURN_PARAMS: Record<string, ReadonlySet<string>> = {
  "/": new Set(["mode", "resumePayment"]),
  "/transactions/": new Set(["mode", "tab", "view", "wallet", "month"]),
  "/wallet-statement/": new Set(["wallet", "month"]),
  "/send-money/": new Set(["mode", "payee", "resumePayment"]),
  "/bank-transfer/": new Set(["beneficiary"]),
};

type TransactionDetailsHrefInput = {
  transactionId: string;
  mode: TransactionProductMode;
  returnTo: string;
};

export function buildTransactionDetailsHref({
  transactionId,
  mode,
  returnTo,
}: TransactionDetailsHrefInput): string {
  const params = new URLSearchParams({
    id: transactionId,
    mode,
    returnTo: resolveTransactionDetailsReturnTo(returnTo, mode),
  });
  return `${TRANSACTION_DETAILS_PATH}?${params.toString()}`;
}

export function resolveTransactionDetailsReturnTo(
  rawReturnTo: string | null,
  mode: TransactionProductMode,
): string {
  const fallback = `/transactions/?mode=${mode}`;
  if (!rawReturnTo || !rawReturnTo.startsWith("/") || rawReturnTo.startsWith("//")) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawReturnTo, "https://eb-claims.local");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "https://eb-claims.local") return fallback;

  const pathname = normalizePathname(parsed.pathname);
  if (!ALLOWED_RETURN_PATHS.has(pathname)) return fallback;
  if (pathname !== "/" && parsed.hash) return fallback;
  if (pathname === "/" && parsed.hash && parsed.hash !== "#scan-pay") {
    return fallback;
  }

  const allowedParams = ALLOWED_RETURN_PARAMS[pathname];
  for (const key of parsed.searchParams.keys()) {
    if (!allowedParams.has(key)) return fallback;
  }
  if (!returnParamsAreValid(pathname, parsed.searchParams)) return fallback;

  return `${pathname}${parsed.search}${parsed.hash}`;
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function returnParamsAreValid(
  pathname: string,
  params: URLSearchParams,
): boolean {
  const mode = params.get("mode");
  if (mode && mode !== "benefits" && mode !== "pluspay") return false;

  const tab = params.get("tab");
  if (tab && tab !== "transactions" && tab !== "analytics") return false;

  const view = params.get("view");
  if (view && view !== "trends" && view !== "category" && view !== "merchants") {
    return false;
  }

  const wallet = params.get("wallet");
  if (wallet && !["meal", "fuel", "misc", "mobile"].includes(wallet)) {
    return false;
  }

  const month = params.get("month");
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return false;

  for (const key of ["resumePayment", "payee", "beneficiary"] as const) {
    const value = params.get(key);
    if (params.has(key) && (!value || !/^[A-Za-z0-9._-]{1,160}$/.test(value))) {
      return false;
    }
  }
  return true;
}
