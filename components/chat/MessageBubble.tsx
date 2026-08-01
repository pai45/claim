import Link from "next/link";
import type { BenefitType } from "@/lib/merchants/types";
import type {
  BillExtract,
  ChatMessage,
  DriverSalaryPayload,
} from "@/features/chat/types";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { DASHBOARD_CATEGORIES } from "@/features/dashboard/constants";
import { getPolicyCategory } from "@/features/policy/constants";
import { AssistantMarkdown } from "./AssistantMarkdown";
import { BillExtractCard } from "./BillExtractCard";
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
import { UploadOptionsCard } from "./UploadOptionsCard";
import { VehicleClaimReceiptCard } from "./VehicleClaimReceiptCard";
import { VehicleDetailsCard } from "./VehicleDetailsCard";
import { VehicleNumberInputCard } from "./VehicleNumberInputCard";

const assistantBubbleClass =
  "max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 shadow-[2px_2px_8px_rgba(0,42,25,0.06)]";

const pillClass =
  "rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine";

function AssistantText({ content }: { content: string }) {
  return (
    <div className={assistantBubbleClass}>
      <AssistantMarkdown content={content} />
    </div>
  );
}

type MessageBubbleProps = {
  message: ChatMessage;
  onFileSelected?: (file: File) => void;
  onDlFileSelected?: (file: File) => void;
  onUpdateBillExtract?: (messageId: string, next: BillExtract) => void;
  onSubmitBillClaim?: (messageId: string, extract: BillExtract) => void;
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

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  onFileSelected,
  onDlFileSelected,
  onUpdateBillExtract,
  onSubmitBillClaim,
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
  if (message.kind === "upload_options") {
    return (
      <div className="flex w-full justify-start">
        <UploadOptionsCard
          onFileSelected={(file) => onFileSelected?.(file)}
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
          <AssistantText content={message.content} />
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
          <AssistantText content={message.content} />
        ) : null}
        <BillExtractCard
          messageId={message.id}
          extract={message.billExtract}
          onUpdate={onUpdateBillExtract}
          onSubmitted={onSubmitBillClaim}
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
        />
      </div>
    );
  }

  if (message.kind === "driver_dl_extract" && message.driverSalary) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        {!message.driverSalary.dlError ? (
          <AssistantText content={message.content} />
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
        <AssistantText content={message.content} />
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
        <AssistantText content={message.content} />
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
        <AssistantText content={message.content} />
        <Link
          href={`/policy-details/${policy.id}/`}
          className={pillClass}
        >
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
        <AssistantText content={message.content} />
        <Link href={href} className={pillClass}>
          {label}
        </Link>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[85%] flex-col gap-1">
        {isUser ? (
          <div className="whitespace-pre-wrap rounded-2xl rounded-br-md bg-pine-primary px-3.5 py-2.5 font-sans text-sm leading-5 text-white">
            {message.content}
          </div>
        ) : (
          <div className={assistantBubbleClass}>
            <AssistantMarkdown content={message.content} />
          </div>
        )}
        {isUser ? (
          <div className="flex items-center justify-end gap-1 px-1">
            <span className="font-sans text-[10px] text-muted">
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
                stroke="#8A9D99"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.5 6.5 6.5 8.5 10 4.5"
                stroke="#8A9D99"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
}
