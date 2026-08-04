export type AssistantIntent = {
  id: string;
  keywords: string[];
  reply: string;
};

/**
 * Editable generic replies for the in-app assistant.
 * Update this file to change what the bot says - no UI changes needed.
 */
export const ASSISTANT_INTENTS: AssistantIntent[] = [
  {
    id: "upload_bill",
    keywords: [
      "upload bill",
      "upload",
      "bill",
      "receipt",
      "invoice",
      "reimbursement",
      "submit bill",
    ],
    reply: "Sure. Upload a bill and I'll read it for you.",
  },
  {
    id: "view_dashboard",
    keywords: [
      "dashboard",
      "view dashboard",
      "overview",
      "summary",
      "balances",
      "limits",
    ],
    reply:
      "**Claims dashboard**\n\nHere's what it typically shows:\n\n- Pending claims and their status\n- Approved reimbursements\n- Remaining tax-benefit limits\n\nAsk me about a specific claim, or say **track claim** to look one up.",
  },
  {
    id: "view_policy",
    keywords: [
      "policy",
      "view policy",
      "coverage",
      "eligible",
      "eligibility",
      "what is covered",
      "benefits",
    ],
    reply:
      "**Policy coverage**\n\nPick a benefit below and I'll share limits, proof needed, and how claims work for that wallet.",
  },
  {
    id: "claim_history",
    keywords: [
      "claim history",
      "history",
      "past claims",
      "previous claims",
      "my claims",
    ],
    reply:
      "**Claim history**\n\nI can help you review past claims. Share one of these:\n\n- Claim ID\n- Date range\n- Status (pending / approved / rejected)\n\nThen I'll walk you through what to look for and next steps.",
  },
  {
    id: "track_claim",
    keywords: [
      "track claim",
      "track",
      "status",
      "where is my claim",
      "claim status",
      "follow up",
    ],
    reply:
      "**Track a claim**\n\nPlease share your claim ID or the approximate submission date.\n\nTypical statuses:\n\n1. Submitted\n2. Under review\n3. Approved / Needs info\n4. Paid",
  },
  {
    id: "vehicle_registration",
    keywords: [
      "vehicle registration",
      "register vehicle",
      "car registration",
      "tax benefits vehicle",
      "start registration",
      "vehicle",
      "car",
    ],
    reply:
      "**Vehicle registration**\n\nEnter your vehicle number below and I'll pull up the details.\n\nYou can review them and send the registration to HR for approval.",
  },
  {
    id: "merchant_locator",
    keywords: [
      "merchant locator",
      "meals merchant",
      "merchant",
      "meal merchant",
      "meal benefit",
      "allowed merchant",
      "find merchant",
      "nearest merchant",
    ],
    reply:
      "**Meals merchant**\n\nType a merchant name or choose **Find near you**.",
  },
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening", "help"],
    reply:
      "**Hi!** I'm your Benefits Assistant.\n\nI can help with:\n\n- Uploading bills\n- Tracking claims\n- Policy details\n- Meals merchants\n- Vehicle registration for tax benefits\n\nWhat would you like to do?",
  },
];

export const FALLBACK_REPLY: AssistantIntent = {
  id: "fallback",
  keywords: [],
  reply:
    "**How I can help**\n\n- Reimbursements\n- Claim tracking\n- Policy questions\n- Meals merchants\n- Vehicle registration for tax benefits\n\nTry one of the quick actions, or ask something like **upload a bill** or **track my claim**.",
};
