import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  getPolicyCategory,
  type PolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";

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
  "submit bill",
  "scan bill",
  "track claim",
  "claim status",
  "claim history",
  "view dashboard",
  "merchant locator",
  "find merchant",
  "nearest merchant",
  "allowed merchant",
  "register vehicle",
  "vehicle registration",
  "start registration",
] as const;

export type PolicyQuestionResolution =
  | { type: "match"; category: PolicyCategory }
  | { type: "ambiguous"; categories: PolicyCategory[] };

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
    (/\b(upload|scan)\b/.test(normalized) &&
      /\b(bill|receipt|invoice|document)\b/.test(normalized)) ||
    (/\b(track|status)\b/.test(normalized) &&
      /\bclaim\b/.test(normalized)) ||
    (/\b(find|nearest|search|allowed)\b/.test(normalized) &&
      /\b(merchant|station|pump|restaurant)\b/.test(normalized)) ||
    (/\b(register|registration)\b/.test(normalized) &&
      /\b(vehicle|car)\b/.test(normalized))
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

  if (matches.length > 1) {
    return { type: "ambiguous", categories: matches };
  }

  if (matches.length === 1) {
    const isDirectCategoryRequest =
      matches[0].aliases.some(
        (alias) => normalizeAssistantText(alias) === normalized,
      ) ||
      normalizeAssistantText(matches[0].tabLabel) === normalized;
    if (isDirectCategoryRequest || containsPolicyQuestionTerm(normalized)) {
      return { type: "match", category: matches[0] };
    }
  }

  if (activeCategoryId && containsPolicyFollowUpTerm(normalized)) {
    return { type: "match", category: getPolicyCategory(activeCategoryId) };
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

export function createPolicyFallbackSummary(
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

function numericFacts(value: string): string[] {
  return Array.from(
    value.matchAll(/\d[\d,]*(?:\.\d+)?(?:\(\d+\))?%?(?:st|nd|rd|th)?/gi),
    (match) => match[0].toLowerCase().replaceAll(",", ""),
  );
}

export function isGroundedPolicyAnswer(
  answer: string,
  policy: PolicyCategory,
): boolean {
  const trimmed = answer.trim();
  if (!trimmed || trimmed.length > 1600) return false;

  const source = JSON.stringify(policy);
  const allowedFacts = new Set(numericFacts(source));

  return numericFacts(trimmed).every((fact) => allowedFacts.has(fact));
}

export function createPolicyPrompt(
  question: string,
  policy: PolicyCategory,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content:
        "You are a policy assistant. Answer only with facts present in the supplied policy JSON. Do not use outside knowledge, infer legal or tax advice, invent limits, dates, eligibility, or coverage, and do not produce a CTA. Never turn conditional tax language into a guarantee, percentage saving, exemption, or tax-free claim. Preserve the supplied qualifier and disclaimer whenever tax treatment is discussed. If the policy does not contain the answer, say that it does not specify it. Format the reply like a helpful chat answer using short markdown: a bold title line, then short paragraphs and bullet lists for key facts (limits, proof, deadlines, steps). Keep it concise (about 80-160 words). Respond in the user's language.",
    },
    {
      role: "user",
      content: `Question: ${question}\n\nPolicy JSON:\n${JSON.stringify(policy)}`,
    },
  ];
}
