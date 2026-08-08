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
};

function FactTable({
  label,
  facts,
}: {
  label: string;
  facts: StructuredPolicyFact[];
}) {
  if (facts.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-card border border-border-line">
      <table className="w-full border-collapse" aria-label={`${label} details`}>
        <tbody>
          {facts.map((fact, index) => (
            <tr
              key={`${fact.label}-${fact.value}`}
              className={index < facts.length - 1 ? "border-b border-border-soft" : ""}
            >
              <th
                scope="row"
                className="w-2/5 bg-surface px-3 py-3 text-left align-top text-caption font-normal text-ink-secondary"
              >
                {fact.label}
              </th>
              <td className="px-3 py-3 text-right align-top text-body-sm font-bold text-pine">
                {fact.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoverageTable({ category }: { category: StructuredPolicyCategory }) {
  if (category.items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-card border border-border-line">
      <table className="w-full border-collapse" aria-label={`${category.label} covered expenses`}>
        <tbody>
          {category.items.map((item, index) => (
            <tr
              key={item}
              className={index < category.items.length - 1 ? "border-b border-border-soft" : ""}
            >
              <td className="w-10 bg-success-soft px-3 py-3 text-center text-success" aria-hidden="true">
                ✓
              </td>
              <th scope="row" className="px-3 py-3 text-left text-body-sm font-bold text-pine">
                {item}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
            <FactTable label={category.label} facts={category.facts} />
            <CoverageTable category={category} />
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
