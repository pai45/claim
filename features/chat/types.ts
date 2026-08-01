import type { BenefitType, MerchantResult } from "@/lib/merchants/types";

export type MessageRole = "user" | "assistant";

export type MessageKind =
  | "text"
  | "upload_options"
  | "bill_extract"
  | "merchant_type_options"
  | "merchant_search_options"
  | "merchant_name_input"
  | "merchant_results";

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

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  kind?: MessageKind;
  billExtract?: BillExtract;
  merchantLocator?: MerchantLocatorPayload;
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
