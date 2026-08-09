"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { MpinLockScreen } from "@/components/mpin/MpinLockScreen";
import { ScanPayFlow } from "@/components/scan-pay/ScanPayFlow";
import { EbBottomNav } from "@/components/shared/EbBottomNav";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { resolveScanPayScenario } from "@/features/scan-pay/fixtures";
import type { ScanPayScenario } from "@/features/scan-pay/types";
import {
  WALLET_FILTER_OPTIONS,
  getRecentTransactionsByWallet,
  getTransactionItems,
} from "@/features/transactions/constants";
import type { EmployeeBenefitsPersonaPayload } from "@/features/persona/types";
import { withBasePath } from "@/lib/basePath";
import "./employeeBenefitsHost.css";

const CLAIMS_HASH = "#claims";
const SCAN_PAY_HASH = "#scan-pay";
const SCAN_PAY_SCENARIO_QUERY = "scanPayScenario";
const OPEN_TRANSACTIONS_MESSAGE = "employee-benefits:open-transactions";
const OPEN_WALLET_STATEMENT_MESSAGE = "employee-benefits:open-wallet-statement";
const OPEN_MANAGE_LIMITS_MESSAGE = "employee-benefits:open-manage-limits";
const OPEN_PROFILE_MESSAGE = "employee-benefits:open-profile";
const OPEN_SPEND_ANALYTICS_MESSAGE = "employee-benefits:open-spend-analytics";
const OPEN_TRANSACTION_DETAILS_MESSAGE = "employee-benefits:open-transaction-details";
const OPEN_UPI_SETTINGS_MESSAGE = "employee-benefits:open-upi-settings";
const OPEN_SEND_MONEY_MESSAGE = "employee-benefits:open-send-money";
const OPEN_BANK_TRANSFER_MESSAGE = "employee-benefits:open-bank-transfer";
const OPEN_SCAN_PAY_MESSAGE = "employee-benefits:open-scan-pay";
const OPEN_BENEFITS_MESSAGE = "employee-benefits:open-benefits-assistant";
const VERIFY_MPIN_MESSAGE = "employee-benefits:verify-mpin";
const MPIN_VERIFIED_MESSAGE = "employee-benefits:mpin-verified";
const MPIN_CANCELLED_MESSAGE = "employee-benefits:mpin-cancelled";
const MANAGE_CARDS_RETURN_QUERY = "returnTo";
const MANAGE_CARDS_RETURN_VALUE = "manage-cards";
type CardMpinIntent = "activate-card" | "set-card-pin";
type WalletStatementKey = "meal" | "fuel" | "misc" | "gift";

function isCardMpinIntent(value: unknown): value is CardMpinIntent {
  return value === "activate-card" || value === "set-card-pin";
}

function isWalletStatementKey(value: unknown): value is WalletStatementKey {
  return value === "meal" || value === "fuel" || value === "misc" || value === "gift";
}

/**
 * Body classes the source app sets while one of its full-screen surfaces
 * (wallet, card, manage cards, merchant directory, scan & pay) is open. Those
 * are not the home screen, so the shared nav has to step aside with them.
 */
const SOURCE_OVERLAY_CLASSES = ["is-overlay-open", "is-merchant-directory-open"];

export function EmployeeBenefitsHost() {
  const { persona } = useActivePersona();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const bodyObserverRef = useRef<MutationObserver | null>(null);
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [scanPayOpen, setScanPayOpen] = useState(false);
  const [scanPayScenario, setScanPayScenario] =
    useState<ScanPayScenario>("success");
  const [sourceOverlayOpen, setSourceOverlayOpen] = useState(false);
  const [plusPayMode, setPlusPayMode] = useState(
    persona.access.defaultProduct === "pluspay",
  );
  const [cardMpinIntent, setCardMpinIntent] = useState<CardMpinIntent | null>(
    null,
  );

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
    if (!persona.access.products.lens) return;
    setClaimsOpen(true);
    if (window.location.hash !== CLAIMS_HASH) {
      window.history.replaceState(null, "", CLAIMS_HASH);
    }
  }, [persona.access.products.lens]);

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

  const openTransactions = useCallback(() => {
    window.location.assign(withBasePath("/transactions/"));
  }, []);

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
          `/transaction-details/?id=${encodeURIComponent(transactionId)}`,
        ),
      );
    },
    [persona.id],
  );

  const openManageLimits = useCallback(() => {
    window.location.assign(withBasePath("/manage-limit/"));
  }, []);

  const openProfile = useCallback(() => {
    window.location.assign(withBasePath("/profile/"));
  }, []);

  const openUpiSettings = useCallback((tab: "benefits" | "pluspay") => {
    if (!persona.access.upiEnabled) return;
    if (tab === "benefits" && !persona.access.products.lens) return;
    if (tab === "pluspay" && !persona.access.products.plusPay) return;
    window.location.assign(withBasePath(`/upi-settings/?tab=${tab}`));
  }, [persona.access]);

  const openSendMoney = useCallback(() => {
    if (!persona.access.upiEnabled || !persona.access.products.plusPay) return;
    window.location.assign(withBasePath("/send-money/"));
  }, [persona.access]);

  const openBankTransfer = useCallback(() => {
    if (!persona.access.products.lens) return;
    window.location.assign(withBasePath("/bank-transfer/"));
  }, [persona.access.products.lens]);

  const openScanPay = useCallback(() => {
    if (!persona.access.upiEnabled) return;
    setClaimsOpen(false);
    setScanPayScenario(
      resolveScanPayScenario(
        new URLSearchParams(window.location.search).get(
          SCAN_PAY_SCENARIO_QUERY,
        ),
      ),
    );
    setScanPayOpen(true);
    if (window.location.hash.toLowerCase() !== SCAN_PAY_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${SCAN_PAY_HASH}`,
      );
    }
  }, [persona.access.upiEnabled]);

  const closeScanPay = useCallback(() => {
    setScanPayOpen(false);
    if (window.location.hash.toLowerCase() === SCAN_PAY_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  const connectClaimsBridge = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

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

    // Manage Limit is a standalone Next.js screen opened from this overlay.
    // Re-open the source overlay when the screen's Back button returns home,
    // then remove the one-time instruction from the URL.
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get(MANAGE_CARDS_RETURN_QUERY) ===
      MANAGE_CARDS_RETURN_VALUE
    ) {
      document.querySelector<HTMLElement>("[data-manage-cards-open]")?.click();
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
      access: persona.access,
      hasTransactions: persona.hasTransactions,
      hasUpiId: persona.hasUpiId,
    };
    const syncedTransactions = getTransactionItems(persona.id);
    const walletTransactions = Object.fromEntries(
      WALLET_FILTER_OPTIONS.map((wallet) => [
        wallet.id,
        getRecentTransactionsByWallet(syncedTransactions, wallet.id),
      ]),
    );
    frameRef.current?.contentWindow?.postMessage(
      { type: "employee-benefits:sync-persona", persona: payload },
      window.location.origin,
    );
    frameRef.current?.contentWindow?.postMessage(
      {
        type: "employee-benefits:sync-transactions",
        transactions: syncedTransactions,
        walletTransactions,
      },
      window.location.origin,
    );
  }, [persona]);

  useEffect(() => () => bodyObserverRef.current?.disconnect(), []);

  useEffect(() => {
    // Only picks up hashes the browser navigates to. The App Router changes the
    // URL through the history API, which fires neither of these — screens that
    // are already mounted have to call `openClaims` directly.
    const syncHash = () => {
      const hash = window.location.hash.toLowerCase();
      setClaimsOpen(
        persona.access.products.lens &&
          hash === CLAIMS_HASH,
      );
      const shouldOpenScanPay =
        persona.access.upiEnabled && hash === SCAN_PAY_HASH;
      setScanPayOpen(shouldOpenScanPay);
      if (shouldOpenScanPay) {
        setScanPayScenario(
          resolveScanPayScenario(
            new URLSearchParams(window.location.search).get(
              SCAN_PAY_SCENARIO_QUERY,
            ),
          ),
        );
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
      if (event.data?.type === OPEN_TRANSACTIONS_MESSAGE) {
        openTransactions();
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
        openSendMoney();
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
    openClaims,
    openManageLimits,
    openProfile,
    openBankTransfer,
    openScanPay,
    openSpendAnalytics,
    openTransactionDetails,
    openSendMoney,
    openTransactions,
    openWalletStatement,
    openUpiSettings,
    persona.access.products.lens,
    persona.access.upiEnabled,
  ]);

  return (
    <main className="employee-benefits-host">
      <iframe
        ref={frameRef}
        className="employee-benefits-source"
        src={`${withBasePath("/employee-benefits/index.html")}?v=home-revamp-v1`}
        title="Employee Benefits"
        onLoad={connectClaimsBridge}
      />

      <EbBottomNav
        active="home"
        className={`employee-benefits-shared-nav${
          claimsOpen || scanPayOpen || sourceOverlayOpen ? " is-hidden" : ""
        }`}
        hidden={claimsOpen || scanPayOpen || sourceOverlayOpen}
        variant={
          persona.access.products.plusPay &&
          (!persona.access.products.lens || plusPayMode)
            ? "pluspay"
            : "benefits"
        }
        onBenefits={openClaims}
        onScanPay={openScanPay}
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
    </main>
  );
}
