import { notFound } from "next/navigation";
import { PolicyDetailScreen } from "@/components/policy/PolicyDetailScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";
import {
  isPolicyTabId,
  EMPLOYER_BENEFITS_CATALOG,
} from "@/features/policy/constants";

type PolicyCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return EMPLOYER_BENEFITS_CATALOG.benefits.map(({ id }) => ({ categoryId: id }));
}

export default async function PolicyCategoryPage({
  params,
}: PolicyCategoryPageProps) {
  const { categoryId } = await params;

  if (!isPolicyTabId(categoryId)) {
    notFound();
  }

  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireLens>
        <PolicyDetailScreen initialTab={categoryId} />
      </PersonaAccessGate>
    </main>
  );
}
