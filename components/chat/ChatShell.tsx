"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DRIVER_REGISTRATION_INTENT,
  DRIVER_REGISTRATION_LABEL,
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
  VEHICLE_REGISTRATION_LABEL,
} from "@/features/chat/constants";
import { getHomeActionCardState } from "@/features/chat/homeActionCards";
import { takePendingChatIntent } from "@/features/chat/pendingIntent";
import { useRegistrationStatus } from "@/features/chat/useRegistrationStatus";
import { useChat } from "@/features/chat/useChat";
import { useNotifications } from "@/features/notifications/useNotifications";
import { useActivePersona } from "@/features/persona/useActivePersona";
import type {
  DocumentUploadKind,
  QuickAction,
  UploadOptionId,
} from "@/features/chat/types";
import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { ChatComposer } from "./ChatComposer";
import { ChatGreeting } from "./ChatGreeting";
import { ChatHeader } from "./ChatHeader";
import { HomeActionCards } from "./HomeActionCards";
import { MessageList, type MessageListHandle } from "./MessageList";
import { NewChatWidget } from "./NewChatWidget";
import { QuickActions } from "./QuickActions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AssistantWalkthrough } from "@/components/walkthrough/AssistantWalkthrough";
import {
  DocumentScenarioDrawer,
  type DocumentScenarioSelection,
} from "./DocumentScenarioDrawer";

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
  const [replacementBillId, setReplacementBillId] = useState<string | null>(
    null,
  );
  const [scenarioPicker, setScenarioPicker] = useState<{
    kind: DocumentUploadKind;
    source: UploadOptionId;
  } | null>(null);
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
    documentProcessingKind,
    isHydrated,
    policyModelStatus,
    sendMessage,
    startClaimEdit,
    processBillScenario,
    processDlScenario,
    updateBillExtract,
    submitBillClaim,
    saveClaimEdit,
    selectPolicyCategory,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
    submitVehicleNumber,
    selectVehicleOwnership,
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

  const { personaId } = useActivePersona();
  const { count: notificationCount } = useNotifications();
  const registrationStatus = useRegistrationStatus();
  const homeActionCardState = useMemo(
    () =>
      getHomeActionCardState(
        personaId,
        notificationCount,
        registrationStatus,
      ),
    [notificationCount, personaId, registrationStatus],
  );

  function handleQuickAction(action: QuickAction) {
    void sendMessage(action.label, action.intentId);
  }

  function openBillScenarioPicker(source: UploadOptionId) {
    setScenarioPicker({ kind: "bill", source });
  }

  function openDlScenarioPicker(source: UploadOptionId) {
    setScenarioPicker({ kind: "dl", source });
  }

  function closeScenarioPicker() {
    setScenarioPicker(null);
    setReplacementBillId(null);
  }

  function handleScenarioSelected(selection: DocumentScenarioSelection) {
    const target = replacementBillId;
    setScenarioPicker(null);
    setReplacementBillId(null);

    if (selection.kind === "bill") {
      void processBillScenario(selection.scenarioId, target ?? undefined);
      return;
    }
    void processDlScenario(selection.scenarioId);
  }

  function handleReplaceBill(messageId: string) {
    setReplacementBillId(messageId);
    setScenarioPicker({ kind: "bill", source: "gallery" });
  }

  function handleStartAnotherBill() {
    setReplacementBillId(null);
    void sendMessage("Claim another bill", "upload_bill");
  }

  function handleConfirmedClear() {
    setConfirmClearOpen(false);
    setScenarioPicker(null);
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

  function handleDriverRegistration() {
    void sendMessage(DRIVER_REGISTRATION_LABEL, DRIVER_REGISTRATION_INTENT);
  }

  const busy = isLoading || isScanning || isLocating;
  const showEmptyState = isHydrated && !hasMessages;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#F3F3F0]">
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

      <div className="relative z-10 mx-auto flex h-full w-full max-w-phone flex-col overflow-hidden bg-[#f4fcc7]/10 shadow-phone">
        <ChatHeader onNewChat={requestClear} onBack={onClose} />

        <main
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2 pt-1"
          aria-busy={!isHydrated}
        >
          <div className="flex flex-col gap-5">
            {showEmptyState ? (
              <>
                <ChatGreeting />
                {homeActionCardState.showNotifications ||
                homeActionCardState.registration ? (
                  <HomeActionCards
                    notificationCount={notificationCount}
                    showNotifications={homeActionCardState.showNotifications}
                    registration={homeActionCardState.registration}
                    onVehicleStart={handleVehicleRegistration}
                    onDriverStart={handleDriverRegistration}
                    disabled={busy}
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
              documentProcessingKind={documentProcessingKind}
              policyModelStatus={policyModelStatus}
              onAwayFromBottomChange={setAwayFromBottom}
              onBillSourceSelected={openBillScenarioPicker}
              onDlSourceSelected={openDlScenarioPicker}
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
              onSelectVehicleOwnership={selectVehicleOwnership}
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
            <div className="pb-1 pt-2" data-walkthrough="quick-chats">
              <QuickActions onSelect={handleQuickAction} disabled={busy} />
            </div>
          ) : null}
          <div
            className="animate-rise-in"
            style={{ animationDelay: hasMessages ? "0ms" : "380ms" }}
            data-walkthrough="composer"
          >
            <ChatComposer
              onSend={(message) => void sendMessage(message)}
              disabled={busy}
            />
          </div>
        </div>

        {hasMessages && !confirmClearOpen ? (
          <NewChatWidget
            onClearChat={handleConfirmedClear}
            completedClaimKey={completedClaimKey}
            reduceMotion={reduceMotion}
          />
        ) : null}

        <DocumentScenarioDrawer
          open={Boolean(scenarioPicker)}
          kind={scenarioPicker?.kind ?? "bill"}
          source={scenarioPicker?.source ?? "gallery"}
          onSelect={handleScenarioSelected}
          onClose={closeScenarioPicker}
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

      <AssistantWalkthrough
        enabled={
          personaId === "new_user" &&
          showEmptyState &&
          !scenarioPicker &&
          !confirmClearOpen
        }
      />
    </div>
  );
}
