"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClaimId, getClaimDetails } from "@/features/claims/constants";
import {
  parseStoredAmount,
  readClaimOverrides,
  updateClaimOverride,
} from "@/features/claims/store";
import {
  getPolicyCategory,
  type PolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import { resolveAssistantReply } from "@/lib/assistant/engine";
import {
  appDataContextForResolution,
  appDataPayloadForResolution,
  buildGroundedAppData,
  checkAppDataGrounding,
  createAppDataLeadSummary,
  resolveAppDataQuestion,
  type AppDataContext,
  type AppDataResolution,
} from "@/lib/assistant/appData";
import {
  checkPolicyGrounding,
  buildStructuredPolicyAnswer,
  createPolicyLeadSummary,
  isExplicitAssistantAction,
  policyPayloadForAnswer,
  resolvePolicyQuestion,
} from "@/lib/assistant/policy";
import {
  generateAppDataAnswer,
  generateAssistantRoute,
  generatePolicyAnswer,
  supportsOnDevicePolicyModel,
} from "@/lib/assistant/policyModel";
import { buildAssistantHistory } from "@/lib/assistant/history";
import { routePlanFor } from "@/lib/assistant/route";
import {
  DRIVER_REGISTRATION_INTENT,
  USER_DISPLAY_NAME,
  VEHICLE_REGISTRATION_INTENT,
} from "./constants";
import {
  searchMerchantsByName,
  searchMerchantsNearby,
} from "@/lib/merchants/openStreetMap";
import { runDlOcr } from "@/lib/ocr/runDlOcr";
import { runBillOcr } from "@/lib/ocr/runOcr";
import { evaluateClaimPrecheck } from "@/lib/claims/precheck";
import { saveRegisteredVehicle } from "@/features/vehicle/registration";
import { saveRegisteredDriver } from "@/features/driver/registration";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";
import { vehicleDisplayName } from "@/lib/vehicle/roster";
import type { BenefitType } from "@/lib/merchants/types";
import type { VehicleLookup } from "@/lib/vehicle/types";
import type {
  BillExtract,
  BillUploadScenarioId,
  ChatMessage,
  DocumentProcessingStage,
  DocumentUploadKind,
  DlUploadScenarioId,
  DriverSalaryPayload,
  PolicyModelStatus,
  VehicleLookupPayload,
} from "./types";
import {
  buildBillExtractFromScenario,
  buildDlPayloadFromScenario,
  getBillUploadScenario,
  getDemoPrecheckDate,
  getDlUploadScenario,
} from "./demoUploadScenarios";
import {
  clearChatSession,
  createPersistedChatSession,
  loadChatSession,
  saveChatSession,
} from "./persistence";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function benefitLabel(benefitType: BenefitType): string {
  return benefitType === "meal" ? "Meal" : "Fuel";
}

function articleFor(value: string): "a" | "an" {
  return /^[aeiou]/i.test(value.trim()) ? "an" : "a";
}

export function useChat() {
  const chatVersionRef = useRef(0);
  const driverSalaryDraftRef = useRef<DriverSalaryPayload>({});
  const previewUrlsRef = useRef(new Map<string, string>());
  // Lets sendMessage read the transcript for prompt history without taking
  // `messages` as a dependency, which would change its identity every append.
  const messagesRef = useRef<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [documentProcessingStage, setDocumentProcessingStage] =
    useState<DocumentProcessingStage | null>(null);
  const [documentProcessingKind, setDocumentProcessingKind] =
    useState<DocumentUploadKind>("bill");
  const [isHydrated, setIsHydrated] = useState(false);
  const [policyModelStatus, setPolicyModelStatus] =
    useState<PolicyModelStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBenefitType, setActiveBenefitType] =
    useState<BenefitType | null>(null);
  const [activePolicyCategory, setActivePolicyCategory] =
    useState<PolicyTabId | null>(null);
  const [activeAppDataContext, setActiveAppDataContext] =
    useState<AppDataContext | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = loadChatSession();
      if (saved) {
        driverSalaryDraftRef.current = saved.driverSalaryDraft;
        setMessages(saved.messages);
        setActiveBenefitType(saved.activeBenefitType);
        setActivePolicyCategory(saved.activePolicyCategory);
        setActiveAppDataContext(saved.activeAppDataContext);
      }
      setIsHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!isHydrated) return;
    if (messages.length === 0) {
      clearChatSession();
      return;
    }
    saveChatSession(
      createPersistedChatSession({
        messages,
        driverSalaryDraft: driverSalaryDraftRef.current,
        activeBenefitType,
        activePolicyCategory,
        activeAppDataContext,
      }),
    );
  }, [
    activeAppDataContext,
    activeBenefitType,
    activePolicyCategory,
    isHydrated,
    messages,
  ]);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  const startNewChat = useCallback(() => {
    chatVersionRef.current += 1;
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    driverSalaryDraftRef.current = {};
    messagesRef.current = [];
    setMessages([]);
    setIsLoading(false);
    setIsScanning(false);
    setIsLocating(false);
    setDocumentProcessingStage(null);
    setDocumentProcessingKind("bill");
    setPolicyModelStatus(null);
    setError(null);
    setActiveBenefitType(null);
    setActivePolicyCategory(null);
    setActiveAppDataContext(null);
    clearChatSession();
  }, []);

  const appendUploadOptions = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Upload options",
        createdAt: Date.now(),
        kind: "upload_options",
      },
    ]);
  }, []);

  const appendMealMerchantSearchOptions = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Search options",
        createdAt: Date.now(),
        kind: "merchant_search_options",
        merchantLocator: { benefitType: "meal" },
      },
    ]);
  }, []);

  const appendPolicyOptions = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        content: "Choose a benefit policy",
        createdAt: Date.now(),
        kind: "policy_options",
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

  const startClaimEdit = useCallback(
    (claimId: string) => {
      if (isLoading || isScanning || isLocating) return;
      const normalized = claimId.trim().toUpperCase();
      const override = readClaimOverrides()[normalized];
      const claim = getClaimDetails(normalized, override);
      const extract: BillExtract = {
        fileName: claim.fileName,
        rawText: "",
        category: claim.category,
        vendor: claim.vendor,
        amount: String(parseStoredAmount(claim.amount) ?? ""),
        billDate: claim.billDate,
        billingMonth: claim.billingMonth,
        invoiceNo: claim.invoiceNo,
        confidence: 100,
        warningAcknowledged: true,
        editClaimId: claim.id,
      };
      const messageId = createId();
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: `Edit claim ${claim.id}`,
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: messageId,
          role: "assistant",
          content: "Here are the saved bill and claim details. Make your changes and save when everything looks right.",
          createdAt: Date.now(),
          kind: "bill_extract",
          billExtract: extract,
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

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

      // Captured before the user turn is appended so the prompt sees prior
      // context without the question repeated back to it.
      const history = buildAssistantHistory(messagesRef.current);
      const trackProgress = (progress?: number, file?: string) => {
        if (chatVersionRef.current !== chatVersion) return;
        setPolicyModelStatus({ progress, file });
      };

      const answerFromAppData = async (resolution: AppDataResolution) => {
        const source = buildGroundedAppData(resolution);
        setActiveAppDataContext(appDataContextForResolution(resolution));
        setActivePolicyCategory(null);

        let reply = createAppDataLeadSummary(source);

        if (supportsOnDevicePolicyModel()) {
          setPolicyModelStatus({});
          try {
            const generated = await generateAppDataAnswer(
              trimmed,
              resolution,
              history,
              trackProgress,
            );
            const check = checkAppDataGrounding(generated, source);
            if (check.grounded) {
              reply = generated;
            } else {
              console.warn(
                "Discarded an ungrounded app-data answer; using the deterministic summary.",
                check,
              );
            }
          } catch (modelError) {
            console.warn(
              "Backend assistant unavailable; using app-data fallback.",
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
            appDataAnswer: appDataPayloadForResolution(resolution, source),
          },
        ]);
      };

      const answerFromPolicy = async (categories: PolicyCategory[]) => {
        const categoryIds = categories.map((category) => category.id);
        const structured = buildStructuredPolicyAnswer(trimmed, categories);
        setActivePolicyCategory(categoryIds[0]);
        setActiveAppDataContext(null);

        let reply = createPolicyLeadSummary(structured);

        if (supportsOnDevicePolicyModel()) {
          setPolicyModelStatus({});
          try {
            const generated = await generatePolicyAnswer(
              trimmed,
              categoryIds,
              history,
              trackProgress,
            );
            const check = checkPolicyGrounding(generated, categories);
            if (check.grounded) {
              reply = generated;
            } else {
              console.warn(
                "Discarded an ungrounded policy answer; using the deterministic summary.",
                check,
              );
            }
          } catch (modelError) {
            console.warn(
              "Backend assistant unavailable; using policy fallback.",
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
            policyAnswer: policyPayloadForAnswer(
              trimmed,
              categories,
              structured,
            ),
          },
        ]);
      };

      const answerFromIntent = (resolvedIntentId?: string) => {
        const data = resolveAssistantReply(trimmed, resolvedIntentId);
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
          setActiveBenefitType("meal");
          appendMealMerchantSearchOptions();
        }

        if (data.intentId === "view_policy") {
          appendPolicyOptions();
        }

        if (data.intentId === VEHICLE_REGISTRATION_INTENT) {
          appendVehicleNumberInput();
        }

        if (data.intentId === DRIVER_REGISTRATION_INTENT) {
          const draft: DriverSalaryPayload = {};
          driverSalaryDraftRef.current = draft;
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: "Driver name",
              createdAt: Date.now(),
              kind: "driver_name_input",
              driverSalary: draft,
            },
          ]);
        }
      };

      try {
        // Deterministic matchers stay the fast path: they are instant, they
        // keep working on the static export, and they cover the phrasings the
        // quick actions produce.
        const appDataResolution = resolveAppDataQuestion(
          trimmed,
          intentId,
          activeAppDataContext,
        );

        if (appDataResolution) {
          await answerFromAppData(appDataResolution);
          return;
        }

        const policyResolution = intentId
          ? null
          : resolvePolicyQuestion(trimmed, activePolicyCategory);

        if (policyResolution) {
          await answerFromPolicy(policyResolution.categories);
          return;
        }

        // Anything the matchers missed goes to the model for classification.
        // It only picks which grounded source to build — never the facts.
        if (
          !intentId &&
          trimmed &&
          !isExplicitAssistantAction(trimmed) &&
          supportsOnDevicePolicyModel()
        ) {
          setPolicyModelStatus({});
          try {
            const route = await generateAssistantRoute(
              trimmed,
              history,
              trackProgress,
            );
            if (chatVersionRef.current !== chatVersion) return;

            const plan = route ? routePlanFor(route) : null;
            if (plan?.kind === "appData") {
              await answerFromAppData(plan.resolution);
              return;
            }
            if (plan?.kind === "policy") {
              await answerFromPolicy(plan.categories);
              return;
            }
            if (plan?.kind === "intent") {
              answerFromIntent(plan.intentId);
              return;
            }
          } catch (routeError) {
            console.warn(
              "Assistant routing unavailable; using keyword intents.",
              routeError,
            );
          }
        }

        answerFromIntent(intentId);
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
      appendMealMerchantSearchOptions,
      appendPolicyOptions,
      appendUploadOptions,
      appendVehicleNumberInput,
      activePolicyCategory,
      activeAppDataContext,
      isLoading,
      isLocating,
      isScanning,
    ],
  );

  const selectPolicyCategory = useCallback(
    (categoryId: PolicyTabId) => {
      if (isLoading || isScanning || isLocating) return;
      const policy = getPolicyCategory(categoryId);
      void sendMessage(policy.tabLabel);
    },
    [isLoading, isLocating, isScanning, sendMessage],
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
          content: benefitLabel(benefitType),
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

      const resolvedType = benefitType ?? activeBenefitType ?? "meal";

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
          content: "Find near you",
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

  const processBillScenario = useCallback(
    async (
      scenarioId: BillUploadScenarioId,
      replaceMessageId?: string,
    ) => {
      if (isScanning || isLoading || isLocating) return;

      const scenario = getBillUploadScenario(scenarioId);
      const billMessageId = replaceMessageId ?? createId();
      setIsScanning(true);
      setDocumentProcessingKind("bill");
      setDocumentProcessingStage("preparing");
      setError(null);

      setMessages((prev) =>
        prev.concat({
          id: createId(),
          role: "user",
          content: `${replaceMessageId ? "Replaced with" : "Selected demo"}: ${scenario.label}`,
          createdAt: Date.now(),
          kind: "text",
        }),
      );

      try {
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        setDocumentProcessingStage("reading");
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        setDocumentProcessingStage("extracting");
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        setDocumentProcessingStage("checking");
        await new Promise((resolve) => window.setTimeout(resolve, 750));

        const nextExtract = buildBillExtractFromScenario(scenarioId);
        setMessages((prev) => {
          const previousExtract = replaceMessageId
            ? prev.find((message) => message.id === replaceMessageId)
                ?.billExtract
            : undefined;
          const nextMessage: ChatMessage = {
            id: billMessageId,
            role: "assistant",
            content: scenario.assistantMessage,
            createdAt: Date.now(),
            kind: "bill_extract",
            billExtract: {
              ...nextExtract,
              editClaimId: previousExtract?.editClaimId,
              warningAcknowledged: false,
            },
          };

          if (replaceMessageId) {
            return prev.map((message) =>
              message.id === replaceMessageId ? nextMessage : message,
            );
          }

          return [
            ...prev,
            {
              id: `${billMessageId}-scan`,
              role: "assistant",
              content: "Bill scanned",
              createdAt: Date.now(),
              kind: "document_scan",
            },
            nextMessage,
          ];
        });
      } finally {
        setIsScanning(false);
        setDocumentProcessingStage(null);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  const processDlScenario = useCallback(
    async (scenarioId: DlUploadScenarioId) => {
      if (isScanning || isLoading || isLocating) return;

      const scenario = getDlUploadScenario(scenarioId);
      const draftBase = { ...driverSalaryDraftRef.current };
      setIsScanning(true);
      setDocumentProcessingKind("dl");
      setDocumentProcessingStage("preparing");
      setError(null);

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: `Selected demo: ${scenario.label}`,
          createdAt: Date.now(),
          kind: "text",
        },
      ]);

      try {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        setDocumentProcessingStage("reading");
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        setDocumentProcessingStage("checking");
        await new Promise((resolve) => window.setTimeout(resolve, 1000));

        const draft: DriverSalaryPayload = {
          ...draftBase,
          ...buildDlPayloadFromScenario(scenarioId),
        };
        driverSalaryDraftRef.current = draft;

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: scenario.assistantMessage,
            createdAt: Date.now(),
            kind: "driver_dl_extract",
            driverSalary: draft,
          },
        ]);
      } finally {
        setIsScanning(false);
        setDocumentProcessingStage(null);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  // Preserved for future live-upload reactivation. The active UI uses the
  // deterministic scenario handlers above and never calls OCR.
  const processBillFile = useCallback(
    async (file: File, replaceMessageId?: string) => {
      if (isScanning || isLoading || isLocating) return;

      setIsScanning(true);
      setDocumentProcessingKind("bill");
      setDocumentProcessingStage("preparing");
      setError(null);

      const billMessageId = replaceMessageId ?? createId();
      const previousPreview = previewUrlsRef.current.get(billMessageId);
      if (previousPreview) URL.revokeObjectURL(previousPreview);
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.set(billMessageId, previewUrl);

      setMessages((prev) =>
        prev.concat({
          id: createId(),
          role: "user",
          content: `${replaceMessageId ? "Replaced with" : "Attached"}: ${file.name}`,
          createdAt: Date.now(),
          kind: "text",
        }),
      );

      try {
        const startTime = Date.now();
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        setDocumentProcessingStage("reading");
        const [extract] = await Promise.all([
          runBillOcr(file),
          new Promise((resolve) => window.setTimeout(resolve, 750)),
        ]);
        const nextExtract: BillExtract = {
          ...extract,
          previewUrl,
          previewType: file.type,
        };
        setDocumentProcessingStage("extracting");
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        setDocumentProcessingStage("checking");
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 3000 - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remaining));
        }

        setMessages((prev) => {
          const vendor = nextExtract.vendor || nextExtract.merchant || "";
          const category = nextExtract.category || "benefits";
          const previousExtract = replaceMessageId
            ? prev.find((message) => message.id === replaceMessageId)?.billExtract
            : undefined;
          const nextMessage: ChatMessage = {
            id: billMessageId,
            role: "assistant",
            content: extract.error
              ? extract.error
              : extract.warning
                ? extract.warning
                : vendor
                  ? `I found ${articleFor(vendor)} ${vendor} bill. It looks like ${articleFor(category)} ${category} claim.`
                  : `I found the bill. It looks like ${articleFor(category)} ${category} claim.`,
            createdAt: Date.now(),
            kind: "bill_extract",
            billExtract: {
              ...nextExtract,
              editClaimId: previousExtract?.editClaimId,
              warningAcknowledged: previousExtract?.warningAcknowledged,
            },
          };
          if (replaceMessageId) {
            return prev.map((message) =>
              message.id === replaceMessageId ? nextMessage : message,
            );
          }
          return [
            ...prev,
            {
              id: `${billMessageId}-scan`,
              role: "assistant",
              content: "Bill scanned",
              createdAt: Date.now(),
              kind: "document_scan",
            },
            nextMessage,
          ];
        });
      } catch (err) {
        console.error("OCR failed", err);
        setError("OCR failed");
        setMessages((prev) => {
          const previousExtract = replaceMessageId
            ? prev.find((message) => message.id === replaceMessageId)?.billExtract
            : undefined;
          const nextMessage: ChatMessage = {
            id: billMessageId,
            role: "assistant",
            content:
              "I couldn't scan that file. Please try another clear photo or PDF.",
            createdAt: Date.now(),
            kind: "bill_extract",
            billExtract: {
              fileName: file.name,
              rawText: "",
              previewUrl,
              previewType: file.type,
              editClaimId: previousExtract?.editClaimId,
              warningAcknowledged: previousExtract?.warningAcknowledged,
              error:
                "I couldn't scan that file. Please try another clear photo or PDF.",
            },
          };
          return replaceMessageId
            ? prev.map((message) =>
                message.id === replaceMessageId ? nextMessage : message,
              )
            : [...prev, nextMessage];
        });
      } finally {
        setIsScanning(false);
        setDocumentProcessingStage(null);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  const replaceBillFile = useCallback(
    async (messageId: string, file: File) => {
      await processBillFile(file, messageId);
    },
    [processBillFile],
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
      const precheck = evaluateClaimPrecheck(
        extract,
        getDemoPrecheckDate(extract),
      );
      if (
        precheck.status === "blocked" ||
        (precheck.requiresAcknowledgement && !extract.warningAcknowledged)
      ) {
        return;
      }
      const claimId = createClaimId();
      const submittedExtract = { ...extract, submitted: true };
      updateBillExtract(messageId, submittedExtract);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Claim ${claimId} submitted.`,
          createdAt: Date.now(),
          kind: "claim_cta",
          claimId,
          billExtract: submittedExtract,
        },
      ]);
    },
    [updateBillExtract],
  );

  const saveClaimEdit = useCallback(
    (messageId: string, claimId: string, extract: BillExtract) => {
      const amount = parseStoredAmount(extract.amount);
      updateClaimOverride(claimId, {
        vendor: extract.vendor || extract.merchant || "",
        category: extract.category || "",
        amount,
        billDate: extract.billDate || extract.date || "",
        billingMonth: extract.billingMonth || "",
        invoiceNo: extract.invoiceNo || "",
        fileName: extract.fileName,
      });
      updateBillExtract(messageId, extract);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Claim ${claimId} updated.`,
          createdAt: Date.now(),
          kind: "claim_cta",
          claimId,
          claimAction: "updated",
          billExtract: extract,
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

  const submitVehicleNumber = useCallback(
    (regNumber: string) => {
      // The lookup itself is synchronous, but a bill OCR or geolocation call
      // may be mid-flight and about to append — don't interleave with it.
      if (isLoading || isScanning || isLocating) return;

      const result = buildVehicleLookup(regNumber, USER_DISPLAY_NAME);

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: regNumber,
          createdAt: Date.now(),
          kind: "text",
        },
        result.ok
          ? {
              id: createId(),
              role: "assistant",
              content: `That's a ${vehicleDisplayName(result.lookup.profile)}. Check the details and send them to HR.`,
              createdAt: Date.now(),
              kind: "vehicle_details",
              vehicleLookup: { lookup: result.lookup },
            }
          : {
              id: createId(),
              role: "assistant",
              content: result.message,
              createdAt: Date.now(),
              kind: "vehicle_details",
              vehicleLookup: { error: result.message },
            },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const submitVehicleToHr = useCallback(
    (messageId: string, lookup: VehicleLookup) => {
      // Takes `lookup` rather than searching `messages` for it: depending on
      // `messages` would change this callback's identity on every append and
      // push a new function reference through every MessageBubble each turn.
      // submitBillClaim avoids that the same way.
      const claimId = createClaimId();

      // The commit point for the whole app: submitVehicleNumber only produces a
      // preview the user is asked to confirm, so registering there would flip
      // the dashboard before the transcript says registration happened.
      saveRegisteredVehicle(lookup);

      patchVehicleLookup(messageId, { submitted: true });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: `Vehicle registration ${claimId} submitted to HR.`,
          createdAt: Date.now(),
          kind: "claim_cta",
          claimId,
          vehicleLookup: { lookup, submitted: true },
        },
        {
          id: createId(),
          role: "assistant",
          content:
            "Next up — you can register your driver for Driver Salary benefits.",
          createdAt: Date.now(),
          kind: "text",
        },
      ]);
    },
    [patchVehicleLookup],
  );

  const startDriverSalary = useCallback(
    (vehicleClaimId?: string) => {
      if (isLoading || isScanning || isLocating) return;

      const draft: DriverSalaryPayload = {
        vehicleClaimId: vehicleClaimId || undefined,
      };
      driverSalaryDraftRef.current = draft;

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: "Driver Salary",
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Let's register your driver. What's the driver's full name?",
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Driver name",
          createdAt: Date.now(),
          kind: "driver_name_input",
          driverSalary: draft,
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const submitDriverName = useCallback(
    (name: string) => {
      if (isLoading || isScanning || isLocating) return;

      const draft: DriverSalaryPayload = {
        ...driverSalaryDraftRef.current,
        driverName: name.trim(),
      };
      driverSalaryDraftRef.current = draft;

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: name.trim(),
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: `Thanks. Please upload ${name.trim()}'s driving licence so I can read the DL number.`,
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Upload driving licence",
          createdAt: Date.now(),
          kind: "driver_dl_upload",
          driverSalary: draft,
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const processDlFile = useCallback(
    async (file: File) => {
      if (isScanning || isLoading || isLocating) return;

      setIsScanning(true);
      setDocumentProcessingKind("dl");
      setDocumentProcessingStage("preparing");
      setError(null);

      const draftBase = { ...driverSalaryDraftRef.current };

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
        const startTime = Date.now();
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        setDocumentProcessingStage("reading");
        const [ocr] = await Promise.all([
          runDlOcr(file),
          new Promise((resolve) => window.setTimeout(resolve, 1000)),
        ]);
        const draft: DriverSalaryPayload = {
          ...draftBase,
          ...ocr,
        };
        driverSalaryDraftRef.current = draft;
        setDocumentProcessingStage("checking");
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 3000 - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remaining));
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: ocr.dlError
              ? ocr.dlError
              : ocr.dlWarning
                ? ocr.dlWarning
                : "I found the DL number. Please confirm it before continuing.",
            createdAt: Date.now(),
            kind: "driver_dl_extract",
            driverSalary: draft,
          },
        ]);
      } catch (err) {
        console.error("DL OCR failed", err);
        setError("OCR failed");
        const draft: DriverSalaryPayload = {
          ...draftBase,
          dlFileName: file.name,
          dlRawText: "",
          dlError:
            "I couldn't scan that file. Please try another clear photo or PDF.",
        };
        driverSalaryDraftRef.current = draft;
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: draft.dlError || "OCR failed",
            createdAt: Date.now(),
            kind: "driver_dl_extract",
            driverSalary: draft,
          },
        ]);
      } finally {
        setIsScanning(false);
        setDocumentProcessingStage(null);
      }
    },
    [isLoading, isLocating, isScanning],
  );

  const confirmDriverDl = useCallback(
    (payload: DriverSalaryPayload) => {
      if (isLoading || isScanning || isLocating) return;
      if (!payload.dlNumber?.trim()) return;

      const draft: DriverSalaryPayload = {
        ...driverSalaryDraftRef.current,
        ...payload,
        dlNumber: payload.dlNumber.trim(),
        dlError: undefined,
      };
      driverSalaryDraftRef.current = draft;

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content:
            "Got it. What's the monthly driver salary and employment start date?",
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Salary details",
          createdAt: Date.now(),
          kind: "driver_salary_input",
          driverSalary: draft,
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const submitDriverSalaryDetails = useCallback(
    (salary: string, startDate: string) => {
      if (isLoading || isScanning || isLocating) return;

      const draft: DriverSalaryPayload = {
        ...driverSalaryDraftRef.current,
        salary: salary.trim(),
        startDate: startDate.trim(),
      };
      driverSalaryDraftRef.current = draft;

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "user",
          content: `${draft.salary} · starts ${draft.startDate}`,
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Here's a summary. Submit when everything looks right.",
          createdAt: Date.now(),
          kind: "text",
        },
        {
          id: createId(),
          role: "assistant",
          content: "Review driver details",
          createdAt: Date.now(),
          kind: "driver_salary_review",
          driverSalary: draft,
        },
      ]);
    },
    [isLoading, isLocating, isScanning],
  );

  const submitDriverSalaryClaim = useCallback(
    (payload: DriverSalaryPayload) => {
      const claimId = createClaimId();
      const submitted: DriverSalaryPayload = {
        ...driverSalaryDraftRef.current,
        ...payload,
        submitted: true,
      };
      driverSalaryDraftRef.current = submitted;
      saveRegisteredDriver(submitted);

      setMessages((prev) =>
        prev
          .map((message) =>
            message.kind === "driver_salary_review"
              ? { ...message, driverSalary: submitted }
              : message,
          )
          .concat({
            id: createId(),
            role: "assistant",
            content: `Driver registration ${claimId} submitted to HR.`,
            createdAt: Date.now(),
            kind: "claim_cta",
            claimId,
            driverSalary: submitted,
          }),
      );
    },
    [],
  );

  return {
    messages,
    isLoading,
    isScanning,
    isLocating,
    documentProcessingStage,
    documentProcessingKind,
    isHydrated,
    policyModelStatus,
    error,
    sendMessage,
    startClaimEdit,
    processBillFile,
    replaceBillFile,
    processDlFile,
    processBillScenario,
    processDlScenario,
    openUploadOptions,
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
    hasMessages: messages.length > 0,
  };
}
