import {
  getPolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import type { ChatMessage, QuickAction } from "@/features/chat/types";

const CLAIM_STATUSES = ["Pending", "Approved", "Rejected"] as const;

function action(
  id: string,
  label: string,
  intentId?: string,
  row?: number,
): QuickAction {
  return row === undefined
    ? { id, label, intentId }
    : { id, label, intentId, row };
}

function categoryLabel(categoryId?: PolicyTabId): string | undefined {
  return categoryId ? getPolicyCategory(categoryId).tabLabel : undefined;
}

function appDataCategoryId(message: ChatMessage): PolicyTabId | undefined {
  const payload = message.appDataAnswer;
  if (!payload) return undefined;
  if (payload.categoryId) return payload.categoryId;

  const structured = payload.structured;
  if (structured?.kind === "category_dashboard") {
    return structured.dashboard.categoryId;
  }
  if (structured?.kind === "claims_history") {
    return structured.filters.categoryId;
  }
  return undefined;
}

function policyActions(categoryId?: PolicyTabId): QuickAction[] {
  const benefit = categoryLabel(categoryId);
  if (!benefit) {
    return [
      action("policy-dashboard", "View dashboard", "view_dashboard"),
      action("policy-history", "View claim history", "claim_history"),
      action("policy-another", "Choose another policy", "view_policy"),
      action("policy-new-claim", "New claim", "upload_claim"),
    ];
  }

  return [
    action("policy-balance", `Check ${benefit} balance`, "view_dashboard"),
    action("policy-claims", `Show ${benefit} claims`, "claim_history"),
    action("policy-another", "Choose another policy", "view_policy"),
    action("policy-new-claim", "New claim", "upload_claim"),
  ];
}

function categoryDashboardActions(categoryId?: PolicyTabId): QuickAction[] {
  const benefit = categoryLabel(categoryId);
  if (!benefit) return dashboardActions();

  return [
    action("dashboard-claims", `Show ${benefit} claims`, "claim_history"),
    action("dashboard-policy", `Review ${benefit} policy`),
    action("dashboard-upload", "Upload a claim", "upload_claim"),
  ];
}

function dashboardActions(): QuickAction[] {
  return [
    action("dashboard-pending", "Pending claims", "claim_history"),
    action("dashboard-history", "View claim history", "claim_history"),
    action("dashboard-policy", "Check a policy", "view_policy"),
  ];
}

function claimsHistoryActions(message: ChatMessage): QuickAction[] {
  const structured = message.appDataAnswer?.structured;
  const filters =
    structured?.kind === "claims_history" ? structured.filters : undefined;
  const statusActions = CLAIM_STATUSES.filter(
    (status) => status !== filters?.status,
  )
    .slice(0, 2)
    .map((status) => {
      const statusLabel = status.toLowerCase();
      return action(
        `history-${statusLabel}`,
        status,
        "claim_history",
        0,
      );
    });

  return [
    ...statusActions,
    action("history-dashboard", "View dashboard", "view_dashboard", 1),
    action("history-new-claim", "New claim", "upload_claim", 1),
  ];
}

function individualClaimActions(): QuickAction[] {
  return [
    action("claim-history", "View claim history", "claim_history"),
    action("claim-dashboard", "View dashboard", "view_dashboard"),
    action("claim-policy", "Check a policy", "view_policy"),
    action("claim-new-claim", "New claim", "upload_claim"),
  ];
}

export function getContextualQuickChats(message: ChatMessage): QuickAction[] {
  if (message.role !== "assistant") return [];

  if (message.kind === "policy_answer" && message.policyAnswer) {
    return policyActions(message.policyAnswer.categoryId);
  }

  if (message.kind !== "app_data_answer" || !message.appDataAnswer) return [];

  if (message.appDataAnswer.target === "claim") {
    return individualClaimActions();
  }

  if (message.appDataAnswer.structured?.kind === "claims_history") {
    return claimsHistoryActions(message);
  }

  switch (message.appDataAnswer.target) {
    case "policy":
      return policyActions(appDataCategoryId(message));
    case "category_dashboard":
      return categoryDashboardActions(appDataCategoryId(message));
    case "dashboard":
      return dashboardActions();
    case "claims_history":
      return claimsHistoryActions(message);
    case "none":
      return [];
  }
}

export function trailingContextualQuickChats(
  messages: ChatMessage[],
): QuickAction[] {
  const trailingMessage = messages[messages.length - 1];
  return trailingMessage ? getContextualQuickChats(trailingMessage) : [];
}
