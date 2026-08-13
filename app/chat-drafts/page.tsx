import { ChatDraftsScreen } from "@/components/chat-drafts/ChatDraftsScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export default function ChatDraftsPage() {
  return (
    <main className="min-h-dvh w-full">
      <PersonaAccessGate requireEbPlus>
        <ChatDraftsScreen />
      </PersonaAccessGate>
    </main>
  );
}
