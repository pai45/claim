import { notFound } from "next/navigation";
import { PolicyDetailScreen } from "@/components/policy/PolicyDetailScreen";
import {
  isPolicyTabId,
  POLICY_CATEGORIES,
} from "@/features/policy/constants";

type PolicyCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_CATEGORIES.map(({ id }) => ({ categoryId: id }));
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
      <PolicyDetailScreen initialTab={categoryId} />
    </main>
  );
}
