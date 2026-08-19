"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
import { NewChatDraftDrawer } from "./NewChatDraftDrawer";
// import { NewChatWidget } from "./NewChatWidget";
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
  const router = useRouter();
  const [replacementClaimId, setReplacementClaimId] = useState<string | null>(
    null,
  );
  const [scenarioPicker, setScenarioPicker] = useState<{
    kind: DocumentUploadKind;
    source: UploadOptionId;
  } | null>(null);
  const [draftDecision, setDraftDecision] = useState<
    "new-chat" | "new-claim" | null
  >(null);
  const [pendingClaimSelection, setPendingClaimSelection] =
    useState<DocumentScenarioSelection | null>(null);
  const [pendingDraftId, setPendingDraftId] = useState<string | null>(null);
  const [draftFailure, setDraftFailure] = useState<{
    code: "limit" | "missing-file" | "storage-unavailable";
    message: string;
  } | null>(null);
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
    processClaimScenario,
    openUploadOptions,
    processDlScenario,
    updateClaimExtract,
    saveEligibleClaimDrafts,
    openClaimDraft,
    submitClaim,
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
    hasUnsavedClaimDrafts,
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
    if (pending.kind === "claim_draft") {
      if (hasMessages) {
        window.requestAnimationFrame(() => setPendingDraftId(pending.draftId));
      } else {
        void openClaimDraft(pending.draftId);
      }
      return;
    }
    void sendMessage(pending.label, pending.intentId);
  }, [hasMessages, isHydrated, openClaimDraft, sendMessage, startClaimEdit]);

  // Marks the newest completed claim so the floating widget can nudge itself
  // open. Scans backwards rather than checking the last message: submitVehicleToHr
  // appends a "Next up — register your driver" turn *after* its claim_cta, so a
  // tail check would silently miss the vehicle flow. Keyed on the message id, not
  // claimId, because createClaimId is a random 5-digit number and could repeat.
  // const completedClaimKey = useMemo(() => {
  //   for (let index = messages.length - 1; index >= 0; index -= 1) {
  //     const message = messages[index];
  //     if (message.kind === "claim_cta") return message.id;
  //   }
  //   return null;
  // }, [messages]);

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

  function openClaimScenarioPicker(source: UploadOptionId) {
    setScenarioPicker({ kind: "claim", source });
  }

  function openDlScenarioPicker(source: UploadOptionId) {
    setScenarioPicker({ kind: "dl", source });
  }

  function closeScenarioPicker() {
    setScenarioPicker(null);
    setReplacementClaimId(null);
  }

  function handleScenarioSelected(selection: DocumentScenarioSelection) {
    const target = replacementClaimId;
    setScenarioPicker(null);
    setReplacementClaimId(null);

    if (selection.kind === "claim") {
      if (!target && hasUnsavedClaimDrafts) {
        setPendingClaimSelection(selection);
        setDraftDecision("new-claim");
        return;
      }
      void processClaimScenario(selection.scenarioId, target ?? undefined);
      return;
    }
    void processDlScenario(selection.scenarioId);
  }

  function handleReplaceClaim(messageId: string) {
    setReplacementClaimId(messageId);
    openUploadOptions();
  }

  function handleStartAnotherClaim() {
    setReplacementClaimId(null);
    void sendMessage("New claim", "upload_claim");
  }

  function handleNewClaim() {
    setPendingClaimSelection(null);
    if (hasUnsavedClaimDrafts) {
      setDraftDecision("new-claim");
      return;
    }

    handleConfirmedClear();
    void sendMessage("New claim", "upload_claim");
  }

  function handleConfirmedClear() {
    setDraftDecision(null);
    setPendingClaimSelection(null);
    setScenarioPicker(null);
    setReplacementClaimId(null);
    startNewChat();
  }

  function continueWithPendingClaim() {
    const selection = draftDecision === "new-claim" ? pendingClaimSelection : null;
    const startNewClaim = draftDecision === "new-claim" && !selection;
    handleConfirmedClear();
    if (selection?.kind === "claim") {
      void processClaimScenario(selection.scenarioId);
    } else if (startNewClaim) {
      void sendMessage("New claim", "upload_claim");
    }
  }

  async function handleKeepDraftAndContinue() {
    const result = await saveEligibleClaimDrafts();
    if (!result.ok) {
      setDraftDecision(null);
      setPendingClaimSelection(null);
      setDraftFailure(result);
      return;
    }
    continueWithPendingClaim();
  }

  function requestClear() {
    if (hasUnsavedClaimDrafts) {
      setPendingClaimSelection(null);
      setDraftDecision("new-chat");
    } else handleConfirmedClear();
  }

  async function openPendingDraft(saveCurrent: boolean) {
    const draftId = pendingDraftId;
    if (!draftId) return;
    if (saveCurrent) {
      const result = await saveEligibleClaimDrafts();
      if (!result.ok) {
        setDraftFailure(result);
        return;
      }
    }
    setPendingDraftId(null);
    await openClaimDraft(draftId);
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
              onQuickChatSelected={handleQuickAction}
              onClaimSourceSelected={openClaimScenarioPicker}
              onDlSourceSelected={openDlScenarioPicker}
              onUpdateClaimExtract={updateClaimExtract}
              onSubmitClaim={submitClaim}
              onSaveClaimEdit={saveClaimEdit}
              onReplaceClaim={handleReplaceClaim}
              onNewClaim={handleNewClaim}
              onStartAnotherClaim={handleStartAnotherClaim}
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
            <div className="pb-1 pt-2" data-walkthrough="quick-chats">
              <QuickActions
                onSelect={handleQuickAction}
                onOpenDrafts={() => router.push("/chat-drafts")}
                disabled={busy}
              />
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

        {/* Floating new-chat widget temporarily disabled.
        {hasMessages && !confirmClearOpen ? (
          <NewChatWidget
            onClearChat={handleConfirmedClear}
            onRequestDraftDecision={() => setConfirmKeepDraftOpen(true)}
            hasEligibleClaimDrafts={hasEligibleClaimDrafts}
            completedClaimKey={completedClaimKey}
            reduceMotion={reduceMotion}
          />
        ) : null} */}

        <DocumentScenarioDrawer
          open={Boolean(scenarioPicker)}
          kind={scenarioPicker?.kind ?? "claim"}
          source={scenarioPicker?.source ?? "gallery"}
          onSelect={handleScenarioSelected}
          onClose={closeScenarioPicker}
        />

        <NewChatDraftDrawer
          open={Boolean(draftDecision) && !draftFailure}
          mode={draftDecision ?? "new-chat"}
          onKeepDraft={() => void handleKeepDraftAndContinue()}
          onStartWithoutSaving={continueWithPendingClaim}
          onClose={() => {
            setDraftDecision(null);
            setPendingClaimSelection(null);
          }}
        />

        <ConfirmDialog
          open={Boolean(pendingDraftId) && !draftFailure}
          title="Open this claim draft?"
          description={
            hasUnsavedClaimDrafts
              ? "You already have an unsubmitted claim in this chat. Save it first or discard this conversation."
              : "Opening the draft starts a fresh claim chat and replaces the current conversation."
          }
          confirmLabel={hasUnsavedClaimDrafts ? "Save current draft" : "Open draft"}
          cancelLabel="Cancel"
          extraAction={
            hasUnsavedClaimDrafts
              ? {
                  label: "Discard current and open draft",
                  tone: "danger",
                  onSelect: () => void openPendingDraft(false),
                }
              : undefined
          }
          onConfirm={() => void openPendingDraft(hasUnsavedClaimDrafts)}
          onClose={() => setPendingDraftId(null)}
        />

        <ConfirmDialog
          open={Boolean(draftFailure)}
          title={draftFailure?.code === "limit" ? "Draft limit reached" : "Draft not saved"}
          description={draftFailure?.message ?? "The claim draft could not be saved."}
          confirmLabel={draftFailure?.code === "limit" ? "Manage drafts" : "Close"}
          cancelLabel="Keep chatting"
          onConfirm={() => {
            const manage = draftFailure?.code === "limit";
            setDraftFailure(null);
            if (manage) router.push("/chat-drafts");
          }}
          onClose={() => setDraftFailure(null)}
        />

        <span className="sr-only">Signed in as {USER_DISPLAY_NAME}</span>
      </div>

      <AssistantWalkthrough
        enabled={
          personaId === "new_user" &&
          showEmptyState &&
          !scenarioPicker &&
          !draftDecision &&
          !pendingDraftId &&
          !draftFailure
        }
      />
    </div>
  );
}
