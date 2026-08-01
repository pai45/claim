"use client";

import Image from "next/image";
import { useState } from "react";
import {
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
} from "@/features/chat/constants";
import { useChat } from "@/features/chat/useChat";
import { withBasePath } from "@/lib/basePath";
import type { QuickAction } from "@/features/chat/types";
import { AttachBottomDrawer } from "./AttachBottomDrawer";
import { ChatComposer } from "./ChatComposer";
import { ChatGreeting } from "./ChatGreeting";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { PromoCard } from "./PromoCard";
import { QuickActions } from "./QuickActions";

export function ChatShell() {
  const [attachOpen, setAttachOpen] = useState(false);
  const {
    messages,
    isLoading,
    isScanning,
    isLocating,
    policyModelStatus,
    sendMessage,
    processBillFile,
    updateBillExtract,
    submitBillClaim,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
    submitVehicleNumber,
    scanRcForVehicle,
    setVehicleManually,
    confirmVehicle,
    startNewChat,
    hasMessages,
  } = useChat();

  function handleQuickAction(action: QuickAction) {
    void sendMessage(action.label, action.intentId);
  }

  function handleVehicleRegistration() {
    void sendMessage("Start registration", VEHICLE_REGISTRATION_INTENT);
  }

  const busy = isLoading || isScanning || isLocating;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-bg shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <ChatHeader onNewChat={startNewChat} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pt-2">
        <div className="flex flex-col gap-4">
          <ChatGreeting />
          <QuickActions onSelect={handleQuickAction} disabled={busy} />
          {!hasMessages ? (
            <PromoCard
              onStart={handleVehicleRegistration}
              disabled={busy}
            />
          ) : null}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            isScanning={isScanning}
            isLocating={isLocating}
            policyModelStatus={policyModelStatus}
            onFileSelected={(file) => void processBillFile(file)}
            onUpdateBillExtract={updateBillExtract}
            onSubmitBillClaim={submitBillClaim}
            onSelectMerchantBenefitType={selectMerchantBenefitType}
            onSelectMerchantSearchMode={selectMerchantSearchMode}
            onSearchMerchantByName={(query, benefitType) =>
              void searchMerchantByName(query, benefitType)
            }
            onSubmitVehicleNumber={(regNumber) =>
              void submitVehicleNumber(regNumber)
            }
            onScanRc={(messageId, file) =>
              void scanRcForVehicle(messageId, file)
            }
            onVehicleManualEntry={setVehicleManually}
            onConfirmVehicle={confirmVehicle}
          />
        </div>
      </main>

      <div className="flex w-full flex-col items-stretch gap-1">
        {!hasMessages ? (
          <div className="flex justify-center py-2 opacity-25">
            <Image
              src={withBasePath("/assets/pine-labs-mark.svg")}
              alt="pine labs"
              width={95}
              height={24}
            />
          </div>
        ) : null}
        {!attachOpen ? (
          <ChatComposer
            onSend={(message) => void sendMessage(message)}
            onAttach={() => setAttachOpen(true)}
            disabled={busy}
          />
        ) : null}
      </div>

      <AttachBottomDrawer
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        onFileSelected={(file) => void processBillFile(file)}
        onSend={(message) => void sendMessage(message)}
        disabled={busy}
      />

      <span className="sr-only">Signed in as {USER_DISPLAY_NAME}</span>
    </div>
  );
}
