import Image from "next/image";
import { USER_DISPLAY_NAME } from "@/features/chat/constants";
import { withBasePath } from "@/lib/basePath";

export function ChatGreeting() {
  return (
    <section className="flex flex-col gap-2.5 px-4">
      <Image
        src={withBasePath("/assets/greeting-orb.svg")}
        alt=""
        width={72}
        height={72}
        priority
      />
      <h2 className="font-display text-[32px] font-bold leading-[1.4] text-pine-primary">
        Hey {USER_DISPLAY_NAME} 👋
      </h2>
      <p className="font-sans text-[15px] font-medium leading-[21px] text-body">
        I can help you claim reimbursements. What would you like to do?
      </p>
    </section>
  );
}
