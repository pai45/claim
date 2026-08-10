import { ClaimsDashboardScreen } from "@/components/dashboard/ClaimsDashboardScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export default function DashboardPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireEbPlus>
        <ClaimsDashboardScreen />
      </PersonaAccessGate>
    </main>
  );
}
