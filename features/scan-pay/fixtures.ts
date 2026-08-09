import { WALLET_FILTER_OPTIONS } from "@/features/transactions/constants";
import type {
  ScanPayCategory,
  ScanPayCategoryId,
  ScanPayOutcome,
  ScanPayScenario,
  ScanPayTransaction,
  ScanPayWalletId,
} from "@/features/scan-pay/types";

export const SCAN_PAY_MERCHANT = {
  name: "Coffee House Cafe",
  upiId: "9876543210-happay@pinelabs",
  merchantId: "9876543210-happay@pinelabs",
} as const;

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
}: {
  amount: number;
  walletId: ScanPayWalletId;
  categoryId: ScanPayCategoryId | null;
  subcategoryId: string | null;
  note: string;
  outcome: ScanPayOutcome;
}): ScanPayTransaction {
  const category = categoryById(categoryId);
  const subcategory = category?.subcategories?.find(
    (item) => item.id === subcategoryId,
  );
  return {
    merchant: SCAN_PAY_MERCHANT.name,
    upiId: SCAN_PAY_MERCHANT.upiId,
    amount,
    merchantId: SCAN_PAY_MERCHANT.merchantId,
    transactionId: "138089927090",
    paymentMethod: "ANQ",
    dateTime: "17 Jun at 03:42 PM",
    walletId,
    walletLabel: walletLabel(walletId),
    category: category?.label,
    subcategory: subcategory?.label,
    note: note.trim() || undefined,
    outcome,
    cashbackAmount: 56,
  };
}
