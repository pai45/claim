"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
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

const ColorBends = dynamic(() => import("@/components/shared/ColorBends"), {
  ssr: false,
});

const COLOR_BENDS_PALETTE = ["#005656", "#36CC8B", "#9DDBC1", "#E7F4EE"];

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
    processDlFile,
    updateBillExtract,
    submitBillClaim,
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

  function handleQuickAction(action: QuickAction) {
    void sendMessage(action.label, action.intentId);
  }

  function handleVehicleRegistration() {
    void sendMessage("Start registration", VEHICLE_REGISTRATION_INTENT);
  }

  const busy = isLoading || isScanning || isLocating;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#EEF5F2]">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
      >
        <ColorBends
          colors={COLOR_BENDS_PALETTE}
          rotation={104}
          autoRotate={0.25}
          speed={0.1}
          scale={1.15}
          frequency={0.75}
          warpStrength={0.55}
          mouseInfluence={0}
          parallax={0}
          noise={0.02}
          iterations={2}
          intensity={0.82}
          bandWidth={4.5}
          transparent
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(244,249,247,0.84) 38%, transparent 72%), linear-gradient(180deg, rgba(244,249,247,0.84) 0%, rgba(236,245,241,0.8) 52%, rgba(241,246,244,0.88) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white/10 shadow-[0_0_40px_rgba(0,42,25,0.08)]">
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
              onDlFileSelected={(file) => void processDlFile(file)}
              onUpdateBillExtract={updateBillExtract}
              onSubmitBillClaim={submitBillClaim}
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

        <div className="flex w-full flex-col items-stretch gap-1">
          {!hasMessages ? (
            <div
              className="animate-rise-in flex justify-center py-2 opacity-25"
              style={{ animationDelay: "2100ms" }}
            >
              <Image
                src={withBasePath("/assets/pine-labs-mark.svg")}
                alt="pine labs"
                width={95}
                height={24}
              />
            </div>
          ) : null}
          {!attachOpen ? (
            <div
              className="animate-rise-in"
              style={{ animationDelay: hasMessages ? "0ms" : "2220ms" }}
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
          onFileSelected={(file) => void processBillFile(file)}
          onSend={(message) => void sendMessage(message)}
          disabled={busy}
        />

        <span className="sr-only">Signed in as {USER_DISPLAY_NAME}</span>
      </div>
    </div>
  );
}
