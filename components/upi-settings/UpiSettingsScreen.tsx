"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { withBasePath } from "@/lib/basePath";
import "./upiSettings.css";

type UpiTab = "benefits" | "pluspay";

const TAB_DETAILS: Record<
  UpiTab,
  { fullId: string; maskedId: string; label: string }
> = {
  benefits: {
    fullId: "9876543210_infosys@pinelabs",
    maskedId: "**********_infosys@pinelabs",
    label: "EB+ Benefits",
  },
  pluspay: {
    fullId: "vishal.sharma@pluspay",
    maskedId: "************@pluspay",
    label: "PlusPay ANQ",
  },
};

const SETTINGS = [
  {
    title: "Beneficiary Limits",
    description:
      "Set spending limits for specific UPI IDs to manage your expenses.",
    icon: "shield-plus.svg",
  },
  {
    title: "Beneficiary Count Limits",
    description: "Control the maximum number of beneficiaries allowed per wallet",
    icon: "users-group.svg",
  },
  {
    title: "Payment Limits",
    description: "Set daily and monthly limits for payments.",
    icon: "slash-circle.svg",
  },
] as const;

const asset = (name: string) =>
  withBasePath(`/assets/upi-settings/${name}`);

export function UpiSettingsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<UpiTab>(
    queryTab === "pluspay" ? "pluspay" : "benefits",
  );
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState("");
  const details = TAB_DETAILS[activeTab];

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function selectTab(tab: UpiTab) {
    setActiveTab(tab);
    setRevealed(false);
    setNotice("");
  }

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(details.fullId);
      setNotice("UPI ID copied");
    } catch {
      setNotice(`UPI ID: ${details.fullId}`);
    }
  }

  function goBack() {
    if (document.referrer.startsWith(window.location.origin)) {
      router.back();
      return;
    }
    window.location.assign(withBasePath("/"));
  }

  return (
    <div className="upi-settings-shell" data-active-tab={activeTab}>
      <ScreenHeader
        title="UPI Settings"
        onBack={goBack}
        className="upi-settings-header"
      />
      <nav className="upi-account-tabs" aria-label="UPI account" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "benefits"}
          className="upi-account-tab upi-benefits-tab"
          onClick={() => selectTab("benefits")}
        >
          <Image src={asset("eb-benefits.svg")} alt="" width={30} height={30} />
          <span>Benefits</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-label="PlusPay ANQ"
          aria-selected={activeTab === "pluspay"}
          className="upi-account-tab upi-pluspay-tab"
          onClick={() => selectTab("pluspay")}
        >
          <Image src={asset("anq.svg")} alt="" width={24} height={24} />
          <span>ANQ</span>
        </button>
      </nav>

      <main className="upi-settings-panel" aria-label={`${details.label} UPI settings`}>
        <section className="upi-id-card" aria-label="Active UPI ID">
          <div className="upi-id-copy">
            <strong>{revealed ? details.fullId : details.maskedId}</strong>
            <span>
              <i aria-hidden="true">✓</i>
              Active UPI ID
            </span>
          </div>
          <div className="upi-id-actions">
            <button
              type="button"
              aria-label={revealed ? "Hide UPI ID" : "Show UPI ID"}
              aria-pressed={revealed}
              onClick={() => setRevealed((value) => !value)}
            >
              <VisibilityIcon hidden={!revealed} />
            </button>
            <button type="button" aria-label="Copy UPI ID" onClick={copyUpiId}>
              <CopyIcon />
            </button>
          </div>
        </section>

        <div className="upi-settings-list">
          {SETTINGS.map((setting) => (
            <button
              type="button"
              className="upi-setting-card"
              key={setting.title}
              onClick={() => setNotice(`${setting.title} selected`)}
            >
              <span className="upi-setting-icon" aria-hidden="true">
                <Image src={asset(setting.icon)} alt="" width={24} height={24} />
              </span>
              <span className="upi-setting-copy">
                <strong>{setting.title}</strong>
                <span>{setting.description}</span>
              </span>
              <ChevronIcon />
            </button>
          ))}
        </div>

        <div className="upi-deactivate-area">
          <button
            type="button"
            className="upi-deactivate-button"
            onClick={() => setNotice("Deactivation is unavailable in this demo")}
          >
            Deactivate Default UPI ID
          </button>
        </div>
      </main>

      <footer className="upi-powered-by">
        <Image
          src={asset("powered-by-upi.png")}
          alt="Powered by UPI"
          width={49}
          height={25}
        />
      </footer>

      <p className={`upi-settings-notice${notice ? " is-visible" : ""}`} role="status">
        {notice}
      </p>
    </div>
  );
}

function VisibilityIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.4 12s3.5-6 9.6-6 9.6 6 9.6 6-3.5 6-9.6 6-9.6-6-9.6-6Z" />
      <circle cx="12" cy="12" r="2.7" />
      {hidden ? <path d="M3.2 3.2 20.8 20.8" /> : null}
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="5" width="12" height="15" rx="2.5" />
      <path d="M15.5 5V4.5A2.5 2.5 0 0 0 13 2H6.5A2.5 2.5 0 0 0 4 4.5V15a2.5 2.5 0 0 0 2.5 2.5H7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="upi-setting-chevron" viewBox="0 0 20 20" aria-hidden="true">
      <path d="m7.5 4.5 5 5-5 5" />
    </svg>
  );
}
