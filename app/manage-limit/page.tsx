import { ManageLimitScreen } from "@/components/manage-limit/ManageLimitScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export default function ManageLimitPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireLens>
        <ManageLimitScreen />
      </PersonaAccessGate>
    </main>
  );
}
