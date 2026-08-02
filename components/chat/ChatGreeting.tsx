import Image from "next/image";
import { USER_DISPLAY_NAME } from "@/features/chat/constants";
import { withBasePath } from "@/lib/basePath";
import { MagicText } from "@/components/shared/MagicText";
import { colors } from "@/lib/ui/colors";

export function ChatGreeting() {
  return (
    <section className="flex flex-col gap-3 px-page">
      <div className="animate-rise-in" style={{ animationDelay: "40ms" }}>
        <Image
          src={withBasePath("/assets/greeting-orb.svg")}
          alt=""
          width={72}
          height={72}
          priority
        />
      </div>
      <MagicText
        as="h2"
        text={`Hey ${USER_DISPLAY_NAME} 👋`}
        mode="chars"
        delayMs={120}
        stepMs={32}
        shimmer
        shimmerBase={colors.pinePrimary}
        className="type-hero"
      />
      <MagicText
        as="p"
        text="I can help you claim reimbursements. What would you like to do?"
        mode="words"
        delayMs={520}
        stepMs={60}
        className="type-body"
      />
    </section>
  );
}
