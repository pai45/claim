"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ScanPayFlow } from "@/components/scan-pay/ScanPayFlow";
import { EbBottomNav } from "@/components/shared/EbBottomNav";
import { EbHomeWalkthrough } from "@/components/walkthrough/EbHomeWalkthrough";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  resolveScanPayMerchantSelection,
  resolveScanPayScenario,
} from "@/features/scan-pay/fixtures";
import type {
  ScanPayMerchantType,
  ScanPayScenario,
} from "@/features/scan-pay/types";
import {
  WALLET_FILTER_OPTIONS,
  getWalletBalance,
  getRecentTransactionsByWallet,
  getTransactionItems,
} from "@/features/transactions/constants";
import { useFinancialStateVersion } from "@/features/transactions/useFinancialState";
import {
  resolveTransactionMode,
  type TransactionProductMode,
} from "@/features/transactions/mode";
import type { EmployeeBenefitsPersonaPayload } from "@/features/persona/types";
import { withBasePath } from "@/lib/basePath";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import "./employeeBenefitsHost.css";

const CLAIMS_HASH = "#claims";
const SCAN_PAY_HASH = "#scan-pay";
const SCAN_PAY_SCENARIO_QUERY = "scanPayScenario";
const SCAN_PAY_MERCHANT_QUERY = "scanPayMerchant";
const OPEN_TRANSACTIONS_MESSAGE = "employee-benefits:open-transactions";
const OPEN_WALLET_STATEMENT_MESSAGE = "employee-benefits:open-wallet-statement";
const OPEN_MANAGE_LIMITS_MESSAGE = "employee-benefits:open-manage-limits";
const OPEN_MANAGE_TOKENS_MESSAGE = "employee-benefits:open-manage-tokens";
const OPEN_PROFILE_MESSAGE = "employee-benefits:open-profile";
const OPEN_SPEND_ANALYTICS_MESSAGE = "employee-benefits:open-spend-analytics";
const OPEN_TRANSACTION_DETAILS_MESSAGE = "employee-benefits:open-transaction-details";
const OPEN_UPI_SETTINGS_MESSAGE = "employee-benefits:open-upi-settings";
const OPEN_SEND_MONEY_MESSAGE = "employee-benefits:open-send-money";
const OPEN_BANK_TRANSFER_MESSAGE = "employee-benefits:open-bank-transfer";
const OPEN_SCAN_PAY_MESSAGE = "employee-benefits:open-scan-pay";
const OPEN_BENEFITS_MESSAGE = "employee-benefits:open-benefits-assistant";
const START_EB_PLUS_SETUP_MESSAGE =
  "employee-benefits:start-eb-plus-setup";
const VERIFY_MPIN_MESSAGE = "employee-benefits:verify-mpin";
const MPIN_VERIFIED_MESSAGE = "employee-benefits:mpin-verified";
const MPIN_CANCELLED_MESSAGE = "employee-benefits:mpin-cancelled";
const MANAGE_CARDS_RETURN_QUERY = "returnTo";
const MANAGE_CARDS_RETURN_VALUE = "manage-cards";
const MANAGE_CARDS_FRAME_HASH = "#manage-cards";
type CardMpinIntent = "activate-card" | "set-card-pin";
type WalletStatementKey = "meal" | "fuel" | "misc" | "mobile";

function isCardMpinIntent(value: unknown): value is CardMpinIntent {
  return value === "activate-card" || value === "set-card-pin";
}

function isWalletStatementKey(value: unknown): value is WalletStatementKey {
  return value === "meal" || value === "fuel" || value === "misc" || value === "mobile";
}

/**
 * Body classes the source app sets while one of its full-screen surfaces
 * (wallet, card, manage cards, merchant directory, scan & pay) is open. Those
 * are not the home screen, so the shared nav has to step aside with them.
 */
const SOURCE_OVERLAY_CLASSES = ["is-overlay-open", "is-merchant-directory-open"];

export function EmployeeBenefitsHost() {
  const { persona } = useActivePersona();
  const financialVersion = useFinancialStateVersion();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const ebPlusSetupRef = useRef<HTMLElement>(null);
  const bodyObserverRef = useRef<MutationObserver | null>(null);
  const scanPayMerchantRotationRef = useRef(0);
  const scanPayLocationRef = useRef<string | null>(null);
  const [claimsOpen, setClaimsOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      persona.access.products.ebPlus &&
      window.location.hash.toLowerCase() === CLAIMS_HASH,
  );
  const [scanPayOpen, setScanPayOpen] = useState(false);
  const [scanPayScenario, setScanPayScenario] =
    useState<ScanPayScenario>("success");
  const [scanPayMerchantType, setScanPayMerchantType] =
    useState<Exclude<ScanPayMerchantType, "unclassified">>("meal");
  /**
   * Read once, before the frame exists: Manage Limit and Manage Tokens are
   * full-screen screens of their own, so their Back button comes home through a
   * fresh page load. The source app reopens the panel from a hash on the frame
   * URL during its own first paint — waiting for the frame's load event instead
   * would flash the home screen first. `HomeEntry` gates this component behind
   * hydration, so it never renders on the server and `window` is always here.
   */
  const [returnsToManageCards] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        MANAGE_CARDS_RETURN_QUERY,
      ) === MANAGE_CARDS_RETURN_VALUE,
  );
  // Seeded so the shared nav never paints over a panel that is already open.
  const [sourceOverlayOpen, setSourceOverlayOpen] =
    useState(returnsToManageCards);
  const [ebPlusSetupOpen, setEbPlusSetupOpen] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [plusPayMode, setPlusPayMode] = useState(
    persona.access.defaultProduct === "pluspay",
  );
  const [cardMpinIntent, setCardMpinIntent] = useState<CardMpinIntent | null>(
    null,
  );

  const configureScanPay = useCallback((searchParams: URLSearchParams) => {
    setScanPayScenario(
      resolveScanPayScenario(searchParams.get(SCAN_PAY_SCENARIO_QUERY)),
    );
    const merchantSelection = resolveScanPayMerchantSelection(
      searchParams.get(SCAN_PAY_MERCHANT_QUERY),
      scanPayMerchantRotationRef.current,
    );
    scanPayMerchantRotationRef.current = merchantSelection.nextRotationIndex;
    setScanPayMerchantType(merchantSelection.merchantType);
  }, []);

  const replyToEmployeeBenefits = useCallback(
    (type: string, intent: CardMpinIntent) => {
      frameRef.current?.contentWindow?.postMessage(
        { type, intent },
        window.location.origin,
      );
    },
    [],
  );

  const closeCardMpin = useCallback(() => {
    if (!cardMpinIntent) return;
    replyToEmployeeBenefits(MPIN_CANCELLED_MESSAGE, cardMpinIntent);
    setCardMpinIntent(null);
  }, [cardMpinIntent, replyToEmployeeBenefits]);

  const completeCardMpin = useCallback(() => {
    if (!cardMpinIntent) return;
    replyToEmployeeBenefits(MPIN_VERIFIED_MESSAGE, cardMpinIntent);
    setCardMpinIntent(null);
  }, [cardMpinIntent, replyToEmployeeBenefits]);

  const openClaims = useCallback(() => {
    if (!persona.access.products.ebPlus) return;
    setClaimsOpen(true);
    if (window.location.hash !== CLAIMS_HASH) {
      window.history.replaceState(null, "", CLAIMS_HASH);
    }
  }, [persona.access.products.ebPlus]);

  const closeClaims = useCallback(() => {
    setClaimsOpen(false);
    if (window.location.hash === CLAIMS_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  const openTransactions = useCallback(
    (mode: TransactionProductMode) => {
      const resolvedMode = resolveTransactionMode(mode, persona.access);
      window.location.assign(
        withBasePath(`/transactions/?mode=${resolvedMode}`),
      );
    },
    [persona.access],
  );

  const openWalletStatement = useCallback((wallet: WalletStatementKey) => {
    window.location.assign(
      withBasePath(`/wallet-statement/?wallet=${encodeURIComponent(wallet)}`),
    );
  }, []);

  const openSpendAnalytics = useCallback(() => {
    window.location.assign(withBasePath("/transactions/?tab=analytics&view=trends"));
  }, []);

  const openTransactionDetails = useCallback(
    (transactionId: unknown) => {
      if (
        typeof transactionId !== "string" ||
        !getTransactionItems(persona.id).some((item) => item.id === transactionId)
      ) {
        return;
      }
      window.location.assign(
        withBasePath(
          `/transaction-details/?id=${encodeURIComponent(transactionId)}&mode=benefits`,
        ),
      );
    },
    [persona.id],
  );

  const openManageLimits = useCallback(() => {
    window.location.assign(withBasePath("/manage-limit/"));
  }, []);

  const openManageTokens = useCallback(() => {
    window.location.assign(withBasePath("/manage-tokens/"));
  }, []);

  const openProfile = useCallback(() => {
    window.location.assign(withBasePath("/profile/"));
  }, []);

  const openUpiSettings = useCallback((tab: "benefits" | "pluspay") => {
    if (!persona.access.upiEnabled) return;
    if (tab === "benefits" && !persona.access.products.ebPlus) return;
    if (tab === "pluspay" && !persona.access.products.plusPay) return;
    window.location.assign(withBasePath(`/upi-settings/?tab=${tab}`));
  }, [persona.access]);

  const openSendMoney = useCallback((mode: "benefits" | "pluspay") => {
    if (!persona.access.upiEnabled) return;
    if (mode === "benefits" && !persona.access.products.ebPlus) return;
    if (mode === "pluspay" && !persona.access.products.plusPay) return;
    window.location.assign(withBasePath(`/send-money/?mode=${mode}`));
  }, [persona.access]);

  const openBankTransfer = useCallback(() => {
    if (!persona.access.products.ebPlus) return;
    window.location.assign(withBasePath("/bank-transfer/"));
  }, [persona.access.products.ebPlus]);

  const openScanPay = useCallback(() => {
    if (!persona.access.upiEnabled) return;
    setClaimsOpen(false);
    const searchParams = new URLSearchParams(window.location.search);
    configureScanPay(searchParams);
    setScanPayOpen(true);
    if (window.location.hash.toLowerCase() !== SCAN_PAY_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${SCAN_PAY_HASH}`,
      );
    }
    scanPayLocationRef.current = `${window.location.pathname}${window.location.search}${SCAN_PAY_HASH}`;
  }, [configureScanPay, persona.access.upiEnabled]);

  const syncFinancialStateToEmployeeBenefits = useCallback(() => {
    const syncedTransactions = getTransactionItems(persona.id);
    const walletTransactions = Object.fromEntries(
      WALLET_FILTER_OPTIONS.map((wallet) => [
        wallet.id,
        getRecentTransactionsByWallet(syncedTransactions, wallet.id),
      ]),
    );
    const wallets = Object.fromEntries(
      WALLET_FILTER_OPTIONS.map((wallet) => [
        wallet.id,
        getWalletBalance(wallet.id, persona.id),
      ]),
    );
    frameRef.current?.contentWindow?.postMessage(
      {
        type: "employee-benefits:sync-transactions",
        transactions: syncedTransactions,
        walletTransactions,
        wallets,
      },
      window.location.origin,
    );
  }, [persona.id]);

  const closeScanPay = useCallback(() => {
    setScanPayOpen(false);
    scanPayLocationRef.current = null;
    if (window.location.hash.toLowerCase() === SCAN_PAY_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  const openEbPlusSetup = useCallback(() => {
    if (
      persona.id !== "pluspay_only" ||
      persona.access.products.ebPlus
    ) {
      return;
    }
    setEbPlusSetupOpen(true);
  }, [persona.access.products.ebPlus, persona.id]);

  const closeEbPlusSetup = useCallback(() => {
    setEbPlusSetupOpen(false);
  }, []);

  const completeEbPlusSetup = useCallback(() => {
    setPlusPayMode(false);
    setEbPlusSetupOpen(false);
  }, []);

  useModalFocus(ebPlusSetupRef, ebPlusSetupOpen, closeEbPlusSetup);

  const connectClaimsBridge = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    const initialMode = resolveTransactionMode(
      new URLSearchParams(window.location.search).get("mode"),
      persona.access,
    );
    const initialPlusPayMode = initialMode === "pluspay";
    setPlusPayMode(initialPlusPayMode);

    // Navigation is owned by the host so Home and the Next.js screens render
    // the exact same component. Keep the iframe's legacy nav in the document
    // for its scripts, but remove it from layout and interaction.
    const legacyNav = document.querySelector<HTMLElement>(".bottom-nav");
    if (legacyNav) legacyNav.style.display = "none";

    // The source application's mock claims panel is never mounted. Its Claims
    // entry point is bridged to the real Benefits Assistant owned by Next.js.
    document.querySelector("[data-claims-assistant]")?.remove();

    // The source app hides its own nav behind these classes; the host nav
    // lives outside that document, so it has to watch for them.
    const syncSourceState = () => {
      setSourceOverlayOpen(
        SOURCE_OVERLAY_CLASSES.some((name) =>
          document.body.classList.contains(name),
        ),
      );
      setPlusPayMode(document.body.classList.contains("is-pluspay"));
    };

    bodyObserverRef.current?.disconnect();
    const observer = new MutationObserver(syncSourceState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    bodyObserverRef.current = observer;
    syncSourceState();

    // The frame's own URL carries the hash that reopened the panel, so all that
    // is left here is dropping the one-time instruction from the host's URL.
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get(MANAGE_CARDS_RETURN_QUERY) ===
      MANAGE_CARDS_RETURN_VALUE
    ) {
      searchParams.delete(MANAGE_CARDS_RETURN_QUERY);
      const search = searchParams.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
      );
    }

    const payload: EmployeeBenefitsPersonaPayload = {
      id: persona.id,
      name: persona.profile.name,
      initials: persona.profile.initials,
      access: {
        ...persona.access,
        defaultProduct: initialPlusPayMode ? "pluspay" : "ebPlus",
      },
      hasTransactions: persona.hasTransactions,
      hasBenefitsUpiId: persona.hasBenefitsUpiId,
      hasPlusPayUpiId: persona.hasPlusPayUpiId,
    };
    frameRef.current?.contentWindow?.postMessage(
      { type: "employee-benefits:sync-persona", persona: payload },
      window.location.origin,
    );
    syncFinancialStateToEmployeeBenefits();
    setFrameReady(true);
  }, [persona, syncFinancialStateToEmployeeBenefits]);

  const syncPersonaToEmployeeBenefits = useCallback(() => {
    const payload: EmployeeBenefitsPersonaPayload = {
      id: persona.id,
      name: persona.profile.name,
      initials: persona.profile.initials,
      access: {
        ...persona.access,
        defaultProduct: plusPayMode ? "pluspay" : "ebPlus",
      },
      hasTransactions: persona.hasTransactions,
      hasBenefitsUpiId: persona.hasBenefitsUpiId,
      hasPlusPayUpiId: persona.hasPlusPayUpiId,
    };
    frameRef.current?.contentWindow?.postMessage(
      { type: "employee-benefits:sync-persona", persona: payload },
      window.location.origin,
    );
  }, [persona, plusPayMode]);

  useEffect(() => () => bodyObserverRef.current?.disconnect(), []);

  useEffect(() => {
    void financialVersion;
    syncFinancialStateToEmployeeBenefits();
  }, [financialVersion, syncFinancialStateToEmployeeBenefits]);

  useEffect(() => {
    syncPersonaToEmployeeBenefits();
  }, [syncPersonaToEmployeeBenefits]);

  useEffect(() => {
    // Only picks up hashes the browser navigates to. The App Router changes the
    // URL through the history API, which fires neither of these — screens that
    // are already mounted have to call `openClaims` directly.
    const syncHash = () => {
      const hash = window.location.hash.toLowerCase();
      setClaimsOpen(
        persona.access.products.ebPlus &&
          hash === CLAIMS_HASH,
      );
      const shouldOpenScanPay =
        persona.access.upiEnabled && hash === SCAN_PAY_HASH;
      setScanPayOpen(shouldOpenScanPay);
      if (shouldOpenScanPay) {
        const locationKey = `${window.location.pathname}${window.location.search}${hash}`;
        const searchParams = new URLSearchParams(window.location.search);
        if (scanPayLocationRef.current !== locationKey) {
          configureScanPay(searchParams);
          scanPayLocationRef.current = locationKey;
        }
      } else {
        scanPayLocationRef.current = null;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (cardMpinIntent) {
        closeCardMpin();
        return;
      }
      if (claimsOpen) closeClaims();
    };
    const receiveHostBridge = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === OPEN_BENEFITS_MESSAGE) {
        openClaims();
        return;
      }
      if (event.data?.type === START_EB_PLUS_SETUP_MESSAGE) {
        openEbPlusSetup();
        return;
      }
      if (event.data?.type === OPEN_TRANSACTIONS_MESSAGE) {
        openTransactions(
          event.data.mode === "pluspay" ? "pluspay" : "benefits",
        );
        return;
      }
      if (
        event.data?.type === OPEN_WALLET_STATEMENT_MESSAGE &&
        isWalletStatementKey(event.data.wallet)
      ) {
        openWalletStatement(event.data.wallet);
        return;
      }
      if (event.data?.type === OPEN_SPEND_ANALYTICS_MESSAGE) {
        openSpendAnalytics();
        return;
      }
      if (event.data?.type === OPEN_TRANSACTION_DETAILS_MESSAGE) {
        openTransactionDetails(event.data.transactionId);
        return;
      }
      if (event.data?.type === OPEN_MANAGE_LIMITS_MESSAGE) {
        openManageLimits();
        return;
      }
      if (event.data?.type === OPEN_MANAGE_TOKENS_MESSAGE) {
        openManageTokens();
        return;
      }
      if (event.data?.type === OPEN_PROFILE_MESSAGE) {
        openProfile();
        return;
      }
      if (event.data?.type === OPEN_UPI_SETTINGS_MESSAGE) {
        openUpiSettings(
          event.data.tab === "pluspay" ? "pluspay" : "benefits",
        );
        return;
      }
      if (event.data?.type === OPEN_SEND_MONEY_MESSAGE) {
        openSendMoney(
          event.data.mode === "pluspay" ? "pluspay" : "benefits",
        );
        return;
      }
      if (event.data?.type === OPEN_BANK_TRANSFER_MESSAGE) {
        openBankTransfer();
        return;
      }
      if (event.data?.type === OPEN_SCAN_PAY_MESSAGE) {
        openScanPay();
        return;
      }
      if (
        event.data?.type === VERIFY_MPIN_MESSAGE &&
        isCardMpinIntent(event.data.intent)
      ) {
        setCardMpinIntent(event.data.intent);
      }
    };

    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("message", receiveHostBridge);
    const initialSyncFrame = window.requestAnimationFrame(syncHash);
    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("message", receiveHostBridge);
    };
  }, [
    claimsOpen,
    cardMpinIntent,
    closeCardMpin,
    closeClaims,
    configureScanPay,
    openClaims,
    openManageLimits,
    openManageTokens,
    openProfile,
    openBankTransfer,
    openEbPlusSetup,
    openScanPay,
    openSpendAnalytics,
    openTransactionDetails,
    openSendMoney,
    openTransactions,
    openWalletStatement,
    openUpiSettings,
    persona.access.products.ebPlus,
    persona.access.upiEnabled,
  ]);

  return (
    <main className="employee-benefits-host">
      <iframe
        ref={frameRef}
        className="employee-benefits-source"
        src={`${withBasePath("/employee-benefits/index.html")}?v=home-revamp-v1${
          returnsToManageCards ? MANAGE_CARDS_FRAME_HASH : ""
        }`}
        title="Employee Benefits"
        onLoad={connectClaimsBridge}
      />

      <EbBottomNav
        active="home"
        className={`employee-benefits-shared-nav${
          claimsOpen || scanPayOpen || sourceOverlayOpen || ebPlusSetupOpen
            ? " is-hidden"
            : ""
        }`}
        hidden={
          claimsOpen || scanPayOpen || sourceOverlayOpen || ebPlusSetupOpen
        }
        variant={
          persona.access.products.plusPay &&
          (!persona.access.products.ebPlus || plusPayMode)
            ? "pluspay"
            : "benefits"
        }
        onBenefits={openClaims}
        onScanPay={openScanPay}
      />

      <EbHomeWalkthrough
        frameRef={frameRef}
        ready={frameReady}
        enabled={
          persona.id === "new_user" &&
          !plusPayMode &&
          !claimsOpen &&
          !scanPayOpen &&
          !sourceOverlayOpen &&
          !ebPlusSetupOpen &&
          !cardMpinIntent
        }
        hasBenefitsUpiId={persona.hasBenefitsUpiId}
      />

      {claimsOpen ? (
        <section
          className="employee-benefits-claims"
          role="dialog"
          aria-modal="true"
          aria-label="Benefits Assistant"
        >
          <ChatShell onClose={closeClaims} />
        </section>
      ) : null}

      <ScanPayFlow
        open={scanPayOpen}
        scenario={scanPayScenario}
        mode={plusPayMode ? "pluspay" : "benefits"}
        merchantType={scanPayMerchantType}
        onClose={closeScanPay}
      />

      {cardMpinIntent ? (
        <section
          className="employee-benefits-mpin-verification"
          role="dialog"
          aria-modal="true"
          aria-label="Verify MPIN"
        >
          <MpinLockScreen
            key={cardMpinIntent}
            onUnlock={completeCardMpin}
            onCancel={closeCardMpin}
          />
        </section>
      ) : null}

      {ebPlusSetupOpen ? (
        <section
          ref={ebPlusSetupRef}
          className="employee-benefits-eb-plus-activation"
          role="dialog"
          aria-modal="true"
          aria-label="Complete your EB+ setup"
        >
            <OnboardingShell
              journey="eb-plus-activation"
              onExit={closeEbPlusSetup}
              onComplete={completeEbPlusSetup}
            />
        </section>
      ) : null}
    </main>
  );
}
