import Image from "next/image";
import { USER_DISPLAY_NAME } from "@/features/chat/constants";
import { withBasePath } from "@/lib/basePath";
import { MagicText } from "@/components/shared/MagicText";

export function ChatGreeting() {
  return (
    <section className="flex flex-col gap-2.5 px-4">
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
        className="font-display text-[32px] font-bold leading-[1.4] text-pine-primary"
      />
      <MagicText
        as="p"
        text="I can help you claim reimbursements. What would you like to do?"
        mode="words"
        delayMs={520}
        stepMs={60}
        className="font-sans text-[15px] font-medium leading-[21px] text-body"
      />
    </section>
  );
}
