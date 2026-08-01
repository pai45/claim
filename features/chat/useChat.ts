"use client";

import { useCallback, useState } from "react";
import { runBillOcr } from "@/lib/ocr/runOcr";
import type { BenefitType, MerchantsApiResponse } from "@/lib/merchants/types";
import type { BillExtract, ChatMessage, ChatResponse } from "./types";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function benefitLabel(benefitType: BenefitType): string {
  return benefitType === "meal" ? "Meal" : "Fuel";
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBenefitType, setActiveBenefitType] =
    useState<BenefitType | null>(null);

  const appendUploadOptions = useCallback(() => {
    setMessages((prev) => {
      if (prev.some((message) => message.kind === "upload_options")) {
        return prev;
      }

      return [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "Upload options",
          createdAt: Date.now(),
          kind: "upload_options",
        },
      ];
    });
  }, []);

  const appendMerchantTypeOptions = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Choose merchant type",
        createdAt: Date.now(),
        kind: "merchant_type_options",
      },
    ]);
  }, []);

  const openUploadOptions = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Sure. Upload a bill and I'll read it for you.",
        createdAt: Date.now(),
        kind: "text",
      },
    ]);
    appendUploadOptions();
  }, [appendUploadOptions]);

  const sendMessage = useCallback(
    async (content: string, intentId?: string) => {
      const trimmed = content.trim();
      if ((!trimmed && !intentId) || isLoading || isScanning || isLocating)
        return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed || intentId || "",
        createdAt: Date.now(),
        kind: "text",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            intentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Assistant unavailable");
        }

        const data = (await response.json()) as ChatResponse;
        const assistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: data.reply,
          createdAt: Date.now(),
          kind: "text",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.intentId === "upload_bill") {
          appendUploadOptions();
        }

        if (data.intentId === "merchant_locator") {
          setActiveBenefitType(null);
          appendMerchantTypeOptions();
        }
      } catch {
        setError("Something went wrong. Please try again.");
        const fallbackMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content:
            "Sorry - I couldn't process that just now. Please try again in a moment.",
          createdAt: Date.now(),
          kind: "text",
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      appendMerchantTypeOptions,
      appendUploadOptions,
      isLoading,
      isLocating,
      isScanning,
    ],
  );

  const selectMerchantBenefitType = useCallback(
    (benefitType: BenefitType) => {
      if (isLoading || isScanning || isLocating) return;

      setActiveBenefitType(benefitType);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: `${benefitLabel(benefitType)} merchant`,
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: `Got it — looking for ${benefitLabel(benefitType).toLowerCase()} merchants. Type a name or find the nearest near you.`,
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Search options",
          createdAt: Date.now(),
          kind: "merchant_search_options",
          merchantLocator: { benefitType },
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const selectMerchantSearchMode = useCallback(
    (mode: "name" | "nearest", benefitType?: BenefitType) => {
      if (isLoading || isScanning || isLocating) return;

      const resolvedType = benefitType ?? activeBenefitType;
      if (!resolvedType) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: "Please choose Fuel or Meal first.",
            createdAt: Date.now(),
            kind: "text",
          },
        ]);
        appendMerchantTypeOptions();
        return;
      }

      if (mode === "name") {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "user",
            content: "Type merchant name",
            createdAt: Date.now(),
            kind: "text",
          },
          {
            id: createId(),
            role: "assistant",
            content: `Type the ${benefitLabel(resolvedType).toLowerCase()} merchant name and I'll check if it's allowed.`,
            createdAt: Date.now(),
            kind: "text",
          },
          {
            id: createId(),
            role: "assistant",
            content: "Merchant name",
            createdAt: Date.now(),
            kind: "merchant_name_input",
            merchantLocator: { benefitType: resolvedType },
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: "Find nearest merchant near you",
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Getting your location to find the 3 nearest merchants…",
          createdAt: Date.now(),
          kind: "text",
        },
      ]);

      setIsLocating(true);
      setError(null);

      if (!navigator.geolocation) {
        setIsLocating(false);
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              "Location isn't available on this device. Please type the merchant name instead.",
            createdAt: Date.now(),
            kind: "text",
          },
          {
            id: createId(),
            role: "assistant",
            content: "Merchant name",
            createdAt: Date.now(),
            kind: "merchant_name_input",
            merchantLocator: { benefitType: resolvedType },
          },
        ]);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch("/api/merchants/nearby", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                benefitType: resolvedType,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            });

            const data = (await response.json()) as MerchantsApiResponse;

            if (!response.ok || data.error) {
              throw new Error(data.error || "Nearby search failed");
            }

            setMessages((prev) => [
              ...prev,
              {
                id: createId(),
                role: "assistant",
                content:
                  data.results.length > 0
                    ? `Here are the ${Math.min(3, data.results.length)} nearest ${benefitLabel(resolvedType).toLowerCase()} merchants:`
                    : `I couldn't find nearby ${benefitLabel(resolvedType).toLowerCase()} merchants. Try typing a merchant name.`,
                createdAt: Date.now(),
                kind: "text",
              },
              {
                id: createId(),
                role: "assistant",
                content: "Merchant results",
                createdAt: Date.now(),
                kind: "merchant_results",
                merchantLocator: {
                  benefitType: resolvedType,
                  results: data.results,
                },
              },
            ]);
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : "Couldn't find nearby merchants.";
            setError(message);
            setMessages((prev) => [
              ...prev,
              {
                id: createId(),
                role: "assistant",
                content: `${message} You can type a merchant name instead.`,
                createdAt: Date.now(),
                kind: "text",
              },
              {
                id: createId(),
                role: "assistant",
                content: "Merchant name",
                createdAt: Date.now(),
                kind: "merchant_name_input",
                merchantLocator: { benefitType: resolvedType },
              },
            ]);
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content:
                "I couldn't access your location. Please enable GPS permission, or type the merchant name instead.",
              createdAt: Date.now(),
              kind: "text",
            },
            {
              id: createId(),
              role: "assistant",
              content: "Merchant name",
              createdAt: Date.now(),
              kind: "merchant_name_input",
              merchantLocator: { benefitType: resolvedType },
            },
          ]);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
      );
    },
    [
      activeBenefitType,
      appendMerchantTypeOptions,
      isLoading,
      isLocating,
      isScanning,
    ],
  );

  const searchMerchantByName = useCallback(
    async (query: string, benefitType?: BenefitType) => {
      const trimmed = query.trim();
      const resolvedType = benefitType ?? activeBenefitType;

      if (
        !trimmed ||
        !resolvedType ||
        isLoading ||
        isScanning ||
        isLocating
      ) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: trimmed,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);

      setIsLocating(true);
      setError(null);

      try {
        const response = await fetch("/api/merchants/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            benefitType: resolvedType,
            query: trimmed,
          }),
        });

        const data = (await response.json()) as MerchantsApiResponse;

        if (!response.ok || data.error) {
          throw new Error(data.error || "Merchant search failed");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              data.results.length > 0
                ? `Here's what I found for "${trimmed}":`
                : `No matches for "${trimmed}". Try another name or find nearest merchants.`,
            createdAt: Date.now(),
            kind: "text",
          },
          {
            id: createId(),
            role: "assistant",
            content: "Merchant results",
            createdAt: Date.now(),
            kind: "merchant_results",
            merchantLocator: {
              benefitType: resolvedType,
              results: data.results,
            },
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Merchant search failed.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: message,
            createdAt: Date.now(),
            kind: "text",
          },
        ]);
      } finally {
        setIsLocating(false);
      }
    },
    [activeBenefitType, isLoading, isLocating, isScanning],
  );

  const processBillFile = useCallback(
    async (file: File) => {
      if (isScanning || isLoading || isLocating) return;

      setIsScanning(true);
      setError(null);

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: `Attached: ${file.name}`,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);

      try {
        const extract = await runBillOcr(file);

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: extract.error
              ? extract.error
              : extract.warning
                ? extract.warning
                : "I've extracted the claim details from your bill. Please review them before submitting.",
            createdAt: Date.now(),
            kind: "bill_extract",
            billExtract: extract,
          },
        ]);
      } catch (err) {
        console.error("OCR failed", err);
        setError("OCR failed");
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              "I couldn't scan that file. Please try another clear photo or PDF.",
            createdAt: Date.now(),
            kind: "bill_extract",
            billExtract: {
              fileName: file.name,
              rawText: "",
              error:
                "I couldn't scan that file. Please try another clear photo or PDF.",
            },
          },
        ]);
      } finally {
        setIsScanning(false);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  const updateBillExtract = useCallback(
    (messageId: string, next: BillExtract) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, billExtract: next }
            : message,
        ),
      );
    },
    [],
  );

  const submitBillClaim = useCallback(
    (messageId: string, extract: BillExtract) => {
      updateBillExtract(messageId, { ...extract, submitted: true });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Claim submitted for ${extract.vendor || "your bill"} (${extract.amount || "amount pending"}) under ${extract.category || "selected category"}. You can track it from Claim history.`,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);
    },
    [updateBillExtract],
  );

  return {
    messages,
    isLoading,
    isScanning,
    isLocating,
    error,
    sendMessage,
    processBillFile,
    openUploadOptions,
    updateBillExtract,
    submitBillClaim,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
    hasMessages: messages.length > 0,
  };
}
