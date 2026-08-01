import type { BenefitType } from "@/lib/merchants/types";
import type { BillExtract, ChatMessage } from "@/features/chat/types";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  isScanning?: boolean;
  isLocating?: boolean;
  onFileSelected?: (file: File) => void;
  onUpdateBillExtract?: (messageId: string, next: BillExtract) => void;
  onSubmitBillClaim?: (messageId: string, extract: BillExtract) => void;
  onSelectMerchantBenefitType?: (benefitType: BenefitType) => void;
  onSelectMerchantSearchMode?: (
    mode: "name" | "nearest",
    benefitType?: BenefitType,
  ) => void;
  onSearchMerchantByName?: (query: string, benefitType?: BenefitType) => void;
};

export function MessageList({
  messages,
  isLoading,
  isScanning,
  isLocating,
  onFileSelected,
  onUpdateBillExtract,
  onSubmitBillClaim,
  onSelectMerchantBenefitType,
  onSelectMerchantSearchMode,
  onSearchMerchantByName,
}: MessageListProps) {
  if (messages.length === 0 && !isLoading && !isScanning && !isLocating)
    return null;

  const interactionDisabled = Boolean(isScanning || isLoading || isLocating);

  return (
    <div className="flex flex-col gap-3 px-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onFileSelected={onFileSelected}
          onUpdateBillExtract={onUpdateBillExtract}
          onSubmitBillClaim={onSubmitBillClaim}
          onSelectMerchantBenefitType={onSelectMerchantBenefitType}
          onSelectMerchantSearchMode={onSelectMerchantSearchMode}
          onSearchMerchantByName={onSearchMerchantByName}
          uploadDisabled={interactionDisabled}
        />
      ))}
      {isLoading ? (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 font-sans text-sm text-muted shadow-[2px_2px_8px_rgba(0,42,25,0.06)]">
            Thinking…
          </div>
        </div>
      ) : null}
      {isScanning ? (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 font-sans text-sm text-muted shadow-[2px_2px_8px_rgba(0,42,25,0.06)]">
            Scanning bill with OCR…
          </div>
        </div>
      ) : null}
      {isLocating ? (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 font-sans text-sm text-muted shadow-[2px_2px_8px_rgba(0,42,25,0.06)]">
            Finding merchants…
          </div>
        </div>
      ) : null}
    </div>
  );
}
