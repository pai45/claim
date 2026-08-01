"use client";

import { useCallback, useRef, useState } from "react";
import { createClaimId } from "@/features/claims/constants";
import type { PolicyTabId } from "@/features/policy/constants";
import { resolveAssistantReply } from "@/lib/assistant/engine";
import {
  appDataContextForResolution,
  appDataPayloadForResolution,
  buildGroundedAppData,
  createAppDataFallbackSummary,
  isGroundedAppDataAnswer,
  resolveAppDataQuestion,
  type AppDataContext,
} from "@/lib/assistant/appData";
import {
  createPolicyFallbackSummary,
  isGroundedPolicyAnswer,
  resolvePolicyQuestion,
} from "@/lib/assistant/policy";
import {
  generateAppDataAnswer,
  generatePolicyAnswer,
  supportsOnDevicePolicyModel,
} from "@/lib/assistant/policyModel";
import { VEHICLE_REGISTRATION_INTENT } from "./constants";
import {
  searchMerchantsByName,
  searchMerchantsNearby,
} from "@/lib/merchants/openStreetMap";
import { runBillOcr } from "@/lib/ocr/runOcr";
import { runRcOcr } from "@/lib/ocr/runRcOcr";
import {
  applyManualIdentity,
  applyRcToLookup,
  describeVehicle,
  isIdentified,
  isVehicleApiConfigured,
  resolveVehicle,
} from "@/lib/vehicle/resolve";
import type { BenefitType } from "@/lib/merchants/types";
import type {
  BillExtract,
  ChatMessage,
  PolicyModelStatus,
  VehicleLookupPayload,
} from "./types";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function benefitLabel(benefitType: BenefitType): string {
  return benefitType === "meal" ? "Meal" : "Fuel";
}

export function useChat() {
  const chatVersionRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [policyModelStatus, setPolicyModelStatus] =
    useState<PolicyModelStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBenefitType, setActiveBenefitType] =
    useState<BenefitType | null>(null);
  const [activePolicyCategory, setActivePolicyCategory] =
    useState<PolicyTabId | null>(null);
  const [activeAppDataContext, setActiveAppDataContext] =
    useState<AppDataContext | null>(null);

  const startNewChat = useCallback(() => {
    chatVersionRef.current += 1;
    setMessages([]);
    setIsLoading(false);
    setIsScanning(false);
    setIsLocating(false);
    setPolicyModelStatus(null);
    setError(null);
    setActiveBenefitType(null);
    setActivePolicyCategory(null);
    setActiveAppDataContext(null);
  }, []);

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

  const appendVehicleNumberInput = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Vehicle number",
        createdAt: Date.now(),
        kind: "vehicle_number_input",
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
      const chatVersion = chatVersionRef.current;

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
        const appDataResolution = resolveAppDataQuestion(
          trimmed,
          intentId,
          activeAppDataContext,
        );
        const policyResolution = intentId
          ? null
          : resolvePolicyQuestion(trimmed, activePolicyCategory);

        if (appDataResolution) {
          const source = buildGroundedAppData(appDataResolution);
          setActiveAppDataContext(
            appDataContextForResolution(appDataResolution),
          );
          setActivePolicyCategory(null);

          let reply = createAppDataFallbackSummary(
            trimmed,
            appDataResolution,
          );

          if (supportsOnDevicePolicyModel()) {
            setPolicyModelStatus({});
            try {
              const generated = await generateAppDataAnswer(
                trimmed,
                source,
                (progress, file) => {
                  if (chatVersionRef.current !== chatVersion) return;
                  setPolicyModelStatus({ progress, file });
                },
              );

              if (isGroundedAppDataAnswer(generated, source)) {
                reply = generated;
              }
            } catch (modelError) {
              console.warn(
                "On-device model unavailable; using app-data fallback.",
                modelError,
              );
            }
          }

          if (chatVersionRef.current !== chatVersion) return;

          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: reply,
              createdAt: Date.now(),
              kind: "app_data_answer",
              appDataAnswer: appDataPayloadForResolution(appDataResolution),
            },
          ]);
          return;
        }

        if (policyResolution?.type === "ambiguous") {
          setActivePolicyCategory(null);
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: `I found more than one matching policy: ${policyResolution.categories
                .map((category) => category.tabLabel)
                .join(", ")}. Please ask about one benefit at a time.`,
              createdAt: Date.now(),
              kind: "text",
            },
          ]);
          return;
        }

        if (policyResolution?.type === "match") {
          const { category } = policyResolution;
          setActivePolicyCategory(category.id);
          setActiveAppDataContext(null);

          let reply = createPolicyFallbackSummary(trimmed, category);

          if (supportsOnDevicePolicyModel()) {
            setPolicyModelStatus({});
            try {
              const generated = await generatePolicyAnswer(
                trimmed,
                category,
                (progress, file) => {
                  if (chatVersionRef.current !== chatVersion) return;
                  setPolicyModelStatus({ progress, file });
                },
              );

              if (isGroundedPolicyAnswer(generated, category)) {
                reply = generated;
              }
            } catch (modelError) {
              console.warn(
                "On-device policy model unavailable; using policy fallback.",
                modelError,
              );
            }
          }

          if (chatVersionRef.current !== chatVersion) return;

          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: reply,
              createdAt: Date.now(),
              kind: "policy_answer",
              policyAnswer: { categoryId: category.id },
            },
          ]);
          return;
        }

        const data = resolveAssistantReply(trimmed, intentId);
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

        if (data.intentId === "track_claim") {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content:
                "Here's a recent claim you can review. Tap below to open claim details.",
              createdAt: Date.now(),
              kind: "claim_cta",
              claimId: "CLM-43872",
            },
          ]);
        }

        if (data.intentId === "merchant_locator") {
          setActiveBenefitType(null);
          appendMerchantTypeOptions();
        }

        if (data.intentId === VEHICLE_REGISTRATION_INTENT) {
          appendVehicleNumberInput();
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
        if (chatVersionRef.current === chatVersion) {
          setPolicyModelStatus(null);
          setIsLoading(false);
        }
      }
    },
    [
      appendMerchantTypeOptions,
      appendUploadOptions,
      appendVehicleNumberInput,
      activePolicyCategory,
      activeAppDataContext,
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
            const results = await searchMerchantsNearby(
              resolvedType,
              position.coords.latitude,
              position.coords.longitude,
            );

            setMessages((prev) => [
              ...prev,
              {
                id: createId(),
                role: "assistant",
                content:
                  results.length > 0
                    ? `Here are the ${Math.min(3, results.length)} nearest ${benefitLabel(resolvedType).toLowerCase()} merchants:`
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
                  results,
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
        const results = await searchMerchantsByName(resolvedType, trimmed);

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              results.length > 0
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
              results,
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
      const claimId = createClaimId();
      updateBillExtract(messageId, { ...extract, submitted: true });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Claim ${claimId} submitted for ${extract.vendor || "your bill"} (${extract.amount || "amount pending"}) under ${extract.category || "selected category"}.`,
          createdAt: Date.now(),
          kind: "claim_cta",
          claimId,
        },
      ]);
    },
    [updateBillExtract],
  );

  const patchVehicleLookup = useCallback(
    (messageId: string, patch: Partial<VehicleLookupPayload>) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                vehicleLookup: { ...message.vehicleLookup, ...patch },
              }
            : message,
        ),
      );
    },
    [],
  );

  const openVehicleLookup = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content:
          "Sure. Enter your vehicle number and I'll pull up the registration details.",
        createdAt: Date.now(),
        kind: "text",
      },
    ]);
    appendVehicleNumberInput();
  }, [appendVehicleNumberInput]);

  const submitVehicleNumber = useCallback(
    async (regNumber: string) => {
      if (isLoading || isScanning || isLocating) return;

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: regNumber,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);

      // Only the API call is slow; the offline decode is instant
      const looksUpRemotely = isVehicleApiConfigured();
      if (looksUpRemotely) setIsLoading(true);

      try {
        const resolution = await resolveVehicle(regNumber);

        if (!resolution.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: resolution.message,
              createdAt: Date.now(),
              kind: "vehicle_details",
              vehicleLookup: { error: resolution.message },
            },
          ]);
          return;
        }

        const { lookup } = resolution;
        const identified = isIdentified(lookup);

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: identified
              ? `That's a ${lookup.identity?.makerModel}.`
              : "Here's what the number plate tells me. Scan your RC to confirm the make and model.",
            createdAt: Date.now(),
            kind: "vehicle_details",
            vehicleLookup: { lookup, warning: lookup.warning },
          },
        ]);
      } finally {
        if (looksUpRemotely) setIsLoading(false);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  const scanRcForVehicle = useCallback(
    async (messageId: string, file: File) => {
      if (isScanning || isLoading || isLocating) return;

      setIsScanning(true);
      setError(null);
      patchVehicleLookup(messageId, {
        scanning: true,
        warning: undefined,
        regMismatch: undefined,
      });

      try {
        const rc = await runRcOcr(file);

        setMessages((prev) =>
          prev.map((message) => {
            if (message.id !== messageId || !message.vehicleLookup?.lookup) {
              return message;
            }

            if (rc.error) {
              return {
                ...message,
                vehicleLookup: {
                  ...message.vehicleLookup,
                  scanning: false,
                  warning: rc.error,
                },
              };
            }

            const merged = applyRcToLookup(message.vehicleLookup.lookup, rc);
            return {
              ...message,
              vehicleLookup: {
                ...message.vehicleLookup,
                lookup: merged,
                regMismatch: merged.regMismatch,
                warning: rc.warning,
                scanning: false,
              },
            };
          }),
        );
      } catch (err) {
        console.error("RC OCR failed", err);
        setError("OCR failed");
        patchVehicleLookup(messageId, {
          scanning: false,
          warning:
            "I couldn't read that RC. Try a clearer photo, or enter the details manually.",
        });
      } finally {
        setIsScanning(false);
      }
    },
    [isLoading, isLocating, isScanning, patchVehicleLookup],
  );

  const setVehicleManually = useCallback(
    (messageId: string, maker: string, model: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId && message.vehicleLookup?.lookup
            ? {
                ...message,
                vehicleLookup: {
                  ...message.vehicleLookup,
                  lookup: applyManualIdentity(
                    message.vehicleLookup.lookup,
                    maker,
                    model,
                  ),
                  warning: undefined,
                  regMismatch: undefined,
                },
              }
            : message,
        ),
      );
    },
    [],
  );

  const confirmVehicle = useCallback(
    (messageId: string) => {
      const message = messages.find((item) => item.id === messageId);
      const lookup = message?.vehicleLookup?.lookup;
      if (!lookup) return;

      patchVehicleLookup(messageId, { confirmed: true });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Vehicle confirmed — ${describeVehicle(lookup)}. I'll use this for your motor claim.`,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);
    },
    [messages, patchVehicleLookup],
  );

  return {
    messages,
    isLoading,
    isScanning,
    isLocating,
    policyModelStatus,
    error,
    sendMessage,
    processBillFile,
    openUploadOptions,
    updateBillExtract,
    submitBillClaim,
    selectMerchantBenefitType,
    selectMerchantSearchMode,
    searchMerchantByName,
    openVehicleLookup,
    submitVehicleNumber,
    scanRcForVehicle,
    setVehicleManually,
    confirmVehicle,
    startNewChat,
    hasMessages: messages.length > 0,
  };
}
