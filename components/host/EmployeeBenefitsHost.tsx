"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { EbBottomNav } from "@/components/shared/EbBottomNav";
import { withBasePath } from "@/lib/basePath";
import "./employeeBenefitsHost.css";

const CLAIMS_HASH = "#claims";
const OPEN_TRANSACTIONS_MESSAGE = "employee-benefits:open-transactions";
const OPEN_MANAGE_LIMITS_MESSAGE = "employee-benefits:open-manage-limits";
const OPEN_PROFILE_MESSAGE = "employee-benefits:open-profile";
const OPEN_BENEFITS_MESSAGE = "employee-benefits:open-benefits-assistant";

/**
 * Body classes the source app sets while one of its full-screen surfaces
 * (wallet, card, manage cards, merchant directory, scan & pay) is open. Those
 * are not the home screen, so the shared nav has to step aside with them.
 */
const SOURCE_OVERLAY_CLASSES = ["is-overlay-open", "is-merchant-directory-open"];

export function EmployeeBenefitsHost() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const bodyObserverRef = useRef<MutationObserver | null>(null);
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [sourceOverlayOpen, setSourceOverlayOpen] = useState(false);

  const openClaims = useCallback(() => {
    setClaimsOpen(true);
    if (window.location.hash !== CLAIMS_HASH) {
      window.history.replaceState(null, "", CLAIMS_HASH);
    }
  }, []);

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

  const openManageLimits = useCallback(() => {
    window.location.assign(withBasePath("/manage-limit/"));
  }, []);

  const openProfile = useCallback(() => {
    window.location.assign(withBasePath("/profile/"));
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
    const syncNavVisibility = () => {
      setSourceOverlayOpen(
        SOURCE_OVERLAY_CLASSES.some((name) =>
          document.body.classList.contains(name),
        ),
      );
    };

    bodyObserverRef.current?.disconnect();
    const observer = new MutationObserver(syncNavVisibility);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    bodyObserverRef.current = observer;
    syncNavVisibility();
  }, []);

  useEffect(() => () => bodyObserverRef.current?.disconnect(), []);

  useEffect(() => {
    // Only picks up hashes the browser navigates to. The App Router changes the
    // URL through the history API, which fires neither of these — screens that
    // are already mounted have to call `openClaims` directly.
    const syncHash = () => {
      setClaimsOpen(window.location.hash.toLowerCase() === CLAIMS_HASH);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && claimsOpen) closeClaims();
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
      if (event.data?.type === OPEN_MANAGE_LIMITS_MESSAGE) {
        openManageLimits();
        return;
      }
      if (event.data?.type === OPEN_PROFILE_MESSAGE) {
        openProfile();
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
    closeClaims,
    openClaims,
    openManageLimits,
    openProfile,
    openTransactions,
  ]);

  return (
    <main className="employee-benefits-host">
      <iframe
        ref={frameRef}
        className="employee-benefits-source"
        src={`${withBasePath("/employee-benefits/index.html")}?v=pluspay-brand-v1`}
        title="Employee Benefits"
        onLoad={connectClaimsBridge}
      />

      <EbBottomNav
        active="home"
        className={`employee-benefits-shared-nav${
          claimsOpen || sourceOverlayOpen ? " is-hidden" : ""
        }`}
        hidden={claimsOpen || sourceOverlayOpen}
        onBenefits={openClaims}
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
    </main>
  );
}
