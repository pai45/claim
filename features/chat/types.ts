import type { BenefitType, MerchantResult } from "@/lib/merchants/types";
import type { VehicleLookup, VehicleOwnership } from "@/lib/vehicle/types";
import type { PolicyTabId } from "@/features/policy/constants";
import type { GroundedAppData } from "@/lib/assistant/appData";
import type { StructuredPolicyAnswer } from "@/lib/assistant/policy";

export type MessageRole = "user" | "assistant";

export type DocumentProcessingStage =
  | "preparing"
  | "reading"
  | "extracting"
  | "checking";

export type DocumentUploadKind = "bill" | "dl";

export type BillUploadScenarioId =
  | "meal"
  | "meal_missing"
  | "fuel"
  | "fuel_exceeding"
  | "internet"
  | "mobile"
  | "books"
  | "professional"
  | "duplicate"
  | "late"
  | "other";

export type DlUploadScenarioId = "dl_found" | "dl_not_found";

export type ClaimFieldName =
  | "category"
  | "vendor"
  | "amount"
  | "billDate"
  | "billingMonth"
  | "invoiceNo";

export type ClaimFieldReviewState = "confirmed" | "review" | "missing";

export type ClaimCheckStatus = "pass" | "warning" | "blocked";

export type ClaimPrecheckItem = {
  id: string;
  label: string;
  detail: string;
  status: ClaimCheckStatus;
};

export type ClaimPrecheck = {
  status: ClaimCheckStatus;
  benefitId?: PolicyTabId;
  checks: ClaimPrecheckItem[];
  requiresAcknowledgement: boolean;
};

export type MessageKind =
  | "text"
  | "upload_options"
  | "document_scan"
  | "bill_extract"
  | "claim_cta"
  | "policy_answer"
  | "policy_options"
  | "app_data_answer"
  | "merchant_type_options"
  | "merchant_search_options"
  | "merchant_name_input"
  | "merchant_results"
  | "vehicle_number_input"
  | "vehicle_ownership"
  | "vehicle_details"
  | "driver_name_input"
  | "driver_dl_upload"
  | "driver_dl_extract"
  | "driver_salary_input"
  | "driver_salary_review";

export type DriverSalaryPayload = {
  vehicleClaimId?: string;
  driverName?: string;
  dlFileName?: string;
  dlNumber?: string;
  dlRawText?: string;
  dlConfidence?: number;
  dlError?: string;
  dlWarning?: string;
  dlScenarioId?: DlUploadScenarioId;
  dlPreviewAsset?: string;
  salary?: string;
  startDate?: string;
  submitted?: boolean;
};

export type BillExtract = {
  fileName: string;
  rawText: string;
  category?: string;
  vendor?: string;
  amount?: string;
  billDate?: string;
  billingMonth?: string;
  invoiceNo?: string;
  confidence?: number;
  /** Transient object URL. It is deliberately removed before persistence. */
  previewUrl?: string;
  previewType?: string;
  /** Static, base-path-safe preview used by deterministic demo scenarios. */
  previewAsset?: string;
  demoScenarioId?: BillUploadScenarioId;
  /** Opens incomplete demo data directly in the editable review state. */
  manualReview?: boolean;
  /** Field-level extraction states, used to call out missing or unreliable details. */
  reviewFields?: Partial<
    Record<
      "category" | "vendor" | "amount" | "billDate" | "billingMonth" | "invoiceNo",
      "missing" | "review"
    >
  >;
  warningAcknowledged?: boolean;
  submitted?: boolean;
  /** Present when the card edits an existing claim instead of creating one. */
  editClaimId?: string;
  error?: string;
  /** Soft hint when OCR text exists but fields are incomplete */
  warning?: string;
  /** @deprecated use vendor */
  merchant?: string;
  /** @deprecated use billDate */
  date?: string;
};

export type MerchantLocatorPayload = {
  benefitType?: BenefitType;
  results?: MerchantResult[];
  error?: string;
};

export type VehicleLookupPayload = {
  lookup?: VehicleLookup;
  ownership?: VehicleOwnership;
  /** Keeps the lookup/ownership prompt distinct from the later review card. */
  stage?: "found" | "review";
  /** Locks the ownership controls without adding ownership to the found card. */
  ownershipSelected?: boolean;
  /** Set when the plate couldn't be parsed. */
  error?: string;
  /** Mirrors BillExtract.submitted — hides the action once sent to HR. */
  submitted?: boolean;
};

export type PolicyAnswerPayload = {
  /** Primary category — drives the "view details" link. */
  categoryId: PolicyTabId;
  /** Every category the answer covered, when the question named more than one. */
  categoryIds?: PolicyTabId[];
  structured?: StructuredPolicyAnswer;
};

export type PolicyModelStatus = {
  progress?: number;
  file?: string;
};

export type AppDataAnswerPayload = {
  target:
    | "dashboard"
    | "category_dashboard"
    | "claims_history"
    | "claim"
    | "policy"
    /** Answer stands alone — render no follow-up link. */
    | "none";
  categoryId?: PolicyTabId;
  claimId?: string;
  structured?: GroundedAppData;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  kind?: MessageKind;
  billExtract?: BillExtract;
  claimId?: string;
  claimAction?: "submitted" | "updated";
  policyAnswer?: PolicyAnswerPayload;
  appDataAnswer?: AppDataAnswerPayload;
  merchantLocator?: MerchantLocatorPayload;
  vehicleLookup?: VehicleLookupPayload;
  driverSalary?: DriverSalaryPayload;
};

export type ChatRequest = {
  message: string;
  intentId?: string;
};

export type ChatResponse = {
  reply: string;
  intentId: string;
};

export type QuickAction = {
  id: string;
  label: string;
  intentId: string;
  featured?: boolean;
};

export type UploadOptionId = "camera" | "pdf" | "gallery";
