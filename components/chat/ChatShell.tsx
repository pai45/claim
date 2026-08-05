"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
  VEHICLE_REGISTRATION_LABEL,
} from "@/features/chat/constants";
import { bannerCardsForStage } from "@/features/chat/bannerCards";
import { takePendingChatIntent } from "@/features/chat/pendingIntent";
import { useBannerStage } from "@/features/chat/useBannerStage";
import { useChat } from "@/features/chat/useChat";
import type { QuickAction } from "@/features/chat/types";
import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { AttachBottomDrawer } from "./AttachBottomDrawer";
import { ChatComposer } from "./ChatComposer";
import { ChatGreeting } from "./ChatGreeting";
import { ChatHeader } from "./ChatHeader";
import { MessageList, type MessageListHandle } from "./MessageList";
import { NewChatWidget } from "./NewChatWidget";
import { PromoCarousel } from "./PromoCarousel";
import { QuickActions } from "./QuickActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const ColorBends = dynamic(() => import("@/components/shared/ColorBends"), {
  ssr: false,
});

const COLOR_BENDS_PALETTE = [
  "#fbffe9",
  "#f4fcc7",
  "#efffb7",
  "#F8FFDF",
  "#f7ffe0",
  "#f4fcc7",
];

type ChatShellProps = {
  /** Closes the containing host without clearing the saved assistant session. */
  onClose?: () => void;
};

export function ChatShell({ onClose }: ChatShellProps) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [replacementBillId, setReplacementBillId] = useState<string | null>(
    null,
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const messageListRef = useRef<MessageListHandle>(null);
  const pendingIntentHandled = useRef(false);
  const {
    messages,
    isLoading,
    isScanning,
    isLocating,
    documentProcessingStage,
    isHydrated,
    policyModelStatus,
    sendMessage,
    startClaimEdit,
    processBillFile,
    replaceBillFile,
    processDlFile,
    updateBillExtract,
    submitBillClaim,
    saveClaimEdit,
    selectPolicyCategory,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
    submitVehicleNumber,
    submitVehicleToHr,
    startDriverSalary,
    submitDriverName,
    confirmDriverDl,
    submitDriverSalaryDetails,
    submitDriverSalaryClaim,
    startNewChat,
    hasMessages,
  } = useChat();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // A full-page screen can ask the assistant to start a flow. Gating on
  // isHydrated is load-bearing: useChat restores a saved session with a blind
  // setMessages, so firing first would have these turns wiped a frame later.
  // It also guarantees the busy flags are clear, so sendMessage can't drop it.
  useEffect(() => {
    if (!isHydrated || pendingIntentHandled.current) return;
    pendingIntentHandled.current = true;
    const pending = takePendingChatIntent();
    if (!pending) return;
    if (pending.kind === "claim_edit") {
      startClaimEdit(pending.claimId);
      return;
    }
    void sendMessage(pending.label, pending.intentId);
  }, [isHydrated, sendMessage, startClaimEdit]);

  // Marks the newest completed claim so the floating widget can nudge itself
  // open. Scans backwards rather than checking the last message: submitVehicleToHr
  // appends a "Next up — register your driver" turn *after* its claim_cta, so a
  // tail check would silently miss the vehicle flow. Keyed on the message id, not
  // claimId, because createClaimId is a random 5-digit number and could repeat.
  const completedClaimKey = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.kind === "claim_cta") return message.id;
    }
    return null;
  }, [messages]);

  // Which empty-state banners this app open shows. Null until the stage is
  // read from storage on the client, which the empty state already waits for.
  const bannerStage = useBannerStage();
  const bannerCards = useMemo(
    () => (bannerStage ? bannerCardsForStage(bannerStage) : []),
    [bannerStage],
  );

  function handleQuickAction(action: QuickAction) {
    void sendMessage(action.label, action.intentId);
  }

  async function handleBillSelected(file: File) {
    const target = replacementBillId;
    setReplacementBillId(null);
    if (target) await replaceBillFile(target, file);
    else await processBillFile(file);
  }

  function handleReplaceBill(messageId: string) {
    setReplacementBillId(messageId);
    setAttachOpen(true);
  }

  function handleStartAnotherBill() {
    setReplacementBillId(null);
    setAttachOpen(true);
  }

  function handleConfirmedClear() {
    setConfirmClearOpen(false);
    setAttachOpen(false);
    setReplacementBillId(null);
    startNewChat();
  }

  function requestClear() {
    if (hasMessages) setConfirmClearOpen(true);
    else startNewChat();
  }

  function handleVehicleRegistration() {
    void sendMessage(VEHICLE_REGISTRATION_LABEL, VEHICLE_REGISTRATION_INTENT);
  }

  const busy = isLoading || isScanning || isLocating;
  const showEmptyState = isHydrated && !hasMessages;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#F3F3F0]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <ColorBends
          className="opacity-40"
          colors={COLOR_BENDS_PALETTE}
          rotation={112}
          autoRotate={3.375}
          speed={0.585}
          scale={1.08}
          frequency={0.92}
          warpStrength={1.08}
          mouseInfluence={0}
          parallax={0}
          noise={0.008}
          iterations={3}
          intensity={1}
          bandWidth={4.1}
          transparent
          paused={reduceMotion}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 68% 30%, rgba(244,252,199,0.14) 0%, rgba(239,255,183,0.07) 40%, transparent 70%), linear-gradient(180deg, rgba(251,255,233,0.11) 0%, rgba(244,252,199,0.05) 48%, rgba(251,255,233,0.13) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-phone flex-col overflow-hidden bg-[#f4fcc7]/10 shadow-phone">
        <ChatHeader onNewChat={requestClear} onBack={onClose} />

        <main
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2 pt-1"
          aria-busy={!isHydrated}
        >
          <div className="flex flex-col gap-5">
            {showEmptyState ? (
              <>
                <ChatGreeting />
                {bannerCards.length ? (
                  <PromoCarousel
                    cards={bannerCards}
                    onVehicleStart={handleVehicleRegistration}
                    onUploadBill={handleStartAnotherBill}
                    disabled={busy}
                    reduceMotion={reduceMotion}
                  />
                ) : null}
              </>
            ) : null}

            <MessageList
              ref={messageListRef}
              messages={messages}
              isLoading={isLoading}
              isScanning={isScanning}
              isLocating={isLocating}
              documentProcessingStage={documentProcessingStage}
              policyModelStatus={policyModelStatus}
              onAwayFromBottomChange={setAwayFromBottom}
              onFileSelected={(file) => void processBillFile(file)}
              onDlFileSelected={(file) => void processDlFile(file)}
              onUpdateBillExtract={updateBillExtract}
              onSubmitBillClaim={submitBillClaim}
              onSaveClaimEdit={saveClaimEdit}
              onReplaceBill={handleReplaceBill}
              onStartAnotherBill={handleStartAnotherBill}
              onSelectPolicyCategory={selectPolicyCategory}
              onSelectMerchantBenefitType={selectMerchantBenefitType}
              onSelectMerchantSearchMode={selectMerchantSearchMode}
              onSearchMerchantByName={(query, benefitType) =>
                void searchMerchantByName(query, benefitType)
              }
              onSubmitVehicleNumber={submitVehicleNumber}
              onSubmitVehicleToHr={submitVehicleToHr}
              onStartDriverSalary={startDriverSalary}
              onSubmitDriverName={submitDriverName}
              onConfirmDriverDl={confirmDriverDl}
              onSubmitDriverSalaryDetails={submitDriverSalaryDetails}
              onSubmitDriverSalaryClaim={submitDriverSalaryClaim}
            />
          </div>
        </main>

        <div className="relative flex w-full flex-col items-stretch">
          {awayFromBottom && hasMessages ? (
            <div className="absolute inset-x-0 -top-12 z-20 flex justify-center">
              <button
                type="button"
                onClick={() => messageListRef.current?.scrollToBottom(true)}
                className="flex min-h-9 items-center gap-1.5 rounded-pill border border-input-border bg-white/95 px-3.5 py-1.5 text-caption font-bold text-pine shadow-soft backdrop-blur-md"
              >
                Jump to latest
                <span aria-hidden className="text-mint">
                  ↓
                </span>
              </button>
            </div>
          ) : null}
          {!hasMessages ? (
            <div
              className="animate-rise-in flex justify-center py-1.5 opacity-30"
              style={{ animationDelay: "320ms" }}
            >
              <AppIcon
                src={BRAND_ASSETS.pineLabs}
                alt="pine labs"
                width={95}
                height={24}
                className="object-contain"
              />
            </div>
          ) : null}
          {showEmptyState ? (
            <div className="pb-1 pt-2">
              <QuickActions onSelect={handleQuickAction} disabled={busy} />
            </div>
          ) : null}
          {!attachOpen ? (
            <div
              className="animate-rise-in"
              style={{ animationDelay: hasMessages ? "0ms" : "380ms" }}
            >
              <ChatComposer
                onSend={(message) => void sendMessage(message)}
                disabled={busy}
              />
            </div>
          ) : null}
        </div>

        {hasMessages && !attachOpen && !confirmClearOpen ? (
          <NewChatWidget
            onNewChat={requestClear}
            completedClaimKey={completedClaimKey}
            reduceMotion={reduceMotion}
          />
        ) : null}

        <AttachBottomDrawer
          open={attachOpen}
          onClose={() => setAttachOpen(false)}
          onFileSelected={(file) => void handleBillSelected(file)}
          onSend={(message) => void sendMessage(message)}
          disabled={busy}
          onClearData={requestClear}
        />

        <ConfirmDialog
          open={confirmClearOpen}
          title="Clear this conversation?"
          description="This removes the current chat and the structured claim details saved in this browser. Original files and raw OCR text are not stored."
          confirmLabel="Clear saved data"
          onConfirm={handleConfirmedClear}
          onClose={() => setConfirmClearOpen(false)}
        />

        <span className="sr-only">Signed in as {USER_DISPLAY_NAME}</span>
      </div>
    </div>
  );
}
