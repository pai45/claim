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
  ClaimExtract,
  ChatMessage,
  DocumentProcessingStage,
  DocumentUploadKind,
  DriverSalaryPayload,
  PolicyModelStatus,
  QuickAction,
  UploadOptionId,
} from "@/features/chat/types";
import { trailingContextualQuickChats } from "@/features/chat/contextualQuickChats";
import type { PolicyTabId } from "@/features/policy/constants";
import type { VehicleLookup, VehicleOwnership } from "@/lib/vehicle/types";
import { ChatAvatar } from "./ChatAvatar";
import { ChatStatusBubble } from "./ChatStatusBubble";
import { ContextualQuickChats } from "./ContextualQuickChats";
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
  onQuickChatSelected?: (action: QuickAction) => void;
  onClaimSourceSelected?: (source: UploadOptionId) => void;
  onDlSourceSelected?: (source: UploadOptionId) => void;
  onUpdateClaimExtract?: (messageId: string, next: ClaimExtract) => void;
  onSubmitClaim?: (messageId: string, extract: ClaimExtract) => void;
  onSaveClaimEdit?: (
    messageId: string,
    claimId: string,
    extract: ClaimExtract,
  ) => void;
  onReplaceClaim?: (messageId: string) => void;
  onNewClaim?: () => void;
  onStartAnotherClaim?: () => void;
  documentProcessingStage?: DocumentProcessingStage | null;
  documentProcessingKind?: DocumentUploadKind;
  onSelectPolicyCategory?: (categoryId: PolicyTabId) => void;
  onSelectMerchantBenefitType?: (benefitType: BenefitType) => void;
  onSelectMerchantSearchMode?: (
    mode: "name" | "nearest",
    benefitType?: BenefitType,
  ) => void;
  onSearchMerchantByName?: (query: string, benefitType?: BenefitType) => void;
  onSubmitVehicleNumber?: (
    regNumber: string,
    ownership: VehicleOwnership,
  ) => void;
  onSubmitVehicleToHr?: (
    messageId: string,
    lookup: VehicleLookup,
    ownership: VehicleOwnership,
  ) => void;
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
  if (stage === "reading") return "Reading document…";
  if (stage === "extracting") return "Extracting claim details…";
  if (stage === "checking") return "Checking claim details…";
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
      onQuickChatSelected,
      onClaimSourceSelected,
      onDlSourceSelected,
      onUpdateClaimExtract,
      onSubmitClaim,
      onSaveClaimEdit,
      onReplaceClaim,
      onNewClaim,
      onStartAnotherClaim,
      documentProcessingStage,
      documentProcessingKind,
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
    const listRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const autoFollowRef = useRef(true);
    const programmaticScrollRef = useRef(false);
    const programmaticScrollTimerRef = useRef<number | null>(null);
    const previousLastMessageIdRef = useRef<string | undefined>(undefined);
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id;
    const lastMessageKind = lastMessage?.kind;
    const lastMessageRole = lastMessage?.role;
    const contextualQuickChats = trailingContextualQuickChats(messages);
    let latestAssistantMessageIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant") {
        latestAssistantMessageIndex = index;
        break;
      }
    }
    let latestAssistantTurnStartIndex = latestAssistantMessageIndex;
    while (
      latestAssistantTurnStartIndex > 0 &&
      messages[latestAssistantTurnStartIndex - 1].role === "assistant"
    ) {
      latestAssistantTurnStartIndex -= 1;
    }
    const hasActiveStatus = Boolean(isLoading || isScanning || isLocating);

    const updateNearBottom = useCallback(
      (fromScrollEvent = false) => {
        const scroller = findScrollParent(listRef.current);
        if (!scroller) {
          autoFollowRef.current = true;
          onAwayFromBottomChange?.(false);
          return;
        }
        const distance =
          scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        const near = distance <= NEAR_BOTTOM_PX;
        if (near) autoFollowRef.current = true;
        else if (fromScrollEvent && !programmaticScrollRef.current) {
          autoFollowRef.current = false;
        }
        onAwayFromBottomChange?.(
          !near && !autoFollowRef.current && messages.length > 0,
        );
      },
      [messages.length, onAwayFromBottomChange],
    );

    const scrollToBottom = useCallback(
      (force = false) => {
        if (!force && !autoFollowRef.current) return;
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        programmaticScrollRef.current = true;
        if (programmaticScrollTimerRef.current !== null) {
          window.clearTimeout(programmaticScrollTimerRef.current);
        }
        bottomRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "end",
        });
        autoFollowRef.current = true;
        onAwayFromBottomChange?.(false);
        programmaticScrollTimerRef.current = window.setTimeout(() => {
          programmaticScrollRef.current = false;
          programmaticScrollTimerRef.current = null;
          updateNearBottom();
        }, prefersReducedMotion ? 0 : 700);
      },
      [onAwayFromBottomChange, updateNearBottom],
    );

    useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

    useEffect(() => {
      const scroller = findScrollParent(listRef.current);
      if (!scroller) return;
      updateNearBottom();
      const handleScroll = () => updateNearBottom(true);
      const cancelProgrammaticScroll = () => {
        programmaticScrollRef.current = false;
        if (programmaticScrollTimerRef.current !== null) {
          window.clearTimeout(programmaticScrollTimerRef.current);
          programmaticScrollTimerRef.current = null;
        }
      };
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      scroller.addEventListener("wheel", cancelProgrammaticScroll, {
        passive: true,
      });
      scroller.addEventListener("touchstart", cancelProgrammaticScroll, {
        passive: true,
      });
      scroller.addEventListener("pointerdown", cancelProgrammaticScroll, {
        passive: true,
      });
      return () => {
        scroller.removeEventListener("scroll", handleScroll);
        scroller.removeEventListener("wheel", cancelProgrammaticScroll);
        scroller.removeEventListener("touchstart", cancelProgrammaticScroll);
        scroller.removeEventListener("pointerdown", cancelProgrammaticScroll);
      };
    }, [updateNearBottom, messages.length]);

    useEffect(() => {
      if (messages.length === 0 && !isLoading && !isScanning && !isLocating) {
        return;
      }
      const isNewUserMessage =
        lastMessageRole === "user" &&
        lastMessageId !== previousLastMessageIdRef.current;
      scrollToBottom(isNewUserMessage);
      previousLastMessageIdRef.current = lastMessageId;
    }, [
      messages.length,
      lastMessageId,
      lastMessageKind,
      lastMessageRole,
      isLoading,
      isScanning,
      isLocating,
      policyModelStatus?.progress,
      scrollToBottom,
    ]);

    useEffect(
      () => () => {
        if (programmaticScrollTimerRef.current !== null) {
          window.clearTimeout(programmaticScrollTimerRef.current);
        }
      },
      [],
    );

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
          <ScannedDocumentCard
            stage={documentProcessingStage}
            documentKind={documentProcessingKind}
          />
        </div>
      );
    } else if (isLocating) {
      statusNode = <ChatStatusBubble label="Finding merchants…" />;
    }

    return (
      <div ref={listRef} className="flex flex-col gap-3.5 px-4">
        {messages.map((message, index) => {
          const isTrailing = index === messages.length - 1;
          const startsLatestAssistantTurn =
            !hasActiveStatus && index === latestAssistantTurnStartIndex;
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
              {startsLatestAssistantTurn ? (
                <ChatAvatar className="mb-2.5 ml-0.5" />
              ) : null}
              <MessageBubble
                message={message}
                showAssistantAvatar={false}
                reveal={
                  isTrailing &&
                  message.role === "assistant" &&
                  Date.now() - message.createdAt < 4000
                }
                onClaimSourceSelected={onClaimSourceSelected}
                onDlSourceSelected={onDlSourceSelected}
                onUpdateClaimExtract={onUpdateClaimExtract}
                onSubmitClaim={onSubmitClaim}
                onSaveClaimEdit={onSaveClaimEdit}
                onReplaceClaim={onReplaceClaim}
                onNewClaim={onNewClaim}
                onStartAnotherClaim={onStartAnotherClaim}
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
              {isTrailing && contextualQuickChats.length > 0 ? (
                <ContextualQuickChats
                  actions={contextualQuickChats}
                  disabled={interactionDisabled}
                  onSelect={(action) => onQuickChatSelected?.(action)}
                />
              ) : null}
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
