import type { TransactionWallet } from "@/features/transactions/constants";

export type ScanPayScenario =
  | "success"
  | "failed"
  | "processing"
  | "invalid-qr"
  | "no-category";

export type ScanPayOutcome = "success" | "failed" | "processing";

export type ScanPayStep =
  | "scanner"
  | "upiEntry"
  | "confirmPayment"
  | "categoryPicker"
  | "walletPicker"
  | "submitting"
  | "result"
  | "successReward"
  | "paymentDetails"
  | "receiptCapture"
  | "receiptReview"
  | "faq";

export type ScanPayWalletId = TransactionWallet;

export type ScanPayCategoryId =
  | "food"
  | "flights"
  | "ecommerce"
  | "healthcare"
  | "education"
  | "finance"
  | "transportation"
  | "gaming";

export type ScanPayCategory = {
  id: ScanPayCategoryId;
  label: string;
  shortLabel: string;
  subcategories?: readonly { id: string; label: string }[];
};

export type ScanPayReceiptState = "empty" | "captured" | "confirmed";
export type ScanPayFaqReturnStep = "scanner" | "result" | "paymentDetails";

export type ScanPayTransaction = {
  merchant: string;
  upiId: string;
  amount: number;
  merchantId: string;
  transactionId: string;
  paymentMethod: string;
  dateTime: string;
  walletId: ScanPayWalletId;
  walletLabel: string;
  category?: string;
  subcategory?: string;
  note?: string;
  outcome: ScanPayOutcome;
  cashbackAmount: number;
};

export type ScanPayState = {
  step: ScanPayStep;
  scenario: ScanPayScenario;
  outcome: ScanPayOutcome;
  qrErrorVisible: boolean;
  torchEnabled: boolean;
  amount: string;
  amountTouched: boolean;
  note: string;
  noteOpen: boolean;
  selectedCategoryId: ScanPayCategoryId | null;
  pendingCategoryId: ScanPayCategoryId | null;
  selectedSubcategoryId: string | null;
  walletId: ScanPayWalletId;
  transaction: ScanPayTransaction | null;
  rewardRevealed: boolean;
  receiptState: ScanPayReceiptState;
  receiptPreview: string | null;
  faqReturnStep: ScanPayFaqReturnStep;
};

export type ScanPayAction =
  | { type: "RESET"; scenario: ScanPayScenario }
  | { type: "DETECT_QR" }
  | { type: "DISMISS_QR_ERROR" }
  | { type: "TOGGLE_TORCH" }
  | { type: "OPEN_UPI_ENTRY" }
  | { type: "VERIFY_UPI" }
  | { type: "OPEN_FAQ"; returnStep?: ScanPayFaqReturnStep }
  | { type: "OPEN_CATEGORY_PICKER" }
  | { type: "SELECT_CATEGORY"; categoryId: ScanPayCategoryId }
  | { type: "SELECT_SUBCATEGORY"; subcategoryId: string }
  | { type: "CONFIRM_CATEGORY" }
  | { type: "OPEN_WALLET_PICKER" }
  | { type: "SELECT_WALLET"; walletId: ScanPayWalletId }
  | { type: "SET_AMOUNT"; amount: string }
  | { type: "TOUCH_AMOUNT" }
  | { type: "OPEN_NOTE" }
  | { type: "SET_NOTE"; note: string }
  | { type: "PAY" }
  | { type: "RESOLVE_PAYMENT" }
  | { type: "RETRY_PAYMENT" }
  | { type: "REVEAL_REWARD" }
  | { type: "OPEN_PAYMENT_DETAILS" }
  | { type: "OPEN_RECEIPT_CAPTURE" }
  | { type: "CAPTURE_RECEIPT"; preview: string }
  | { type: "RETAKE_RECEIPT" }
  | { type: "CONFIRM_RECEIPT" }
  | { type: "BACK" };

export type ScanPayFlowProps = {
  open: boolean;
  scenario: ScanPayScenario;
  onClose: () => void;
};
