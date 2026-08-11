import type { WalkthroughStep } from "./types";

/**
 * Single source of truth for walkthrough copy. The EB+ steps point at elements
 * inside the iframe document, but only their `key` crosses that boundary — the
 * text is always rendered by the host, so it stays authored here.
 */

const WALLET_CARD_STEP: WalkthroughStep = {
  key: "wallet-card",
  eyebrow: "Your card",
  title: "One card, all your benefits",
  body: "Everything Infosys funds for you sits on a single RuPay card. Tap the balance to see the card itself.",
};

const UPI_CREATE_STEP: WalkthroughStep = {
  key: "upi-create",
  eyebrow: "Payments",
  title: "Link it to UPI",
  body: "Create a UPI ID and your benefits work at any QR code in the country, not just card machines.",
};

const UPI_SCAN_STEP: WalkthroughStep = {
  key: "upi-scan",
  eyebrow: "Pay",
  title: "Scan anything",
  body: "Point the camera at any UPI QR code. The right wallet is picked for you based on the merchant.",
};

const UPI_ID_STEP: WalkthroughStep = {
  key: "upi-id",
  eyebrow: "Your UPI ID",
  title: "Your handle",
  body: "Share this to receive money, or open it to manage limits and linked accounts.",
};

const WALLETS_STEP: WalkthroughStep = {
  key: "wallets",
  eyebrow: "Wallets",
  title: "Four wallets, four rules",
  body: "Meal, Fuel, Reimbursement and Mobile are funded separately, and each one only spends where it is meant to.",
};

const QUICK_ACTIONS_STEP: WalkthroughStep = {
  key: "quick-actions",
  eyebrow: "Controls",
  title: "Manage it yourself",
  body: "Set a PIN, order a physical card, or see where the money went — without leaving this screen.",
};

/**
 * Before a UPI ID exists the panel holds a single Create CTA. Creating one
 * reflows it into Scan + UPI ID, so the run grows from four steps to five.
 */
export function getEbHomeSteps(upiCreated: boolean): WalkthroughStep[] {
  return [
    WALLET_CARD_STEP,
    ...(upiCreated ? [UPI_SCAN_STEP, UPI_ID_STEP] : [UPI_CREATE_STEP]),
    WALLETS_STEP,
    QUICK_ACTIONS_STEP,
  ];
}

export const BENEFITS_ASSISTANT_STEPS: WalkthroughStep[] = [
  {
    key: "composer",
    eyebrow: "Ask",
    title: "Just type it",
    body: "Ask in plain English. Upload a bill, chase a claim, or find somewhere to spend your meal wallet.",
  },
  {
    key: "quick-chats",
    eyebrow: "Shortcuts",
    title: "Or start from here",
    body: "Common requests, one tap away. Swipe for more.",
  },
  {
    key: "recommended",
    eyebrow: "Suggested",
    title: "Things worth doing",
    body: "The assistant surfaces what is pending on your account. Right now, registering your vehicle for tax benefits.",
  },
  {
    key: "menu",
    eyebrow: "More",
    title: "Everything else",
    body: "Claims dashboard, policy details, and your full claim history live behind this menu.",
  },
];

/**
 * CSS selectors for the assistant's targets. Kept beside the copy so a step and
 * its anchor never drift apart. The EB+ steps have no equivalent map — their
 * `key` is matched against `data-walkthrough` inside the iframe.
 */
export const BENEFITS_ASSISTANT_SELECTORS: Record<string, string> = {
  composer: "[data-walkthrough='composer']",
  "quick-chats": "[data-walkthrough='quick-chats']",
  recommended: "[data-walkthrough='recommended']",
  menu: "#chat-header-menu-trigger",
};
