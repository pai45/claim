export const CLAIM_OVERRIDES_STORAGE_KEY = "eb-claims:claim-overrides";
export const CLAIM_OVERRIDES_VERSION = 1;
export const CLAIM_STORE_EVENT = "eb-claims:claim-store-updated";

export type ClaimDisplayStatus =
  | "Pending"
  | "Under review"
  | "Needs info"
  | "Approved"
  | "Rejected"
  | "Revoked";

export type ClaimOverride = {
  vendor?: string;
  category?: string;
  amount?: number;
  billDate?: string;
  billingMonth?: string;
  invoiceNo?: string;
  fileName?: string;
  status?: ClaimDisplayStatus;
  updatedAt: number;
  revokedAt?: number;
};

export type ClaimOverrides = Record<string, ClaimOverride>;

type PersistedClaimOverrides = {
  version: typeof CLAIM_OVERRIDES_VERSION;
  claims: ClaimOverrides;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const STATUS_VALUES = new Set<ClaimDisplayStatus>([
  "Pending",
  "Under review",
  "Needs info",
  "Approved",
  "Rejected",
  "Revoked",
]);

function normalizedClaimId(claimId: string): string {
  return claimId.trim().toUpperCase();
}

function isClaimOverride(value: unknown): value is ClaimOverride {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ClaimOverride>;
  if (typeof candidate.updatedAt !== "number") return false;
  if (candidate.amount !== undefined && typeof candidate.amount !== "number") {
    return false;
  }
  if (candidate.status !== undefined && !STATUS_VALUES.has(candidate.status)) {
    return false;
  }
  if (
    candidate.revokedAt !== undefined &&
    typeof candidate.revokedAt !== "number"
  ) {
    return false;
  }
  return [
    candidate.vendor,
    candidate.category,
    candidate.billDate,
    candidate.billingMonth,
    candidate.invoiceNo,
    candidate.fileName,
  ].every((field) => field === undefined || typeof field === "string");
}

export function readClaimOverrides(
  storage: StorageLike = window.localStorage,
): ClaimOverrides {
  try {
    const raw = storage.getItem(CLAIM_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedClaimOverrides>;
    if (
      parsed.version !== CLAIM_OVERRIDES_VERSION ||
      !parsed.claims ||
      typeof parsed.claims !== "object"
    ) {
      storage.removeItem(CLAIM_OVERRIDES_STORAGE_KEY);
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed.claims).filter(([, value]) =>
        isClaimOverride(value),
      ),
    );
  } catch {
    try {
      storage.removeItem(CLAIM_OVERRIDES_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private or managed browser sessions.
    }
    return {};
  }
}

function writeClaimOverrides(
  claims: ClaimOverrides,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(
      CLAIM_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ version: CLAIM_OVERRIDES_VERSION, claims }),
    );
  } catch {
    // Keep the UI usable when browser storage is blocked or full.
  }
}

function announceClaimChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLAIM_STORE_EVENT));
  }
}

export function updateClaimOverride(
  claimId: string,
  patch: Omit<Partial<ClaimOverride>, "updatedAt">,
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): ClaimOverride {
  const id = normalizedClaimId(claimId);
  const claims = readClaimOverrides(storage);
  const next: ClaimOverride = {
    ...claims[id],
    ...patch,
    updatedAt: now,
  };
  writeClaimOverrides({ ...claims, [id]: next }, storage);
  if (typeof window !== "undefined" && storage === window.localStorage) {
    announceClaimChange();
  }
  return next;
}

export function revokeClaim(
  claimId: string,
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): ClaimOverride {
  return updateClaimOverride(
    claimId,
    { status: "Revoked", revokedAt: now },
    storage,
    now,
  );
}

export function isClaimMutable(status: string): boolean {
  return (
    status === "Pending" ||
    status === "Under review" ||
    status === "Needs info"
  );
}

export function parseStoredAmount(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/,/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
