import { WALLET_FILTER_OPTIONS } from "@/features/transactions/constants";
import type {
  ScanPayCategory,
  ScanPayCategoryId,
  ScanPayOutcome,
  ScanPayMerchantType,
  ScanPayMode,
  ScanPayScenario,
  ScanPayTransaction,
  ScanPayWalletId,
} from "@/features/scan-pay/types";

export const SCAN_PAY_MERCHANT = {
  name: "Coffee House Cafe",
  upiId: "9876543210-happay@pinelabs",
  merchantId: "9876543210-happay@pinelabs",
} as const;

export const SCAN_PAY_MERCHANTS: Record<
  Exclude<ScanPayMerchantType, "unclassified">,
  { name: string; upiId: string; merchantId: string }
> = {
  meal: SCAN_PAY_MERCHANT,
  fuel: {
    name: "IndianOil COCO",
    upiId: "indianoil-coco@pinelabs",
    merchantId: "indianoil-coco@pinelabs",
  },
  luxury: {
    name: "Taj Boutique",
    upiId: "taj-boutique@pinelabs",
    merchantId: "taj-boutique@pinelabs",
  },
  unsupported: {
    name: "Unsupported Merchant",
    upiId: "unsupported@upi",
    merchantId: "unsupported@upi",
  },
};

export const SCAN_PAY_CATEGORIES: readonly ScanPayCategory[] = [
  { id: "food", label: "Food & Drinks", shortLabel: "Food" },
  { id: "flights", label: "Flights", shortLabel: "Flights" },
  { id: "ecommerce", label: "Ecommerce", shortLabel: "Shopping" },
  { id: "healthcare", label: "Healthcare", shortLabel: "Health" },
  { id: "education", label: "Education", shortLabel: "Education" },
  {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    subcategories: [
      { id: "bank", label: "Bank" },
      { id: "trading", label: "Trading" },
    ],
  },
  { id: "transportation", label: "Transportation", shortLabel: "Travel" },
  { id: "gaming", label: "Gaming", shortLabel: "Gaming" },
] as const;

export const SCAN_PAY_QUICK_CATEGORIES: readonly ScanPayCategoryId[] = [
  "food",
  "flights",
  "ecommerce",
];

export const SCAN_PAY_FAQS = [
  {
    question: "What if the payment is debited but the transaction fails?",
    answer:
      "The amount is normally reversed automatically by your bank. If it is not returned within the stated bank timeline, contact support with the transaction ID.",
  },
  {
    question: "Why did my QR payment fail?",
    answer:
      "A payment can fail because of a connectivity issue, an invalid merchant QR, a bank timeout, or a transaction limit. Check the details and retry once.",
  },
  {
    question: "Why has the recipient not received the amount?",
    answer:
      "Processing payments can take a little longer to settle. Ask the recipient to refresh their account and use the transaction ID if support is needed.",
  },
  {
    question: "What should I do if money was sent to the wrong merchant?",
    answer:
      "UPI payments cannot be cancelled after completion. Contact the merchant first, then raise a support request from the payment details screen.",
  },
] as const;

export function resolveScanPayScenario(value: string | null): ScanPayScenario {
  return value === "failed" ||
    value === "processing" ||
    value === "invalid-qr" ||
    value === "no-category"
    ? value
    : "success";
}

export function resolveScanPayMerchantType(
  value: string | null,
): Exclude<ScanPayMerchantType, "unclassified"> {
  return value === "fuel" || value === "luxury" || value === "unsupported"
    ? value
    : "meal";
}

export function merchantForType(type: ScanPayMerchantType) {
  return type === "unclassified" ? SCAN_PAY_MERCHANT : SCAN_PAY_MERCHANTS[type];
}

export function outcomeForScenario(scenario: ScanPayScenario): ScanPayOutcome {
  if (scenario === "failed") return "failed";
  if (scenario === "processing") return "processing";
  return "success";
}

export function categoryById(id: ScanPayCategoryId | null) {
  return SCAN_PAY_CATEGORIES.find((category) => category.id === id) ?? null;
}

export function walletLabel(walletId: ScanPayWalletId): string {
  return (
    WALLET_FILTER_OPTIONS.find((wallet) => wallet.id === walletId)?.label ??
    "Reimbursement Wallet"
  );
}

export function createScanPayTransaction({
  amount,
  walletId,
  categoryId,
  subcategoryId,
  note,
  outcome,
  mode,
  merchantType,
  fundingAllocations,
}: {
  amount: number;
  walletId: ScanPayWalletId;
  categoryId: ScanPayCategoryId | null;
  subcategoryId: string | null;
  note: string;
  outcome: ScanPayOutcome;
  mode: ScanPayMode;
  merchantType: ScanPayMerchantType;
  fundingAllocations: ScanPayTransaction["fundingAllocations"];
}): ScanPayTransaction {
  const category = categoryById(categoryId);
  const subcategory = category?.subcategories?.find(
    (item) => item.id === subcategoryId,
  );
  const merchant = merchantForType(merchantType);
  const now = new Date();
  const paymentGroupId = `scan-pay-${now.getTime()}`;
  return {
    mode,
    merchant: merchant.name,
    upiId: merchant.upiId,
    amount,
    merchantId: merchant.merchantId,
    transactionId: paymentGroupId.replace(/\D/g, "").slice(-12),
    paymentMethod: mode === "pluspay" ? "ANQ" : "UPI",
    dateTime: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    walletId,
    walletLabel: mode === "pluspay" ? "ANQ" : walletLabel(walletId),
    category: category?.label,
    subcategory: subcategory?.label,
    note: note.trim() || undefined,
    outcome,
    cashbackAmount: 56,
    paymentGroupId,
    fundingAllocations,
  };
}
