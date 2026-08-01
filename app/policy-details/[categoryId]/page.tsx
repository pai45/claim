import { redirect } from "next/navigation";
import { PolicyDetailScreen } from "@/components/policy/PolicyDetailScreen";
import { isPolicyTabId } from "@/features/policy/constants";

type PolicyCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function PolicyCategoryPage({
  params,
}: PolicyCategoryPageProps) {
  const { categoryId } = await params;

  if (!isPolicyTabId(categoryId)) {
    redirect("/policy-details");
  }

  return (
    <main className="min-h-dvh w-full">
      <PolicyDetailScreen initialTab={categoryId} />
    </main>
  );
}
