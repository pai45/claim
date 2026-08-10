import { ClaimDetailsPageClient } from "@/components/claims/ClaimDetailsPageClient";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export default function ClaimDetailsPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireEbPlus>
        <ClaimDetailsPageClient />
      </PersonaAccessGate>
    </main>
  );
}
