"use client";

import Link from "next/link";
import { colors } from "@/lib/ui/colors";
import type { BenefitType } from "@/lib/merchants/types";
import type {
  BillExtract,
  ChatMessage,
  DriverSalaryPayload,
} from "@/features/chat/types";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { DASHBOARD_CATEGORIES } from "@/features/dashboard/constants";
import {
  getPolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import { AssistantMarkdown } from "./AssistantMarkdown";
import { BillExtractCard } from "./BillExtractCard";
import { ChatAvatar } from "./ChatAvatar";
import { ClaimReceiptCard } from "./ClaimReceiptCard";
import { DriverDlExtractCard } from "./DriverDlExtractCard";
import { DriverNameInputCard } from "./DriverNameInputCard";
import { DriverSalaryFormCard } from "./DriverSalaryFormCard";
import { DriverSalaryReceiptCard } from "./DriverSalaryReceiptCard";
import { DriverSalaryReviewCard } from "./DriverSalaryReviewCard";
import { MerchantNameInputCard } from "./MerchantNameInputCard";
import { MerchantResultsCard } from "./MerchantResultsCard";
import { MerchantSearchModeCard } from "./MerchantSearchModeCard";
import { MerchantTypeCard } from "./MerchantTypeCard";
import { PolicyOptionsCard } from "./PolicyOptionsCard";
import { UploadOptionsCard } from "./UploadOptionsCard";
import { VehicleClaimReceiptCard } from "./VehicleClaimReceiptCard";
import { VehicleDetailsCard } from "./VehicleDetailsCard";
import { VehicleNumberInputCard } from "./VehicleNumberInputCard";
import { useRevealText } from "./useRevealText";

const assistantBubbleClass =
  "rounded-bubble rounded-bl-md border border-border-soft bg-white/95 px-3 py-2.5 shadow-soft";

const pillClass =
  "inline-flex min-h-11 items-center rounded-pill border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function AssistantText({
  content,
  createdAt,
  reveal = false,
}: {
  content: string;
  createdAt?: number;
  reveal?: boolean;
}) {
  const { visible } = useRevealText({ text: content, enabled: reveal });

  return (
    <div className="flex max-w-[92%] items-end gap-2">
      <ChatAvatar />
      <div className="flex min-w-0 flex-col gap-1">
        <div className={assistantBubbleClass}>
          <AssistantMarkdown content={visible} />
        </div>
        {createdAt ? (
          <span className="px-1 text-caption text-muted">
            {formatTime(createdAt)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

type MessageBubbleProps = {
  message: ChatMessage;
  reveal?: boolean;
  onFileSelected?: (file: File) => void;
  onDlFileSelected?: (file: File) => void;
  onUpdateBillExtract?: (messageId: string, next: BillExtract) => void;
  onSubmitBillClaim?: (messageId: string, extract: BillExtract) => void;
  onReplaceBill?: (messageId: string) => void;
  onStartAnotherBill?: () => void;
  onClearSavedData?: () => void;
  onSelectPolicyCategory?: (categoryId: PolicyTabId) => void;
  onSelectMerchantBenefitType?: (benefitType: BenefitType) => void;
  onSelectMerchantSearchMode?: (
    mode: "name" | "nearest",
    benefitType?: BenefitType,
  ) => void;
  onSearchMerchantByName?: (query: string, benefitType?: BenefitType) => void;
  onSubmitVehicleNumber?: (regNumber: string) => void;
  onSubmitVehicleToHr?: (messageId: string, lookup: VehicleLookup) => void;
  onStartDriverSalary?: (vehicleClaimId?: string) => void;
  onSubmitDriverName?: (name: string) => void;
  onConfirmDriverDl?: (payload: DriverSalaryPayload) => void;
  onSubmitDriverSalaryDetails?: (salary: string, startDate: string) => void;
  onSubmitDriverSalaryClaim?: (payload: DriverSalaryPayload) => void;
  uploadDisabled?: boolean;
};

export function MessageBubble({
  message,
  reveal = false,
  onFileSelected,
  onDlFileSelected,
  onUpdateBillExtract,
  onSubmitBillClaim,
  onReplaceBill,
  onStartAnotherBill,
  onClearSavedData,
  onSelectPolicyCategory,
  onSelectMerchantBenefitType,
  onSelectMerchantSearchMode,
  onSearchMerchantByName,
  onSubmitVehicleNumber,
  onSubmitVehicleToHr,
  onStartDriverSalary,
  onSubmitDriverName,
  onConfirmDriverDl,
  onSubmitDriverSalaryDetails,
  onSubmitDriverSalaryClaim,
  uploadDisabled,
}: MessageBubbleProps) {
  const textReveal =
    reveal &&
    (message.kind === "text" ||
      message.kind === "policy_answer" ||
      message.kind === "app_data_answer");

  if (message.kind === "upload_options") {
    return (
      <div className="flex w-full justify-start">
        <UploadOptionsCard
          onFileSelected={(file) => onFileSelected?.(file)}
          disabled={uploadDisabled}
          onClearData={onClearSavedData}
        />
      </div>
    );
  }

  if (message.kind === "policy_options") {
    return (
      <div className="flex w-full justify-start">
        <PolicyOptionsCard
          onSelect={(categoryId) => onSelectPolicyCategory?.(categoryId)}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "merchant_type_options") {
    return (
      <div className="flex w-full justify-start">
        <MerchantTypeCard
          onSelect={(benefitType) =>
            onSelectMerchantBenefitType?.(benefitType)
          }
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "merchant_search_options") {
    return (
      <div className="flex w-full justify-start">
        <MerchantSearchModeCard
          benefitType={message.merchantLocator?.benefitType}
          onSelect={(mode) =>
            onSelectMerchantSearchMode?.(
              mode,
              message.merchantLocator?.benefitType,
            )
          }
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "merchant_name_input") {
    return (
      <div className="flex w-full justify-start">
        <MerchantNameInputCard
          benefitType={message.merchantLocator?.benefitType}
          onSearch={(query) =>
            onSearchMerchantByName?.(
              query,
              message.merchantLocator?.benefitType,
            )
          }
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "merchant_results") {
    return (
      <div className="flex w-full justify-start">
        <MerchantResultsCard
          benefitType={message.merchantLocator?.benefitType}
          results={message.merchantLocator?.results}
          error={message.merchantLocator?.error}
        />
      </div>
    );
  }

  if (message.kind === "vehicle_number_input") {
    return (
      <div className="flex w-full justify-start">
        <VehicleNumberInputCard
          onSubmit={(regNumber) => onSubmitVehicleNumber?.(regNumber)}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "vehicle_details" && message.vehicleLookup) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        {message.content && !message.vehicleLookup.error ? (
          <AssistantText content={message.content} createdAt={message.createdAt} />
        ) : null}
        <VehicleDetailsCard
          messageId={message.id}
          payload={message.vehicleLookup}
          onSubmitToHr={onSubmitVehicleToHr}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "bill_extract" && message.billExtract) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        {!message.billExtract.error ? (
          <AssistantText content={message.content} createdAt={message.createdAt} />
        ) : null}
        <BillExtractCard
          messageId={message.id}
          extract={message.billExtract}
          onUpdate={onUpdateBillExtract}
          onSubmitted={onSubmitBillClaim}
          onReplace={onReplaceBill}
        />
      </div>
    );
  }

  if (message.kind === "driver_name_input") {
    return (
      <div className="flex w-full justify-start">
        <DriverNameInputCard
          onSubmit={(name) => onSubmitDriverName?.(name)}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "driver_dl_upload") {
    return (
      <div className="flex w-full justify-start">
        <UploadOptionsCard
          title="Upload driving licence"
          subtitle="Photo or PDF of the DL, up to 10 MB"
          onFileSelected={(file) => onDlFileSelected?.(file)}
          disabled={uploadDisabled}
          onClearData={onClearSavedData}
        />
      </div>
    );
  }

  if (message.kind === "driver_dl_extract" && message.driverSalary) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        {!message.driverSalary.dlError ? (
          <AssistantText content={message.content} createdAt={message.createdAt} />
        ) : null}
        <DriverDlExtractCard
          payload={message.driverSalary}
          onConfirm={(payload) => onConfirmDriverDl?.(payload)}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "driver_salary_input") {
    return (
      <div className="flex w-full justify-start">
        <DriverSalaryFormCard
          onSubmit={(salary, startDate) =>
            onSubmitDriverSalaryDetails?.(salary, startDate)
          }
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "driver_salary_review" && message.driverSalary) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        <AssistantText content={message.content} createdAt={message.createdAt} />
        <DriverSalaryReviewCard
          payload={message.driverSalary}
          onSubmit={(payload) => onSubmitDriverSalaryClaim?.(payload)}
          disabled={uploadDisabled}
        />
      </div>
    );
  }

  if (message.kind === "claim_cta" && message.claimId) {
    if (message.billExtract) {
      return (
        <div className="flex w-full flex-col items-start gap-2">
          <ClaimReceiptCard
            claimId={message.claimId}
            extract={message.billExtract}
            submittedAt={message.createdAt}
          />
          <Link
            href={`/claim-details/?id=${encodeURIComponent(message.claimId)}`}
            className={pillClass}
          >
            View claim details
          </Link>
          <button
            type="button"
            onClick={onStartAnotherBill}
            className={pillClass}
          >
            Claim another bill
          </button>
        </div>
      );
    }

    if (message.driverSalary) {
      return (
        <div className="flex w-full flex-col items-start gap-2">
          <DriverSalaryReceiptCard
            claimId={message.claimId}
            payload={message.driverSalary}
            submittedAt={message.createdAt}
          />
          <Link
            href={`/claim-details/?id=${encodeURIComponent(message.claimId)}`}
            className={pillClass}
          >
            View claim details
          </Link>
        </div>
      );
    }

    if (message.vehicleLookup?.lookup) {
      return (
        <div className="flex w-full flex-col items-start gap-2">
          <VehicleClaimReceiptCard
            claimId={message.claimId}
            lookup={message.vehicleLookup.lookup}
            submittedAt={message.createdAt}
          />
          <div className="flex flex-wrap content-start gap-2">
            <Link
              href={`/claim-details/?id=${encodeURIComponent(message.claimId)}`}
              className={pillClass}
            >
              View claim details
            </Link>
            <button
              type="button"
              disabled={uploadDisabled}
              onClick={() => onStartDriverSalary?.(message.claimId)}
              className={`${pillClass} disabled:opacity-50`}
            >
              Driver Salary
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col items-start gap-2">
        <AssistantText
          content={message.content}
          createdAt={message.createdAt}
          reveal={textReveal}
        />
        <Link
          href={`/claim-details/?id=${encodeURIComponent(message.claimId)}`}
          className={pillClass}
        >
          View claim details
        </Link>
      </div>
    );
  }

  if (message.kind === "policy_answer" && message.policyAnswer) {
    const policy = getPolicyCategory(message.policyAnswer.categoryId);

    return (
      <div className="flex w-full flex-col items-start gap-2">
        <AssistantText
          content={message.content}
          createdAt={message.createdAt}
          reveal={textReveal}
        />
        <Link href={`/policy-details/${policy.id}/`} className={pillClass}>
          View all {policy.tabLabel} details
        </Link>
      </div>
    );
  }

  if (message.kind === "app_data_answer" && message.appDataAnswer) {
    const payload = message.appDataAnswer;
    const category = DASHBOARD_CATEGORIES.find(
      (item) => item.id === payload.categoryId,
    );
    const href =
      payload.target === "claim" && payload.claimId
        ? `/claim-details/?id=${encodeURIComponent(payload.claimId)}`
        : payload.target === "category_dashboard" && category
          ? `/dashboard/${category.id}/`
          : payload.target === "claims_history"
            ? "/claims-history/"
            : "/dashboard/";
    const label =
      payload.target === "claim"
        ? "View claim details"
        : payload.target === "category_dashboard" && category
          ? `View ${category.name} dashboard`
          : payload.target === "claims_history"
            ? "View claims history"
            : "View claims dashboard";

    return (
      <div className="flex w-full flex-col items-start gap-2">
        <AssistantText
          content={message.content}
          createdAt={message.createdAt}
          reveal={textReveal}
        />
        <Link href={href} className={pillClass}>
          {label}
        </Link>
      </div>
    );
  }

  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-1">
          <div className="whitespace-pre-wrap rounded-bubble rounded-br-md bg-pine-primary px-3.5 py-2.5 text-body-sm leading-5 text-white shadow-soft">
            {message.content}
          </div>
          <div className="flex items-center justify-end gap-1 px-1">
            <span className="text-caption text-muted">
              {formatTime(message.createdAt)}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1.5 6.5 3.5 8.5 7 4.5"
                stroke={colors.muted}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.5 6.5 6.5 8.5 10 4.5"
                stroke={colors.muted}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AssistantText
      content={message.content}
      createdAt={message.createdAt}
      reveal={textReveal}
    />
  );
}
