"use client";

import Image from "next/image";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { markVkycDone } from "@/features/onboarding/vkycHandoff";
import { withBasePath } from "@/lib/basePath";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { InstructionManualIllustration } from "./InstructionManualIllustration";

/**
 * A stand-in for the Pine Labs Full-KYC page the real journey hands off to.
 *
 * This screen deliberately impersonates a third-party site rather than the
 * Benefits Assistant, so it is a scoped exception to the app's design system:
 * the palette below is sampled from the Pine Labs UAT page and is kept local on
 * purpose. Do not promote these values into `@theme` or `lib/ui/colors.ts`.
 */
const UAT = {
  ink: "#212121",
  body: "#333333",
  headerRule: "#e8e8e8",
  panel: "#e7efe6",
  panelRule: "#d5e2d3",
  pill: "#a9c5a2",
  pillInk: "#123a2c",
  submit: "#123a2c",
  agree: "#5b8f70",
  link: "#2f6fd0",
  checkbox: "#5f6174",
} as const;

type Stage = "process" | "consent" | "started" | "returned";

export function VkycDemoScreen() {
  const [stage, setStage] = useState<Stage>("process");

  const tapToAdvance = stage === "process" || stage === "consent";

  // Taps land on this container, so anywhere on the screen moves the demo
  // forward. The visible CTA is a real button with no handler of its own — its
  // click (including the synthetic one Enter/Space produces) bubbles to here,
  // which keeps the keyboard path working without double-advancing.
  function handleContainerClick() {
    if (stage === "process") setStage("consent");
    else if (stage === "consent") setStage("started");
  }

  function handleFinishDemo() {
    markVkycDone();
    setStage("returned");
  }

  return (
    <AppShell className="overflow-hidden bg-white">
      <header
        className="shrink-0 border-b px-5 py-4"
        style={{ borderColor: UAT.headerRule }}
      >
        <Image
          src={withBasePath(BRAND_ASSETS.pineLabs)}
          alt="Pine Labs"
          width={137}
          height={36}
          priority
          unoptimized
          className="h-9 w-auto"
        />
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto bg-white px-5 py-6"
        onClick={tapToAdvance ? handleContainerClick : undefined}
      >
        {stage === "process" ? <ProcessCard /> : null}
        {stage === "consent" ? <ConsentCard /> : null}
        {stage === "started" ? <VkycStartedCard onFinish={handleFinishDemo} /> : null}
        {stage === "returned" ? <ReturnToAppCard /> : null}
      </div>
    </AppShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-card rounded-2xl bg-white px-5 py-6 shadow-[0_2px_16px_rgba(0,0,0,0.12)]">
      {children}
    </section>
  );
}

function ProcessCard() {
  return (
    <Card>
      <h1 className="text-[21px] leading-7" style={{ color: UAT.ink }}>
        Complete your Full KYC process
      </h1>

      <div
        className="mt-5 rounded-lg border px-3 py-4"
        style={{ background: UAT.panel, borderColor: UAT.panelRule }}
      >
        <p
          className="rounded px-3 py-2 text-[15px] leading-5 font-bold"
          style={{ background: UAT.pill, color: UAT.pillInk }}
        >
          Interactive Process - Video KYC
        </p>
        <ol
          className="mt-3 flex list-decimal flex-col gap-3 pl-5 text-[15px] leading-[21px]"
          style={{ color: UAT.body }}
        >
          <li>Available between 10:00 A.M. to 7:00 P.M. from Monday to Saturday.</li>
          <li>It will be an interactive process with a Pine Labs Agent.</li>
          <li>
            Your digilocker credentials and PAN card details are required to
            complete the Video KYC journey.
          </li>
          <li>
            In case your Video KYC fails, a KYC link will be shared with you to
            complete the full KYC in the Video KYC rejection email/SMS.
          </li>
        </ol>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="min-h-11 rounded-md px-12 text-[16px] leading-6 text-white"
          style={{ background: UAT.submit }}
        >
          Submit
        </button>
      </div>
    </Card>
  );
}

function ConsentCard() {
  return (
    <Card>
      <div className="mx-auto h-[150px] w-full max-w-[260px]">
        <InstructionManualIllustration />
      </div>

      <ul
        className="mt-5 flex list-disc flex-col gap-3 pl-5 text-[15px] leading-[21px]"
        style={{ color: UAT.body }}
      >
        <li>
          I provide my <Link>consent</Link> to Pine Labs to complete my KYC for
          the purpose of opening my PPI account.
        </li>
        <li>I declare that I am not a politically exposed person (PEP).</li>
        <li>
          I confirm to have read the program <Link>T&amp;Cs</Link> and{" "}
          <Link>Pine Lab&apos;s Privacy Policy</Link>
        </li>
      </ul>

      <div className="mt-5 flex items-start gap-3">
        <span
          className="mt-0.5 h-5 w-5 shrink-0 rounded-[3px] border-2"
          style={{ borderColor: UAT.checkbox }}
          aria-hidden="true"
        />
        <span className="text-[15px] leading-[21px]" style={{ color: UAT.body }}>
          I have read and understood all the Terms and conditions above.
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="min-h-11 rounded-md px-8 text-[16px] leading-6 text-white"
          style={{ background: UAT.agree }}
        >
          Agree and Continue
        </button>
      </div>
    </Card>
  );
}

function VkycStartedCard({ onFinish }: { onFinish: () => void }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: UAT.panel }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect
              x="2.5"
              y="6"
              width="12.5"
              height="12"
              rx="2.5"
              stroke={UAT.pillInk}
              strokeWidth="1.8"
            />
            <path
              d="m15 11.5 5-3v7l-5-3v-1Z"
              stroke={UAT.pillInk}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1
          className="mt-4 text-[21px] leading-7 font-bold"
          style={{ color: UAT.ink }}
        >
          PinePerks VKYC starts
        </h1>
        <p
          className="mt-2 text-[15px] leading-[21px]"
          style={{ color: UAT.body }}
        >
          You would now be connected to a Pine Labs agent for your video call.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="min-h-11 rounded-md px-10 text-[16px] leading-6 text-white"
          style={{ background: UAT.submit }}
          onClick={onFinish}
        >
          Finish demo
        </button>
      </div>
    </Card>
  );
}

function ReturnToAppCard() {
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: UAT.submit }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="m6.5 12.5 3.5 3.5 7.5-8"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1
          className="mt-4 text-[21px] leading-7 font-bold"
          style={{ color: UAT.ink }}
        >
          Video KYC complete
        </h1>
        <p
          className="mt-2 text-[15px] leading-[21px]"
          style={{ color: UAT.body }}
        >
          You can return to the Benefits app now — your KYC will finish
          verifying there.
        </p>
      </div>
    </Card>
  );
}

function Link({ children }: { children: React.ReactNode }) {
  // Deliberately not an anchor: every tap on this screen advances the demo, and
  // a real href would navigate away from it.
  return <span style={{ color: UAT.link }}>{children}</span>;
}
