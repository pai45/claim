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
  | "vehicle_details";

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
  /** Set when the RC's registration number differs from the one entered. */
  regMismatch?: string;
  /** True while the RC image is being read. */
  scanning?: boolean;
  error?: string;
  warning?: string;
  confirmed?: boolean;
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
