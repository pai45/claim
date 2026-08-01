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
      "Here's what your claims dashboard typically shows:\n\n- Pending claims and their status\n- Approved reimbursements\n- Remaining tax-benefit limits\n\nAsk me about a specific claim, or say \"track claim\" to look one up.",
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
      "Your tax-benefit policy usually covers eligible reimbursements such as medical bills, fuel, and vehicle-related expenses (subject to your plan).\n\nTell me the expense type and I'll check typical eligibility and documents needed.",
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
      "I can help you review claim history.\n\nShare a claim ID, date range, or status (pending / approved / rejected), and I'll walk you through what to look for and next steps.",
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
      "Happy to help track a claim.\n\nPlease share your claim ID or the approximate submission date. Typical statuses are Submitted -> Under review -> Approved / Needs info -> Paid.",
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
      "Let's register your vehicle for tax benefits.\n\nYou'll typically need:\n- Vehicle registration number\n- Owner name as on RC\n- Fuel type and purchase year\n\nReply with your registration number to begin, or say \"what documents do I need?\"",
  },
  {
    id: "merchant_locator",
    keywords: [
      "merchant locator",
      "merchant",
      "petrol pump",
      "fuel station",
      "gas station",
      "meal merchant",
      "meal benefit",
      "fuel benefit",
      "allowed merchant",
      "find merchant",
      "nearest merchant",
    ],
    reply:
      "I can check if a merchant is allowed for meal or fuel benefits.\n\nFirst, choose Fuel or Meal merchant below.",
  },
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening", "help"],
    reply:
      "Hi! I'm your Claims Assistant. I can help with uploading bills, tracking claims, viewing policy details, merchant locator, and vehicle registration for tax benefits.\n\nWhat would you like to do?",
  },
];

export const FALLBACK_REPLY: AssistantIntent = {
  id: "fallback",
  keywords: [],
  reply:
    'I can help with reimbursements, claim tracking, policy questions, merchant locator, and vehicle registration for tax benefits.\n\nTry one of the quick actions, or ask something like "upload a bill" or "track my claim".',
};
