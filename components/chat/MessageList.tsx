"use client";

import { useEffect, useRef } from "react";
import type { BenefitType } from "@/lib/merchants/types";
import type {
  BillExtract,
  ChatMessage,
  DriverSalaryPayload,
  PolicyModelStatus,
} from "@/features/chat/types";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  isScanning?: boolean;
  isLocating?: boolean;
  policyModelStatus?: PolicyModelStatus | null;
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
};

export function MessageList({
  messages,
  isLoading,
  isScanning,
  isLocating,
  policyModelStatus,
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
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageKind = lastMessage?.kind;

  useEffect(() => {
    if (messages.length === 0 && !isLoading && !isScanning && !isLocating) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    bottomRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [
    messages.length,
    lastMessageId,
    lastMessageKind,
    isLoading,
    isScanning,
    isLocating,
    policyModelStatus?.progress,
  ]);

  if (messages.length === 0 && !isLoading && !isScanning && !isLocating)
    return null;

  const interactionDisabled = Boolean(isScanning || isLoading || isLocating);

  return (
    <div className="flex flex-col gap-3 px-4">
      {messages.map((message) => (
        <div key={message.id} className="animate-rise-in">
          <MessageBubble
            message={message}
            onFileSelected={onFileSelected}
            onDlFileSelected={onDlFileSelected}
            onUpdateBillExtract={onUpdateBillExtract}
            onSubmitBillClaim={onSubmitBillClaim}
            onSelectMerchantBenefitType={onSelectMerchantBenefitType}
            onSelectMerchantSearchMode={onSelectMerchantSearchMode}
            onSearchMerchantByName={onSearchMerchantByName}
            onSubmitVehicleNumber={onSubmitVehicleNumber}
            onSubmitVehicleToHr={onSubmitVehicleToHr}
            onStartDriverSalary={onStartDriverSalary}
            onSubmitDriverName={onSubmitDriverName}
            onConfirmDriverDl={onConfirmDriverDl}
            onSubmitDriverSalaryDetails={onSubmitDriverSalaryDetails}
            onSubmitDriverSalaryClaim={onSubmitDriverSalaryClaim}
            uploadDisabled={interactionDisabled}
          />
        </div>
      ))}
      {isLoading ? (
        policyModelStatus ? (
          <div className="animate-rise-in flex justify-start">
            <div className="rounded-bubble rounded-bl-md bg-white px-3.5 py-2.5 text-body-sm text-muted shadow-soft">
              {policyModelStatus.progress !== undefined
                ? `Loading server AI (first run downloads about 570 MB)… ${policyModelStatus.progress}%`
                : "Asking the server AI…"}
            </div>
          </div>
        ) : (
          <div className="animate-rise-in">
            <TypingIndicator />
          </div>
        )
      ) : null}
      {isScanning ? (
        <div className="animate-rise-in flex justify-start">
          <div className="rounded-bubble rounded-bl-md bg-white px-3.5 py-2.5 text-body-sm text-muted shadow-soft">
            Reading document with OCR…
          </div>
        </div>
      ) : null}
      {isLocating ? (
        <div className="animate-rise-in flex justify-start">
          <div className="rounded-bubble rounded-bl-md bg-white px-3.5 py-2.5 text-body-sm text-muted shadow-soft">
            Finding merchants…
          </div>
        </div>
      ) : null}
      <div ref={bottomRef} aria-hidden className="h-px w-full shrink-0" />
    </div>
  );
}
