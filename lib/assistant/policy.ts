import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  getPolicyCategory,
  type PolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import type { AssistantTurn } from "./assistantApiTypes";

const POLICY_QUESTION_TERMS = [
  "benefit",
  "benefits",
  "policy",
  "covered",
  "cover",
  "coverage",
  "eligible",
  "eligibility",
  "limit",
  "proof",
  "invoice",
  "receipt",
  "document",
  "documents",
  "deadline",
  "submit",
  "submission",
  "claim",
  "claims",
  "tax",
  "saving",
  "savings",
  "expense",
  "expenses",
  "reimbursement",
  "frequency",
  "monthly",
  "annual",
  "about",
  "tell me",
  "process",
  "steps",
  "how",
  "what",
  "when",
  "why",
] as const;

const POLICY_FOLLOW_UP_TERMS = [
  "benefit",
  "benefits",
  "covered",
  "cover",
  "coverage",
  "eligible",
  "eligibility",
  "limit",
  "proof",
  "invoice",
  "receipt",
  "document",
  "documents",
  "deadline",
  "submit",
  "submission",
  "tax",
  "saving",
  "savings",
  "frequency",
  "monthly",
  "annual",
  "process",
  "steps",
  "how",
] as const;

const EXPLICIT_ACTION_PHRASES = [
  "upload bill",
  "upload a bill",
  "upload bills",
  "submit bill",
  "submit a bill",
  "scan bill",
  "scan a bill",
  "upload receipt",
  "upload invoice",
  "submit receipt",
  "claim another bill",
  "claim a bill",
  "track claim",
  "claim status",
  "claim history",
  "view dashboard",
  "merchant locator",
  "find merchant",
  "nearest merchant",
  "allowed merchant",
  "register vehicle",
  "register my vehicle",
  "register car",
  "register my car",
  "add vehicle",
  "vehicle registration",
  "start registration",
  "register driver",
  "register my driver",
  "driver registration",
  "add driver",
  "add my driver",
  "enroll driver",
] as const;

/**
 * A question can now name more than one benefit — "compare meal and fuel"
 * resolves to both categories instead of being refused as ambiguous.
 */
export type PolicyQuestionResolution = {
  type: "match";
  categories: PolicyCategory[];
};

export type PolicyAnswerView =
  | "overview"
  | "proof"
  | "deadline"
  | "coverage"
  | "process"
  | "comparison"
  | "tax";

export type StructuredPolicyFact = {
  label: string;
  value: string;
};

export type StructuredPolicyCategory = {
  id: PolicyTabId;
  label: string;
  description?: string;
  facts: StructuredPolicyFact[];
  items: string[];
  steps: Array<{ title: string; detail: string }>;
  note?: string;
};

export type StructuredPolicyAnswer = {
  view: PolicyAnswerView;
  title: string;
  categories: StructuredPolicyCategory[];
  qualifier?: string;
  disclaimer?: string;
};

export type PolicyAnswerPayload = {
  /** Primary category drives backward-compatible single-detail navigation. */
  categoryId: PolicyTabId;
  categoryIds?: PolicyTabId[];
  /** Optional so saved v2 transcripts continue to load without migration. */
  structured?: StructuredPolicyAnswer;
};

type PolicyInput = PolicyCategory | PolicyCategory[];

function asCategories(policy: PolicyInput): PolicyCategory[] {
  return Array.isArray(policy) ? policy : [policy];
}

export function normalizeAssistantText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesPhrase(message: string, phrase: string): boolean {
  const normalizedPhrase = normalizeAssistantText(phrase);
  if (!normalizedPhrase) return false;

  return (` ${message} `).includes(` ${normalizedPhrase} `);
}

export function isExplicitAssistantAction(message: string): boolean {
  const normalized = normalizeAssistantText(message);
  return (
    EXPLICIT_ACTION_PHRASES.some((phrase) =>
      includesPhrase(normalized, phrase),
    ) ||
    (/\b(upload|scan|submit|attach)\b/.test(normalized) &&
      /\b(bill|bills|receipt|receipts|invoice|invoices|document|documents)\b/.test(normalized)) ||
    (/\b(track|status)\b/.test(normalized) &&
      /\bclaims?\b/.test(normalized)) ||
    (/\b(find|nearest|search|allowed)\b/.test(normalized) &&
      /\b(merchant|merchants|station|pump|restaurant)\b/.test(normalized)) ||
    (/\b(register|registration|add|enroll)\b/.test(normalized) &&
      /\b(vehicle|car|bike|automobile)\b/.test(normalized)) ||
    (/\b(register|registration|add|enroll)\b/.test(normalized) &&
      /\b(driver|chauffeur)\b/.test(normalized))
  );
}

function containsPolicyQuestionTerm(message: string): boolean {
  return POLICY_QUESTION_TERMS.some((term) => includesPhrase(message, term));
}

function containsPolicyFollowUpTerm(message: string): boolean {
  return POLICY_FOLLOW_UP_TERMS.some((term) => includesPhrase(message, term));
}

export function resolvePolicyQuestion(
  message: string,
  activeCategoryId?: PolicyTabId | null,
): PolicyQuestionResolution | null {
  const normalized = normalizeAssistantText(message);
  if (!normalized || isExplicitAssistantAction(normalized)) return null;

  const matches = EMPLOYER_BENEFITS_CATALOG.benefits.filter((category) =>
    category.aliases.some((alias) => includesPhrase(normalized, alias)),
  );

  if (matches.length > 0) {
    const isDirectCategoryRequest = matches.some(
      (category) =>
        category.aliases.some(
          (alias) => normalizeAssistantText(alias) === normalized,
        ) || normalizeAssistantText(category.tabLabel) === normalized,
    );
    if (isDirectCategoryRequest || containsPolicyQuestionTerm(normalized)) {
      return { type: "match", categories: matches };
    }
  }

  if (activeCategoryId && containsPolicyFollowUpTerm(normalized)) {
    return {
      type: "match",
      categories: [getPolicyCategory(activeCategoryId)],
    };
  }

  return null;
}

function findBenefit(policy: PolicyCategory, pattern: RegExp) {
  return policy.benefits.find((benefit) => pattern.test(benefit.title));
}

function relevantDeadline(policy: PolicyCategory): string | undefined {
  return policy.notes.find((note) =>
    /submit|before|deadline|window|next month|subsequent month/i.test(note),
  );
}

function resolvePolicyAnswerView(
  question: string,
  categories: PolicyCategory[],
): PolicyAnswerView {
  if (categories.length > 1) return "comparison";

  const normalized = normalizeAssistantText(question);
  if (/covered|cover|coverage|eligible|eligibility/.test(normalized)) {
    return "coverage";
  }
  if (/proof|invoice|receipt|document/.test(normalized)) return "proof";
  if (/deadline|submit|submission|when/.test(normalized)) return "deadline";
  if (/how|step|process/.test(normalized)) return "process";
  if (/tax|saving|savings/.test(normalized)) return "tax";
  return "overview";
}

export function buildStructuredPolicyAnswer(
  question: string,
  categories: PolicyCategory[],
): StructuredPolicyAnswer {
  const view = resolvePolicyAnswerView(question, categories);
  const structuredCategories = categories.map((policy) => {
    const employerBenefit = getEmployerBenefit(policy.id);
    const limit = findBenefit(policy, /limit/i);
    const proof = findBenefit(policy, /proof/i);
    const frequency = findBenefit(policy, /frequency/i);
    const tax = findBenefit(policy, /tax/i);
    const deadline = relevantDeadline(policy);

    let facts: StructuredPolicyFact[] = [];
    let items: string[] = [];
    let steps: Array<{ title: string; detail: string }> = [];
    let description: string | undefined;
    let note: string | undefined;

    if (view === "coverage") {
      items = policy.covered ?? [];
      description = items.length === 0 ? policy.description : undefined;
      note = policy.notes[0];
    } else if (view === "proof") {
      facts = [
        {
          label: "Proof required",
          value: proof?.detail ?? employerBenefit.claimRules.proofRequired,
        },
      ];
      note = deadline ?? policy.notes[0];
    } else if (view === "deadline") {
      facts = [
        ...(deadline
          ? [{ label: "Submission deadline", value: deadline }]
          : []),
        ...(frequency
          ? [{ label: frequency.title, value: frequency.detail }]
          : []),
      ];
      if (facts.length === 0) {
        note = "The policy does not specify a separate submission deadline.";
      }
    } else if (view === "process") {
      steps = policy.steps;
    } else if (view === "tax") {
      facts = tax ? [{ label: tax.title, value: tax.detail }] : [];
    } else if (view === "comparison") {
      facts = [
        ...(limit ? [{ label: limit.title, value: limit.detail }] : []),
        ...(frequency
          ? [{ label: frequency.title, value: frequency.detail }]
          : []),
        {
          label: "Proof required",
          value: employerBenefit.claimRules.proofRequired,
        },
      ];
    } else {
      description = policy.description;
      facts = [tax, limit, proof, frequency]
        .filter((benefit): benefit is NonNullable<typeof benefit> =>
          Boolean(benefit),
        )
        .map((benefit) => ({
          label: benefit.title,
          value: benefit.detail,
        }));
      note = deadline ?? policy.notes[0];
    }

    return {
      id: policy.id,
      label: policy.tabLabel,
      description,
      facts,
      items,
      steps,
      note,
    };
  });

  const primary = categories[0];
  const title =
    view === "comparison"
      ? `Comparing ${categories.map((category) => category.tabLabel).join(" and ")}`
      : view === "coverage"
        ? `${primary.tabLabel} coverage`
        : view === "proof"
          ? `${primary.tabLabel} proof required`
          : view === "deadline"
            ? `${primary.tabLabel} deadline`
            : view === "process"
              ? `How ${primary.tabLabel} works`
              : view === "tax"
                ? `${primary.tabLabel} tax treatment`
                : primary.tabLabel;
  const taxTreatment = getEmployerBenefit(primary.id).taxTreatment;
  const includeTaxDisclaimer =
    view === "overview" || view === "comparison" || view === "tax";

  return {
    view,
    title,
    categories: structuredCategories,
    qualifier: includeTaxDisclaimer ? taxTreatment.qualifier : undefined,
    disclaimer: includeTaxDisclaimer ? taxTreatment.disclaimer : undefined,
  };
}

export function createPolicyLeadSummary(
  structured: StructuredPolicyAnswer,
): string {
  switch (structured.view) {
    case "comparison":
      return "Here is a side-by-side view of the policy details you asked about.";
    case "coverage":
      return "These are the expenses currently listed as covered by the policy.";
    case "proof":
      return "Here are the documents required for this benefit claim.";
    case "deadline":
      return "Here are the current submission timing and frequency requirements.";
    case "process":
      return "This is the claim process from setup through payroll review.";
    case "tax":
      return "Here is the qualified tax treatment stated in your employer policy.";
    case "overview":
      return "Here are the key benefit, limit, proof, and frequency details.";
  }
}

export function policyPayloadForAnswer(
  question: string,
  categories: PolicyCategory[],
  structured: StructuredPolicyAnswer = buildStructuredPolicyAnswer(
    question,
    categories,
  ),
): PolicyAnswerPayload {
  const categoryIds = categories.map((category) => category.id);
  return {
    categoryId: categoryIds[0],
    categoryIds,
    structured,
  };
}

function summarizeOneCategory(
  question: string,
  policy: PolicyCategory,
): string {
  const normalized = normalizeAssistantText(question);
  const limit = findBenefit(policy, /limit/i);
  const proof = findBenefit(policy, /proof/i);
  const frequency = findBenefit(policy, /frequency/i);
  const tax = findBenefit(policy, /tax/i);
  const deadline = relevantDeadline(policy);
  const taxTreatment = getEmployerBenefit(policy.id).taxTreatment;

  if (/covered|cover|coverage|eligible|eligibility/.test(normalized)) {
    if (policy.covered?.length) {
      const covered = policy.covered.map((item) => `- ${item}`).join("\n");
      return `**${policy.tabLabel} coverage**\n\n${covered}\n\n${policy.notes[0]}`;
    }

    return `**${policy.tabLabel}**\n\n${policy.description}\n\n${policy.notes[0]}`;
  }

  if (/proof|invoice|receipt|document/.test(normalized)) {
    const proofDetail =
      proof?.detail ??
      policy.notes.find((note) => /invoice|receipt|proof|licence/i.test(note));
    return proofDetail
      ? `**${policy.tabLabel} proof required**\n\n- ${proofDetail.replace(/\.$/, "")}\n\n${deadline ?? policy.notes[0]}`
      : `**${policy.tabLabel}**\n\nThe policy does not specify a separate proof requirement.\n\n${policy.notes[0]}`;
  }

  if (/deadline|submit|submission|when/.test(normalized) && deadline) {
    const lines = [`**${policy.tabLabel} deadline**`, "", `- ${deadline}`];
    if (frequency) {
      lines.push(`- **${frequency.title}:** ${frequency.detail}`);
    }
    return lines.join("\n");
  }

  if (/how|step|process/.test(normalized)) {
    const steps = policy.steps
      .map((step, index) => `${index + 1}. **${step.title}** — ${step.detail}`)
      .join("\n");
    return `**How ${policy.tabLabel} works**\n\n${steps}`;
  }

  const highlights = [tax, limit, proof, frequency]
    .filter((benefit): benefit is NonNullable<typeof benefit> => Boolean(benefit))
    .map((benefit) => `- **${benefit.title}:** ${benefit.detail}`);
  const importantNote = deadline ?? policy.notes[0];

  return `**${policy.tabLabel}**\n\n${policy.description}\n\n${highlights.join("\n")}\n\n${importantNote}\n\n_${taxTreatment.qualifier} ${taxTreatment.disclaimer}_`;
}

/** Side-by-side facts when a question names more than one benefit. */
function compareCategories(policies: PolicyCategory[]): string {
  const rows = policies.map((policy) => {
    const benefit = getEmployerBenefit(policy.id);
    const limit = findBenefit(policy, /limit/i);
    const frequency = findBenefit(policy, /frequency/i);
    const parts = [
      limit ? `${limit.title.toLowerCase()} ${limit.detail}` : undefined,
      frequency ? frequency.detail.toLowerCase() : undefined,
      benefit.claimRules.proofRequired,
    ].filter(Boolean);
    return `- **${policy.tabLabel}:** ${parts.join(" · ")}`;
  });

  return `**Comparing ${policies.map((policy) => policy.tabLabel).join(" and ")}**\n\n${rows.join("\n")}\n\n_${getEmployerBenefit(policies[0].id).taxTreatment.qualifier} ${getEmployerBenefit(policies[0].id).taxTreatment.disclaimer}_`;
}

export function createPolicyFallbackSummary(
  question: string,
  policy: PolicyInput,
): string {
  const categories = asCategories(policy);
  if (categories.length > 1) return compareCategories(categories);
  return summarizeOneCategory(question, categories[0]);
}

function numericFacts(value: string): string[] {
  return Array.from(
    value.matchAll(/\d[\d,]*(?:\.\d+)?(?:\(\d+\))?%?(?:st|nd|rd|th)?/gi),
    (match) => match[0].toLowerCase().replaceAll(",", ""),
  );
}

export type GroundingCheck = {
  grounded: boolean;
  offendingFacts: string[];
  reason?: "empty" | "too_long" | "ungrounded";
};

/** Reports which facts failed so a discarded answer is diagnosable. */
export function checkPolicyGrounding(
  answer: string,
  policy: PolicyInput,
): GroundingCheck {
  const trimmed = answer.trim();
  if (!trimmed) return { grounded: false, offendingFacts: [], reason: "empty" };
  if (trimmed.length > 1600) {
    return { grounded: false, offendingFacts: [], reason: "too_long" };
  }

  const source = JSON.stringify(asCategories(policy));
  const allowedFacts = new Set(numericFacts(source));
  const offendingFacts = numericFacts(trimmed).filter(
    (fact) => !allowedFacts.has(fact),
  );

  return {
    grounded: offendingFacts.length === 0,
    offendingFacts,
    reason: offendingFacts.length === 0 ? undefined : "ungrounded",
  };
}

export function isGroundedPolicyAnswer(
  answer: string,
  policy: PolicyInput,
): boolean {
  return checkPolicyGrounding(answer, policy).grounded;
}

export function createPolicyPrompt(
  question: string,
  policy: PolicyInput,
  history: AssistantTurn[] = [],
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const categories = asCategories(policy);
  const multi = categories.length > 1;

  return [
    {
      role: "system",
      content:
        "You are a policy assistant. Answer only with facts present in the supplied policy JSON. Each entry also carries `balance` (allocation, utilized, available for this employee), `claimRules` (proofRequired, submissionDeadlineDay, requiredFields), and `taxTreatment` — use them when the question is about remaining balance, proof, or deadlines. Do not use outside knowledge, infer legal or tax advice, invent limits, dates, eligibility, or coverage, and do not produce a CTA. Every number you write must already appear in the JSON — never add, subtract, or convert amounts yourself. Never turn conditional tax language into a guarantee, percentage saving, exemption, or tax-free claim. Preserve the supplied qualifier and disclaimer whenever tax treatment is discussed. If the policy does not contain the answer, say that it does not specify it." +
        (multi
          ? " The JSON is an array of benefits: cover each one the question names, keeping them clearly separated."
          : "") +
        " The app renders all policy facts in a structured card, so return only one or two short plain-text summary sentences. Do not use headings, markdown, bullets, tables, or a CTA. Keep the summary under 40 words and respond in the user's language.",
    },
    ...history,
    {
      role: "user",
      content: `Question: ${question}\n\nPolicy JSON:\n${JSON.stringify(
        multi ? categories : categories[0],
      )}`,
    },
  ];
}
