"use client";

import type {
  PolicyAnswerPayload,
  StructuredPolicyCategory,
  StructuredPolicyFact,
} from "@/lib/assistant/policy";
import { StructuredAssistantBubble } from "@/components/chat/StructuredAssistantBubble";

type PolicyAnswerCardProps = {
  content: string;
  payload: PolicyAnswerPayload;
  reveal?: boolean;
  showAvatar?: boolean;
};

function FactList({
  label,
  facts,
}: {
  label: string;
  facts: StructuredPolicyFact[];
}) {
  if (facts.length === 0) return null;

  return (
    <dl className="overflow-hidden rounded-card border border-border-line" aria-label={`${label} details`}>
      {facts.map((fact, index) => (
        <div
          key={`${fact.label}-${fact.value}`}
          className={`flex items-start justify-between gap-3 px-3 py-3 ${
            index < facts.length - 1 ? "border-b border-border-soft" : ""
          }`}
        >
          <dt className="text-caption text-ink-secondary">{fact.label}</dt>
          <dd className="text-right text-body-sm font-bold text-pine">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CoverageList({ category }: { category: StructuredPolicyCategory }) {
  if (category.items.length === 0) return null;

  return (
    <ul className="overflow-hidden rounded-card border border-border-line" aria-label={`${category.label} covered expenses`}>
      {category.items.map((item, index) => (
        <li
          key={item}
          className={`flex items-center gap-3 px-3 py-3 text-body-sm font-bold text-pine ${
            index < category.items.length - 1 ? "border-b border-border-soft" : ""
          }`}
        >
          <span className="text-success" aria-hidden="true">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );

}

function ProcessTable({ category }: { category: StructuredPolicyCategory }) {
  if (category.steps.length === 0) return null;

  return (
    <ol className="overflow-hidden rounded-card border border-border-line" aria-label={`${category.label} claim process`}>
      {category.steps.map((step, index) => (
        <li
          key={`${step.title}-${index}`}
          className={`flex items-start gap-3 px-3 py-3 ${
            index < category.steps.length - 1 ? "border-b border-border-soft" : ""
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-surface-tint-strong text-caption font-bold text-pine-primary">
            {index + 1}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body-sm font-bold text-pine">{step.title}</span>
            <span className="text-caption text-ink-secondary">{step.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PolicyAnswerCard({
  content,
  payload,
  reveal = false,
  showAvatar = true,
}: PolicyAnswerCardProps) {
  const structured = payload.structured;
  if (!structured) return null;

  const actions = structured.categories.slice(0, 3).map((category) => ({
    href: `/policy-details/${category.id}/`,
    label: `View all ${category.label} details`,
  }));

  return (
    <StructuredAssistantBubble
      title={structured.title}
      summary={content}
      reveal={reveal}
      showAvatar={showAvatar}
      actions={actions}
    >
      <div className="flex flex-col gap-4">
        {structured.categories.map((category) => (
          <section key={category.id} className="flex flex-col gap-3">
            {structured.categories.length > 1 ? (
              <h3 className="type-field-label text-pine-primary">{category.label}</h3>
            ) : null}
            {category.description ? (
              <p className="type-body-secondary text-ink">{category.description}</p>
            ) : null}
            <FactList label={category.label} facts={category.facts} />
            <CoverageList category={category} />
            <ProcessTable category={category} />
            {category.note ? (
              <p className="rounded-control bg-surface-tint px-3 py-2.5 text-caption text-pine">
                {category.note}
              </p>
            ) : null}
          </section>
        ))}

        {structured.qualifier || structured.disclaimer ? (
          <aside className="border-t border-border-soft pt-3 text-caption italic text-ink-secondary">
            {[structured.qualifier, structured.disclaimer].filter(Boolean).join(" ")}
          </aside>
        ) : null}
      </div>
    </StructuredAssistantBubble>
  );
}
