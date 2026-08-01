import type { BenefitType, MerchantResult } from "@/lib/merchants/types";
import type { VehicleLookup } from "@/lib/vehicle/types";
import type { PolicyTabId } from "@/features/policy/constants";

export type MessageRole = "user" | "assistant";

export type MessageKind =
  | "text"
  | "upload_options"
  | "bill_extract"
  | "claim_cta"
  | "policy_answer"
  | "app_data_answer"
  | "merchant_type_options"
  | "merchant_search_options"
  | "merchant_name_input"
  | "merchant_results"
  | "vehicle_number_input"
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
  submitted?: boolean;
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
  /** Set when the plate couldn't be parsed. */
  error?: string;
  /** Mirrors BillExtract.submitted — hides the action once sent to HR. */
  submitted?: boolean;
};

export type PolicyAnswerPayload = {
  categoryId: PolicyTabId;
};

export type PolicyModelStatus = {
  progress?: number;
  file?: string;
};

export type AppDataAnswerPayload = {
  target: "dashboard" | "category_dashboard" | "claims_history" | "claim";
  categoryId?: PolicyTabId;
  claimId?: string;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  kind?: MessageKind;
  billExtract?: BillExtract;
  claimId?: string;
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
