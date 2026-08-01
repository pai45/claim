import type { BenefitType } from "@/lib/merchants/types";
import type { BillExtract, ChatMessage } from "@/features/chat/types";
import { BillExtractCard } from "./BillExtractCard";
import { MerchantNameInputCard } from "./MerchantNameInputCard";
import { MerchantResultsCard } from "./MerchantResultsCard";
import { MerchantSearchModeCard } from "./MerchantSearchModeCard";
import { MerchantTypeCard } from "./MerchantTypeCard";
import { UploadOptionsCard } from "./UploadOptionsCard";

type MessageBubbleProps = {
  message: ChatMessage;
  onFileSelected?: (file: File) => void;
  onUpdateBillExtract?: (messageId: string, next: BillExtract) => void;
  onSubmitBillClaim?: (messageId: string, extract: BillExtract) => void;
  onSelectMerchantBenefitType?: (benefitType: BenefitType) => void;
  onSelectMerchantSearchMode?: (
    mode: "name" | "nearest",
    benefitType?: BenefitType,
  ) => void;
  onSearchMerchantByName?: (query: string, benefitType?: BenefitType) => void;
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
  onUpdateBillExtract,
  onSubmitBillClaim,
  onSelectMerchantBenefitType,
  onSelectMerchantSearchMode,
  onSearchMerchantByName,
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

  if (message.kind === "bill_extract" && message.billExtract) {
    return (
      <div className="flex w-full flex-col items-start gap-2">
        {!message.billExtract.error ? (
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 font-sans text-sm leading-5 text-body shadow-[2px_2px_8px_rgba(0,42,25,0.06)]">
            {message.content}
          </div>
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

  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[85%] flex-col gap-1">
        <div
          className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-5 ${
            isUser
              ? "rounded-br-md bg-pine-primary text-white"
              : "rounded-bl-md bg-white text-body shadow-[2px_2px_8px_rgba(0,42,25,0.06)]"
          }`}
        >
          {message.content}
        </div>
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
