"use client";

import Image from "next/image";
import {
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
} from "@/features/chat/constants";
import { useChat } from "@/features/chat/useChat";
import { withBasePath } from "@/lib/basePath";
import type { QuickAction } from "@/features/chat/types";
import { ChatComposer } from "./ChatComposer";
import { ChatGreeting } from "./ChatGreeting";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { PromoCard } from "./PromoCard";
import { QuickActions } from "./QuickActions";

export function ChatShell() {
  const {
    messages,
    isLoading,
    isScanning,
    isLocating,
    sendMessage,
    processBillFile,
    openUploadOptions,
    updateBillExtract,
    submitBillClaim,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
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
      <ChatHeader />

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
            onFileSelected={(file) => void processBillFile(file)}
            onUpdateBillExtract={updateBillExtract}
            onSubmitBillClaim={submitBillClaim}
            onSelectMerchantBenefitType={selectMerchantBenefitType}
            onSelectMerchantSearchMode={selectMerchantSearchMode}
            onSearchMerchantByName={(query, benefitType) =>
              void searchMerchantByName(query, benefitType)
            }
          />
        </div>
      </main>

      <div className="flex flex-col items-center gap-1">
        <div className="flex justify-center py-2 opacity-25">
          <Image
            src={withBasePath("/assets/pine-labs-mark.svg")}
            alt="pine labs"
            width={95}
            height={24}
          />
        </div>
        <ChatComposer
          onSend={(message) => void sendMessage(message)}
          onAttach={openUploadOptions}
          disabled={busy}
        />
      </div>

      <span className="sr-only">Signed in as {USER_DISPLAY_NAME}</span>
    </div>
  );
}
