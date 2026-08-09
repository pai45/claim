import { PolicyBenefitsListScreen } from "@/components/policy/PolicyBenefitsListScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export default function PolicyDetailsPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireLens>
        <PolicyBenefitsListScreen />
      </PersonaAccessGate>
    </main>
  );
}
