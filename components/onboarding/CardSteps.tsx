"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DEMO_KIT_NUMBER,
  FEATURE_WALLETS,
} from "@/features/onboarding/constants";
import type { AddressForm, OnboardingState } from "@/features/onboarding/types";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { colors } from "@/lib/ui/colors";
import { UI_ICONS } from "@/lib/ui/assets";
import { withBasePath } from "@/lib/basePath";
import { AppIcon } from "@/components/shared/AppIcon";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { OnboardingHeader } from "./OnboardingHeader";
import { CenterModal } from "./OnboardingModals";
import { CheckRow, TextField } from "./OnboardingPrimitives";
import { PrimaryFooter } from "./PrimaryFooter";
import { SuccessSealIcon } from "./SuccessSealIcon";
import { WalletGlyph } from "./WalletGlyphs";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";

type CardChoiceStepProps = {
  onBack: () => void;
  onOrderNew: () => void;
  onHaveKit: () => void;
};

export function CardChoiceStep({
  onBack,
  onOrderNew,
  onHaveKit,
}: CardChoiceStepProps) {
  return (
    <>
      <OnboardingHeader
        title="EB+ Card"
        subtitle="Do you already have a card welcome kit, or would you like us to send you a new one?"
        onBack={onBack}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4 pt-5">
        <ChoiceCard
          title="Order a New Card"
          description="We'll deliver your card to your address"
          onClick={onOrderNew}
          icon="box"
        />
        <ChoiceCard
          title="I Already Have a Card Welcome Kit"
          description="Activate using your card kit number."
          onClick={onHaveKit}
          icon="card"
        />
      </main>
    </>
  );
}

function ChoiceCard({
  title,
  description,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  onClick: () => void;
  icon: "box" | "card";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 rounded-card border border-border-line bg-white p-card text-left shadow-card"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-success-tint">
        {icon === "box" ? <BoxIcon /> : <CardIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-body block font-bold">{title}</span>
        <span className="type-body-secondary mt-0.5 block">{description}</span>
      </span>
      <ChevronRightIcon />
    </button>
  );
}

type CardAddressStepProps = {
  address: AddressForm;
  onBack: () => void;
  onChange: (field: keyof AddressForm, value: string | boolean) => void;
  onProceed: () => void;
};

export function CardAddressStep({
  address,
  onBack,
  onChange,
  onProceed,
}: CardAddressStepProps) {
  const canProceed =
    address.sameAsKyc &&
    address.line1.trim() &&
    address.line2.trim() &&
    address.pinCode.trim();

  return (
    <>
      <OnboardingHeader
        title="Order a New Card"
        subtitle="We'll deliver your card to your address"
        onBack={onBack}
      />
      <CardOrderProgress label="Delivery Address" step={1} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4 pt-5">
        <p className="type-body font-bold text-ink">
          Your card will be delivered to this address.
        </p>
        <CheckRow
          checked={address.sameAsKyc}
          onChange={(checked) => onChange("sameAsKyc", checked)}
          label="I confirm that my address is the same as my KYC address."
        />
        <TextField
          label="Address Line 1"
          value={address.line1}
          readOnly={address.sameAsKyc}
          onChange={(value) => onChange("line1", value)}
        />
        <TextField
          label="Address Line 2"
          value={address.line2}
          readOnly={address.sameAsKyc}
          onChange={(value) => onChange("line2", value)}
        />
        <TextField
          label="PIN Code"
          value={address.pinCode}
          readOnly={address.sameAsKyc}
          onChange={(value) => onChange("pinCode", value)}
        />
      </main>
      <PrimaryFooter
        label="Proceed"
        disabled={!canProceed}
        onClick={onProceed}
      />
    </>
  );
}

type CardEmbossmentStepProps = {
  onBack: () => void;
  onComplete: () => void;
};

/** The second card-ordering step, where the cardholder name is confirmed. */
export function CardEmbossmentStep({
  onBack,
  onComplete,
}: CardEmbossmentStepProps) {
  const { persona } = useActivePersona();
  const [successOpen, setSuccessOpen] = useState(false);
  const [firstName = "", ...remainingNames] = persona.profile.name.split(" ");
  const lastName = remainingNames.join(" ");
  const cardholder = persona.profile.name.trim().toUpperCase();

  return (
    <>
      <CardOrderHeader onBack={onBack} />
      <CardOrderProgress label="Name Embossment" step={2} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f4f4f4] px-5 py-5">
        <section className="rounded-card bg-white p-3 shadow-card">
          <div className="flex flex-col gap-4">
            <TextField
              label="First Name"
              value={firstName}
              readOnly
            />
            <TextField
              label="Last Name"
              value={lastName}
              readOnly
            />
          </div>
          <CardEmbossmentPreview cardholder={cardholder || "YOUR NAME"} />
        </section>
      </main>
      <PrimaryFooter
        label="Proceed"
        onClick={() => setSuccessOpen(true)}
      />
      <CenterModal
        open={successOpen}
        title="Success"
        description="You have successfully completed your Card Setup."
        onConfirm={() => {
          setSuccessOpen(false);
          onComplete();
        }}
        onClose={() => {
          setSuccessOpen(false);
          onComplete();
        }}
      />
    </>
  );
}

function CardOrderHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="shrink-0 bg-white px-5 pb-4 pt-4">
      <BackNavigationButton
        onClick={onBack}
        ariaLabel="Back to delivery address"
      />
      <h1 className="type-screen-title mt-2 text-[26px] leading-tight text-[#20252b]">
        Order a New Card
      </h1>
      <p className="type-body-secondary mt-1">
        We&apos;ll deliver your card to your address
      </p>
    </header>
  );
}

function CardOrderProgress({ label, step }: { label: string; step: 1 | 2 }) {
  const totalSteps = 2;
  return (
    <section
      className="relative mt-5 shrink-0 bg-[#ddf0dc] px-5 py-2"
      aria-label={`Card order, step ${step} of ${totalSteps}`}
    >
      <p className="text-body-sm font-bold text-ink">{label}</p>
      <p className="text-caption text-ink-secondary">
        Step {step} of {totalSteps}
      </p>
      <span
        className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-mint"
        aria-hidden="true"
      />
    </section>
  );
}

function CardEmbossmentPreview({ cardholder }: { cardholder: string }) {
  return (
    <section
      className="relative mt-5 aspect-[740/384] overflow-hidden rounded-[7px] text-white"
      aria-label={`Card preview for ${cardholder}`}
    >
      <Image
        src={withBasePath(
          "/employee-benefits/assets/icons/icici-card-front.png",
        )}
        alt=""
        fill
        sizes="(max-width: 434px) 100vw, 340px"
        className="object-cover"
      />
      <Image
        src={withBasePath("/employee-benefits/assets/icons/rupay-logo.svg")}
        alt="RuPay"
        width={56}
        height={24}
        className="absolute left-[5%] top-[7%] h-auto w-[17%]"
      />
      <div className="absolute inset-x-[5%] top-[31%]">
        <p className="text-[10px] font-normal text-[#bdd2d0]">CARD NUMBER</p>
        <div className="mt-1">
          <p className="whitespace-nowrap text-[15px] tracking-[0.22em]">
            •••• •••• •••• ••••
          </p>
        </div>
      </div>
      <div className="absolute inset-x-[5%] bottom-[11%] flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] leading-none">{cardholder}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[14px] font-bold leading-none">12/28</p>
          <p className="mt-1 text-[9px] text-[#bdd2d0]">EXPIRES</p>
        </div>
      </div>
    </section>
  );
}

type CardKitStepProps = {
  kitNumber: string;
  onBack: () => void;
  onChange: (value: string) => void;
  onComplete: () => void;
};

export function CardKitStep({
  kitNumber,
  onBack,
  onChange,
  onComplete,
}: CardKitStepProps) {
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [scanAttempt, setScanAttempt] = useState(0);
  const validated =
    kitNumber.trim().toUpperCase() === DEMO_KIT_NUMBER.toUpperCase();
  const canProceed = validated;

  function handleScan() {
    // Alternate demo outcomes: first scan fails, second succeeds.
    const next = scanAttempt + 1;
    setScanAttempt(next);
    if (next % 2 === 1) {
      setErrorOpen(true);
      return;
    }
    onChange(DEMO_KIT_NUMBER);
  }

  return (
    <>
      <OnboardingHeader
        title="Enter Card Kit Number"
        subtitle="Please check the welcome envelope that accompanied your card for this information"
        onBack={onBack}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4 pt-5">
        <TextField
          label="Card Kit Number"
          value={kitNumber}
          onChange={onChange}
          placeholder="Enter or Scan Kit Number"
          trailing={
            validated ? (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: colors.success }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 12.5 4 4 8-9"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            ) : null
          }
        />
        {validated ? (
          <p className="text-caption font-bold text-success">
            Kit number validated successfully.
          </p>
        ) : (
          <p className="text-caption text-ink-secondary">
            Enter the kit number mentioned on the card kit. Demo:{" "}
            {DEMO_KIT_NUMBER}
          </p>
        )}
        <button
          type="button"
          onClick={handleScan}
          className="btn-secondary min-h-11 h-auto gap-2 py-3"
        >
          <QrIcon />
          Scan QR from Welcome Kit
        </button>
      </main>
      <PrimaryFooter
        label="Proceed"
        disabled={!canProceed}
        onClick={() => setSuccessOpen(true)}
      />
      <CenterModal
        open={errorOpen}
        variant="error"
        title="QR Code Not Recognised"
        description="Make sure you're scanning the QR from your Pine Labs welcome kit envelope."
        onConfirm={() => setErrorOpen(false)}
        onClose={() => setErrorOpen(false)}
      />
      <CenterModal
        open={successOpen}
        title="Success"
        description="Your card kit has been linked and activated against your registered mobile number."
        onConfirm={() => {
          setSuccessOpen(false);
          onComplete();
        }}
        onClose={() => {
          setSuccessOpen(false);
          onComplete();
        }}
      />
    </>
  );
}

type ReadyStepProps = {
  state: OnboardingState;
  onToggleOnline: (value: boolean) => void;
  onToggleTap: (value: boolean) => void;
  onFinish: () => void;
};

export function ReadyStep({
  state,
  onToggleOnline,
  onToggleTap,
  onFinish,
}: ReadyStepProps) {
  const name =
    `${state.identity.firstName} ${state.identity.lastName}`.toUpperCase();

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-6">
        <div className="flex shrink-0 flex-col items-center text-center">
          <SuccessSealIcon size={64} />
          <h1 className="type-section-title mt-4 max-w-[280px]">
            Your Employee Benefit Card is Ready for Use!
          </h1>
        </div>

        <section
          className="relative mt-4 shrink-0 aspect-[740/384] overflow-hidden rounded-card text-white shadow-card"
          aria-label="Employee benefit card preview"
        >
          <Image
            src={withBasePath(
              "/employee-benefits/assets/icons/icici-card-front.png",
            )}
            alt=""
            fill
            sizes="(max-width: 434px) 100vw, 340px"
            className="object-cover"
          />
          <Image
            src={withBasePath(UI_ICONS.rupay)}
            alt="RuPay"
            width={56}
            height={24}
            className="absolute left-[4.5%] top-[8%] h-auto w-[14.5%]"
          />
          <div className="absolute inset-x-[4.5%] top-[28.5%]">
            <p className="type-field-label text-white/70">Card Number</p>
            <p className="mt-1 whitespace-nowrap font-display text-title-sm tracking-wider">
              **** **** **** ***
            </p>
          </div>
          <div className="absolute inset-x-[4.5%] bottom-[11%] flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="type-field-label text-white/70">Card Holder</p>
              <p className="mt-1 truncate text-body-sm font-bold">
                {name || "VISHAL SHARMA"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="type-field-label text-white/70">Expires</p>
              <p className="mt-1 text-body-sm font-bold">** / **</p>
            </div>
          </div>
        </section>

        <h2 className="type-body mt-4 shrink-0 font-bold text-ink">
          Linked Wallets
        </h2>
        <div className="mt-2 grid shrink-0 grid-cols-2 gap-2 rounded-card border border-border-line bg-white p-3 shadow-card">
          {FEATURE_WALLETS.map((wallet) => (
            <div
              key={wallet.id}
              className="flex min-w-0 items-center gap-2 rounded-control px-2 py-2"
              style={{ background: wallet.bg }}
            >
              <WalletGlyph id={wallet.id} color={wallet.ink} />
              <span
                className="min-w-0 text-caption font-bold"
                style={{ color: wallet.ink }}
              >
                {wallet.title.replace(" Wallet", "")}
              </span>
            </div>
          ))}
        </div>

        <h2 className="type-body mt-4 shrink-0 font-bold text-ink">
          Enable Transactions
        </h2>
        <div className="mt-2 shrink-0 overflow-hidden rounded-card border border-border-line bg-white shadow-card">
          <ToggleRow
            label="Online Transactions"
            icon={UI_ICONS.onlineTransactions}
            checked={state.onlineTransactions}
            onChange={onToggleOnline}
          />
          <div className="border-t border-border-line" />
          <ToggleRow
            label="Tap to Pay"
            icon={UI_ICONS.tapToPay}
            checked={state.tapToPay}
            onChange={onToggleTap}
          />
        </div>
        <p className="type-body-secondary mt-3 shrink-0 text-ink-tertiary">
          You can change these anytime in Card Settings.
        </p>
      </main>
      <PrimaryFooter label="Go to Homepage" onClick={onFinish} />
    </>
  );
}

function ToggleRow({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-page py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-success-tint">
        <AppIcon src={icon} alt="" size={20} />
      </span>
      <p className="type-body flex-1 font-bold">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="grid h-11 w-11 shrink-0 place-items-center"
      >
        <span
          className={`relative h-5 w-9 rounded-pill transition-colors ${
            checked ? "bg-pine-primary" : "bg-border-muted"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-transform ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </span>
      </button>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 20V11M3 8.5 12 13l9-4.5"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
      />
      <path d="M2.5 9.5h19" stroke={colors.pinePrimary} strokeWidth="1.7" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h3v3h-3v-3Zm3-3h3v3h-3v-3Zm-3 0h3v3h-3v-3Z"
        stroke={colors.pinePrimary}
        strokeWidth="1.5"
      />
    </svg>
  );
}
