import { notFound } from "next/navigation";
import { BenefitClaimsScreen } from "@/components/dashboard/BenefitClaimsScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";
import { isDashboardCategoryId } from "@/features/dashboard/benefitClaims";
import { DASHBOARD_CATEGORIES } from "@/features/dashboard/constants";

type BenefitDashboardPageProps = {
  params: Promise<{ categoryId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return DASHBOARD_CATEGORIES.map(({ id }) => ({ categoryId: id }));
}

export default async function BenefitDashboardPage({
  params,
}: BenefitDashboardPageProps) {
  const { categoryId } = await params;

  if (!isDashboardCategoryId(categoryId)) {
    notFound();
  }

  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireEbPlus>
        <BenefitClaimsScreen categoryId={categoryId} />
      </PersonaAccessGate>
    </main>
  );
}
