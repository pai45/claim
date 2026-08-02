"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
} from "@/features/chat/constants";
import { useChat } from "@/features/chat/useChat";
import type { QuickAction } from "@/features/chat/types";
import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { ActiveChatShortcuts } from "./ActiveChatShortcuts";
import { AttachBottomDrawer } from "./AttachBottomDrawer";
import { ChatComposer } from "./ChatComposer";
import { ChatGreeting } from "./ChatGreeting";
import { ChatHeader } from "./ChatHeader";
import { MessageList, type MessageListHandle } from "./MessageList";
import { PromoCard } from "./PromoCard";
import { QuickActions } from "./QuickActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const ColorBends = dynamic(() => import("@/components/shared/ColorBends"), {
  ssr: false,
});

const COLOR_BENDS_PALETTE = [
  colors.pinePrimary,
  colors.mint,
  colors.mintSoft,
  colors.mintWash,
];

export function ChatShell() {
  const [attachOpen, setAttachOpen] = useState(false);
  const [replacementBillId, setReplacementBillId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const messageListRef = useRef<MessageListHandle>(null);
  const {
    messages,
    isLoading,
    isScanning,
    isLocating,
    documentProcessingStage,
    isHydrated,
    policyModelStatus,
    sendMessage,
    processBillFile,
    replaceBillFile,
    processDlFile,
    updateBillExtract,
    submitBillClaim,
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

  function handleQuickAction(action: QuickAction) {
    if (action.intentId === "upload_bill") {
      setReplacementBillId(null);
      setAttachOpen(true);
      return;
    }
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
    void sendMessage("Start registration", VEHICLE_REGISTRATION_INTENT);
  }

  const busy = isLoading || isScanning || isLocating;
  const showEmptyState = isHydrated && !hasMessages;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-surface-chat">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <ColorBends
          colors={COLOR_BENDS_PALETTE}
          rotation={104}
          autoRotate={0.2}
          speed={0.08}
          scale={1.2}
          frequency={0.7}
          warpStrength={0.45}
          mouseInfluence={0}
          parallax={0}
          noise={0.015}
          iterations={2}
          intensity={0.68}
          bandWidth={5}
          transparent
          paused={reduceMotion}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 8%, rgba(255,255,255,0.92) 0%, rgba(244,249,247,0.78) 42%, transparent 74%), linear-gradient(180deg, rgba(244,249,247,0.72) 0%, rgba(236,245,241,0.7) 48%, rgba(238,245,242,0.88) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-phone flex-col overflow-hidden bg-white/10 shadow-phone">
        <ChatHeader onNewChat={requestClear} />

        {isHydrated && hasMessages ? (
          <ActiveChatShortcuts
            onSelect={handleQuickAction}
            onNewChat={requestClear}
            disabled={busy}
          />
        ) : null}

        <main
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2 pt-1"
          aria-busy={!isHydrated}
        >
          <div className="flex flex-col gap-5">
            {showEmptyState ? (
              <>
                <ChatGreeting />
                <QuickActions onSelect={handleQuickAction} disabled={busy} />
                <PromoCard
                  onStart={handleVehicleRegistration}
                  disabled={busy}
                />
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
              onReplaceBill={handleReplaceBill}
              onStartAnotherBill={handleStartAnotherBill}
              onClearSavedData={requestClear}
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
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 chat-composer-fade"
            aria-hidden
          />
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
          {!attachOpen ? (
            <div
              className="animate-rise-in"
              style={{ animationDelay: hasMessages ? "0ms" : "380ms" }}
            >
              <ChatComposer
                onSend={(message) => void sendMessage(message)}
                onAttach={() => setAttachOpen(true)}
                disabled={busy}
              />
            </div>
          ) : null}
        </div>

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
