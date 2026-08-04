"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { withBasePath } from "@/lib/basePath";
import "./employeeBenefitsHost.css";

const CLAIMS_HASH = "#claims";
const OPEN_TRANSACTIONS_MESSAGE = "employee-benefits:open-transactions";
const OPEN_MANAGE_LIMITS_MESSAGE = "employee-benefits:open-manage-limits";
const OPEN_PROFILE_MESSAGE = "employee-benefits:open-profile";
const OPEN_BENEFITS_MESSAGE = "employee-benefits:open-benefits-assistant";

export function EmployeeBenefitsHost() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [claimsOpen, setClaimsOpen] = useState(false);

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

    // The source application's mock claims panel is never mounted. Its Claims
    // entry point is bridged to the real Benefits Assistant owned by Next.js.
    document.querySelector("[data-claims-assistant]")?.remove();
  }, []);

  useEffect(() => {
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
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("message", receiveHostBridge);
    const initialSyncFrame = window.requestAnimationFrame(syncHash);
    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      window.removeEventListener("hashchange", syncHash);
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
