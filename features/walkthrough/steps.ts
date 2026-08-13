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
  eyebrow: "Scan & Pay",
  title: "Scan & Pay with benefits",
  body: "Scan any UPI QR code. EB+ automatically picks the eligible wallet for that merchant.",
};

const UPI_ID_STEP: WalkthroughStep = {
  key: "upi-id",
  eyebrow: "UPI ID created",
  title: "Your UPI ID is ready",
  body: "Share this handle to receive money, or open it to manage limits and linked accounts.",
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

const BENEFITS_NAV_STEP: WalkthroughStep = {
  key: "benefits-nav",
  eyebrow: "Benefits",
  title: "Meet your Benefits Assistant",
  body: "Tap Benefits to ask questions, upload bills, track claims, and find where each wallet can be used.",
};

/**
 * The five-step introduction keeps stable numbering around the Create UPI ID
 * action. Once setup completes, Scan & Pay and the created handle are appended
 * as steps six and seven while the now-hidden Create target is skipped.
 */
export function getEbHomeSteps(upiCreated: boolean): WalkthroughStep[] {
  return [
    WALLET_CARD_STEP,
    UPI_CREATE_STEP,
    WALLETS_STEP,
    QUICK_ACTIONS_STEP,
    BENEFITS_NAV_STEP,
    ...(upiCreated ? [UPI_SCAN_STEP, UPI_ID_STEP] : []),
  ];
}

/** Zero-based index of Scan & Pay in the seven-step post-UPI continuation. */
export const EB_HOME_POST_UPI_STEP_INDEX = 5;

/** EB+ targets rendered by the React host rather than the embedded home app. */
export const EB_HOME_HOST_SELECTORS: Record<string, string> = {
  "benefits-nav": "[data-walkthrough='benefits-nav']",
};

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
