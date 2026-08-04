"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import type { BenefitType } from "@/lib/merchants/types";
import type {
  BillExtract,
  ChatMessage,
  DocumentProcessingStage,
  DriverSalaryPayload,
  PolicyModelStatus,
} from "@/features/chat/types";
import type { PolicyTabId } from "@/features/policy/constants";
import type { VehicleLookup } from "@/lib/vehicle/types";
import { ChatStatusBubble } from "./ChatStatusBubble";
import { MessageBubble } from "./MessageBubble";
import { ScannedDocumentCard } from "./ScannedDocumentCard";

export type MessageListHandle = {
  scrollToBottom: (force?: boolean) => void;
};

type MessageListProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  isScanning?: boolean;
  isLocating?: boolean;
  policyModelStatus?: PolicyModelStatus | null;
  onAwayFromBottomChange?: (away: boolean) => void;
  onFileSelected?: (file: File) => void;
  onDlFileSelected?: (file: File) => void;
  onUpdateBillExtract?: (messageId: string, next: BillExtract) => void;
  onSubmitBillClaim?: (messageId: string, extract: BillExtract) => void;
  onReplaceBill?: (messageId: string) => void;
  onStartAnotherBill?: () => void;
  documentProcessingStage?: DocumentProcessingStage | null;
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
};

const NEAR_BOTTOM_PX = 96;

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function documentStageLabel(stage?: DocumentProcessingStage | null) {
  if (stage === "preparing") return "Preparing document…";
  if (stage === "checking") return "Checking claim details…";
  if (stage === "reading") return "Reading claim details…";
  return "Reading document…";
}

export const MessageList = forwardRef<MessageListHandle, MessageListProps>(
  function MessageList(
    {
      messages,
      isLoading,
      isScanning,
      isLocating,
      policyModelStatus,
      onAwayFromBottomChange,
      onFileSelected,
      onDlFileSelected,
      onUpdateBillExtract,
      onSubmitBillClaim,
      onReplaceBill,
      onStartAnotherBill,
      documentProcessingStage,
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
    },
    ref,
  ) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id;
    const lastMessageKind = lastMessage?.kind;

    const updateNearBottom = useCallback(() => {
      const scroller = findScrollParent(listRef.current);
      if (!scroller) {
        nearBottomRef.current = true;
        onAwayFromBottomChange?.(false);
        return;
      }
      const distance =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      const near = distance <= NEAR_BOTTOM_PX;
      nearBottomRef.current = near;
      onAwayFromBottomChange?.(!near && messages.length > 0);
    }, [messages.length, onAwayFromBottomChange]);

    const scrollToBottom = useCallback((force = false) => {
      if (!force && !nearBottomRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      bottomRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "end",
      });
      nearBottomRef.current = true;
      onAwayFromBottomChange?.(false);
    }, [onAwayFromBottomChange]);

    useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

    useEffect(() => {
      const scroller = findScrollParent(listRef.current);
      if (!scroller) return;
      updateNearBottom();
      scroller.addEventListener("scroll", updateNearBottom, { passive: true });
      return () => scroller.removeEventListener("scroll", updateNearBottom);
    }, [updateNearBottom, messages.length]);

    useEffect(() => {
      if (messages.length === 0 && !isLoading && !isScanning && !isLocating) {
        return;
      }
      scrollToBottom();
    }, [
      messages.length,
      lastMessageId,
      lastMessageKind,
      isLoading,
      isScanning,
      isLocating,
      policyModelStatus?.progress,
      scrollToBottom,
    ]);

    if (messages.length === 0 && !isLoading && !isScanning && !isLocating) {
      return null;
    }

    const interactionDisabled = Boolean(isScanning || isLoading || isLocating);

    let statusNode: ReactNode = null;
    if (isLoading) {
      statusNode = policyModelStatus ? (
        <ChatStatusBubble
          label="Preparing your policy answer…"
          progress={policyModelStatus.progress}
        />
      ) : (
        <ChatStatusBubble variant="typing" />
      );
    } else if (isScanning) {
      statusNode = (
        <div aria-label={documentStageLabel(documentProcessingStage)}>
          <ScannedDocumentCard stage={documentProcessingStage} />
        </div>
      );
    } else if (isLocating) {
      statusNode = <ChatStatusBubble label="Finding merchants…" />;
    }

    return (
      <div ref={listRef} className="flex flex-col gap-3.5 px-4">
        {messages.map((message, index) => {
          const isTrailing = index === messages.length - 1;
          return (
            <div
              key={message.id}
              className="animate-rise-in"
              style={
                isTrailing
                  ? undefined
                  : { animationDelay: `${Math.min(index, 6) * 18}ms` }
              }
            >
              <MessageBubble
                message={message}
                reveal={
                  isTrailing &&
                  message.role === "assistant" &&
                  Date.now() - message.createdAt < 4000
                }
                onFileSelected={onFileSelected}
                onDlFileSelected={onDlFileSelected}
                onUpdateBillExtract={onUpdateBillExtract}
                onSubmitBillClaim={onSubmitBillClaim}
                onReplaceBill={onReplaceBill}
                onStartAnotherBill={onStartAnotherBill}
                onSelectPolicyCategory={onSelectPolicyCategory}
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
          );
        })}

        {statusNode ? (
          <div className="animate-rise-in">{statusNode}</div>
        ) : null}

        <div ref={bottomRef} aria-hidden className="h-px w-full shrink-0" />
      </div>
    );
  },
);
