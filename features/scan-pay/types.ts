import type { TransactionWallet } from "@/features/transactions/constants";
import type { FundingAllocation } from "@/features/transactions/financialState";
import type { BankRecipientDraft } from "@/features/bank-transfer/validation";

export type ScanPayMode = "benefits" | "pluspay";
export type ScanPayMerchantType =
  | "meal"
  | "fuel"
  | "luxury"
  | "unsupported"
  | "unclassified";

export type ScanPayScenario =
  | "success"
  | "failed"
  | "processing"
  | "invalid-qr"
  | "no-category";

export type ScanPayOutcome = "success" | "failed" | "processing";

export type UpiPayee = {
  id: string;
  name: string;
  upiId: string;
  initials: string;
};

export type PaymentContext =
  | { origin: "scan-pay" }
  | { origin: "upi-transfer"; recipient: UpiPayee }
  | { origin: "bank-transfer"; recipient: BankRecipientDraft };

export type PaymentPayee =
  | {
      kind: "merchant";
      name: string;
      upiId: string;
      merchantId: string;
    }
  | {
      kind: "upi";
      name: string;
      upiId: string;
      payeeId: string;
    }
  | {
      kind: "bank-transfer";
      name: string;
      accountNumber: string;
      ifsc: string;
    };

export type ScanPayStep =
  | "scanner"
  | "upiEntry"
  | "confirmPayment"
  | "categoryPicker"
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
  paymentContext: PaymentContext;
  payee: PaymentPayee;
  mode: ScanPayMode;
  amount: number;
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
  paymentGroupId: string;
  fundingAllocations: FundingAllocation[];
};

export type ScanPayState = {
  paymentContext: PaymentContext;
  upiIdDraft: string;
  step: ScanPayStep;
  mode: ScanPayMode;
  merchantType: ScanPayMerchantType;
  scenario: ScanPayScenario;
  outcome: ScanPayOutcome;
  qrErrorVisible: boolean;
  qrErrorReason: "invalid" | "unsupported" | null;
  torchEnabled: boolean;
  amount: string;
  amountTouched: boolean;
  note: string;
  noteOpen: boolean;
  selectedCategoryId: ScanPayCategoryId | null;
  pendingCategoryId: ScanPayCategoryId | null;
  selectedSubcategoryId: string | null;
  walletId: ScanPayWalletId;
  fundingAllocations: FundingAllocation[];
  transaction: ScanPayTransaction | null;
  rewardRevealed: boolean;
  receiptState: ScanPayReceiptState;
  receiptPreview: string | null;
  faqReturnStep: ScanPayFaqReturnStep;
};

export type ScanPayAction =
  | {
      type: "RESET";
      scenario: ScanPayScenario;
      mode: ScanPayMode;
      merchantType: ScanPayMerchantType;
      launch?: ScanPayLaunch;
    }
  | { type: "DETECT_QR" }
  | { type: "DISMISS_QR_ERROR" }
  | { type: "TOGGLE_TORCH" }
  | { type: "OPEN_UPI_ENTRY" }
  | { type: "SET_UPI_ID"; upiId: string }
  | { type: "VERIFY_UPI" }
  | { type: "OPEN_FAQ"; returnStep?: ScanPayFaqReturnStep }
  | { type: "OPEN_CATEGORY_PICKER" }
  | { type: "SELECT_CATEGORY"; categoryId: ScanPayCategoryId }
  | { type: "SELECT_SUBCATEGORY"; subcategoryId: string }
  | { type: "CONFIRM_CATEGORY" }
  | { type: "SET_AMOUNT"; amount: string }
  | { type: "TOUCH_AMOUNT" }
  | { type: "OPEN_NOTE" }
  | { type: "SET_NOTE"; note: string }
  | { type: "PAY"; fundingAllocations?: FundingAllocation[] }
  | { type: "RESOLVE_PAYMENT"; transaction?: ScanPayTransaction }
  | { type: "PAYMENT_COMMIT_FAILED" }
  | { type: "RETRY_PAYMENT" }
  | { type: "REVEAL_REWARD" }
  | { type: "OPEN_PAYMENT_DETAILS" }
  | { type: "OPEN_RECEIPT_CAPTURE" }
  | { type: "CAPTURE_RECEIPT"; preview: string }
  | { type: "RETAKE_RECEIPT" }
  | { type: "CONFIRM_RECEIPT" }
  | { type: "BACK" };

export type ScanPayLaunch =
  | { kind: "scanner" }
  | { kind: "upi-entry"; initialUpiId?: string }
  | { kind: "payee"; payee: UpiPayee };

export type ScanPayFlowProps = {
  open: boolean;
  scenario: ScanPayScenario;
  mode: ScanPayMode;
  merchantType: ScanPayMerchantType;
  launch?: ScanPayLaunch;
  onClose: () => void;
};
