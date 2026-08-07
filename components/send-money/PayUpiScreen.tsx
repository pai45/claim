"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type ContactItem = {
  id: string;
  name: string;
  upiId: string;
  initials?: string;
  type: "person" | "merchant";
  brand?: "zomato" | "amazon";
};

const RECENTLY_PAID_CONTACTS: ContactItem[] = [
  {
    id: "1",
    name: "Deevanshu Sharma",
    upiId: "deevanshu@paytm",
    initials: "DS",
    type: "person",
  },
  {
    id: "2",
    name: "Anjali Kumar",
    upiId: "anjali.kumar@paytm",
    initials: "AK",
    type: "person",
  },
  {
    id: "3",
    name: "Zomato",
    upiId: "zomato@paytm",
    type: "merchant",
    brand: "zomato",
  },
  {
    id: "4",
    name: "Amazon",
    upiId: "amazon@pay",
    type: "merchant",
    brand: "amazon",
  },
  {
    id: "5",
    name: "Sneha Roy",
    upiId: "sneha.roy@paytm",
    initials: "SR",
    type: "person",
  },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export function PayUpiScreen() {
  const router = useRouter();

  // State for flows
  const [customUpiOpen, setCustomUpiOpen] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState("");
  const [upiError, setUpiError] = useState<string | null>(null);

  const [selectedRecipient, setSelectedRecipient] = useState<ContactItem | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  const [successData, setSuccessData] = useState<{
    recipient: ContactItem;
    amount: string;
    note: string;
    txnId: string;
    timestamp: string;
  } | null>(null);

  function handleBack() {
    router.push("/");
  }

  function handleSelectContact(contact: ContactItem) {
    setSelectedRecipient(contact);
    setAmountInput("");
    setNoteInput("");
    setAmountError(null);
  }

  function handleProceedCustomUpi() {
    const trimmed = customUpiInput.trim();
    if (!trimmed) {
      setUpiError("Please enter a valid UPI ID");
      return;
    }
    if (!trimmed.includes("@")) {
      setUpiError("UPI ID must contain @ (e.g. name@okhdfcbank)");
      return;
    }

    setUpiError(null);
    setCustomUpiOpen(false);

    // Create ad-hoc recipient
    const nameFromUpi = trimmed.split("@")[0].replace(/[._-]/g, " ");
    const initials = nameFromUpi
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "UP";

    const customContact: ContactItem = {
      id: `custom-${Date.now()}`,
      name: nameFromUpi
        .split(" ")
        .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" "),
      upiId: trimmed.toLowerCase(),
      initials,
      type: "person",
    };

    setSelectedRecipient(customContact);
    setAmountInput("");
    setNoteInput("");
    setAmountError(null);
  }

  function handlePay() {
    const num = parseFloat(amountInput);
    if (!num || isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid payment amount");
      return;
    }
    if (num > 100000) {
      setAmountError("Maximum transaction limit is ₹1,00,000");
      return;
    }

    if (!selectedRecipient) return;

    const now = new Date();
    const formattedTime = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const randomTxn = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    setSuccessData({
      recipient: selectedRecipient,
      amount: num.toLocaleString("en-IN"),
      note: noteInput.trim(),
      txnId: randomTxn,
      timestamp: formattedTime,
    });

    setSelectedRecipient(null);
  }

  function handleCloseSuccess() {
    setSuccessData(null);
    setCustomUpiInput("");
  }

  return (
    <AppShell className="overflow-hidden bg-white">
      {/* Header */}
      <header className="relative flex w-full shrink-0 items-center justify-between px-page pb-3 pt-2">
        <BackNavigationButton onClick={handleBack} ariaLabel="Back" />
        <h1 className="type-screen-title absolute left-0 right-0 text-center pointer-events-none text-ink">
          Pay to UPI ID
        </h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-2">
        {/* Top Hero Banner Card ("Enter UPI ID") */}
        <section className="animate-rise-in pt-1" style={staggerStyle(0)}>
          <button
            type="button"
            onClick={() => {
              setCustomUpiInput("");
              setUpiError(null);
              setCustomUpiOpen(true);
            }}
            className="group relative flex w-full items-center justify-between rounded-card p-4 text-left shadow-cta transition-transform active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${colors.pinePrimary} 0%, #004242 60%, ${colors.pineDark} 100%)`,
            }}
          >
            <div className="flex items-center gap-3.5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-white shadow-soft"
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.pinePrimary}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
              </span>
              <div>
                <h2 className="text-base font-bold text-white">Enter UPI ID</h2>
                <p className="mt-0.5 text-xs text-white/80">
                  Pay to any UPI ID instantly
                </p>
              </div>
            </div>

            <span className="shrink-0 text-white/80 group-hover:translate-x-0.5 transition-transform">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </section>

        {/* Recently Paid Section */}
        <section className="animate-rise-in mt-6" style={staggerStyle(1)}>
          <h3 className="type-section-title text-base font-bold text-ink mb-3">
            Recently Paid
          </h3>

          <div className="flex flex-col gap-3">
            {RECENTLY_PAID_CONTACTS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectContact(item)}
                style={staggerStyle(index + 2)}
                className="animate-rise-in flex min-h-14 w-full items-center justify-between rounded-card border border-border-line bg-white p-3.5 text-left shadow-card transition-all hover:bg-surface active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar / Badge */}
                  <RecipientAvatar item={item} />

                  <div className="min-w-0 flex-1">
                    <span className="type-body block truncate font-bold text-ink">
                      {item.name}
                    </span>
                    <span className="type-body-secondary mt-0.5 block truncate text-xs text-subtle">
                      {item.upiId}
                    </span>
                  </div>
                </div>

                <span
                  className="shrink-0 pl-2 text-mint"
                  style={{ color: colors.mint }}
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="m9 18 6-6-6-6"
                      stroke={colors.mint}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Modal / BottomSheet: Enter Custom UPI ID */}
      {customUpiOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-upi-title"
        >
          <div className="w-full max-w-phone rounded-t-bubble bg-white px-page pb-8 pt-5 shadow-drawer animate-sheet-rise border-t border-border-line">
            <div className="flex items-center justify-between pb-3 border-b border-border-line">
              <h3 id="custom-upi-title" className="type-section-title text-ink font-bold">
                Enter UPI ID
              </h3>
              <button
                type="button"
                onClick={() => setCustomUpiOpen(false)}
                className="h-8 w-8 rounded-full bg-surface-muted flex items-center justify-center text-subtle hover:text-ink transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="custom-upi-input" className="type-field-label">
                  UPI ID / Virtual Payment Address
                </label>
                <div className="field-focus-shell flex min-h-14 items-center gap-3 rounded-control border border-input-border bg-input-soft px-3.5">
                  <span className="shrink-0 text-ink-secondary" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                    </svg>
                  </span>
                  <input
                    id="custom-upi-input"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoFocus
                    placeholder="e.g. mobile@upi or name@bank"
                    value={customUpiInput}
                    onChange={(e) => {
                      setCustomUpiInput(e.target.value);
                      if (upiError) setUpiError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleProceedCustomUpi();
                    }}
                    className="w-full bg-transparent text-body font-bold text-pine outline-none placeholder:font-normal placeholder:text-muted"
                  />
                </div>
                {upiError ? (
                  <p className="text-caption text-danger">{upiError}</p>
                ) : (
                  <p className="text-caption text-ink-secondary">
                    Supports Google Pay, PhonePe, Paytm, BHIM & all Bank UPIs
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleProceedCustomUpi}
                className="btn-primary mt-2 w-full"
              >
                Verify & Proceed
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal / BottomSheet: Enter Amount & Pay */}
      {selectedRecipient ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-amount-title"
        >
          <div className="w-full max-w-phone rounded-t-bubble bg-white px-page pb-8 pt-5 shadow-drawer animate-sheet-rise border-t border-border-line">
            <div className="flex items-center justify-between pb-3 border-b border-border-line">
              <h3 id="pay-amount-title" className="type-section-title text-ink font-bold">
                Payment Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRecipient(null)}
                className="h-8 w-8 rounded-full bg-surface-muted flex items-center justify-center text-subtle hover:text-ink transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Recipient summary badge */}
            <div className="mt-4 flex items-center gap-3 rounded-card bg-surface-tint p-3 border border-border-line">
              <RecipientAvatar item={selectedRecipient} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink text-sm truncate">
                  {selectedRecipient.name}
                </p>
                <p className="text-xs text-subtle truncate">{selectedRecipient.upiId}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {/* Amount Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-amount" className="type-field-label">
                  Enter Amount
                </label>
                <div className="field-focus-shell flex min-h-14 items-center gap-2 rounded-control border border-input-border bg-input-soft px-4">
                  <span className="text-2xl font-bold text-pine" aria-hidden="true">
                    ₹
                  </span>
                  <input
                    id="payment-amount"
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      if (amountError) setAmountError(null);
                    }}
                    className="w-full bg-transparent font-display text-2xl font-bold text-pine outline-none placeholder:text-muted"
                  />
                </div>
                {amountError ? (
                  <p className="text-caption text-danger">{amountError}</p>
                ) : null}
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(amt));
                      if (amountError) setAmountError(null);
                    }}
                    className="rounded-pill border border-border-line bg-white px-3.5 py-1.5 text-xs font-bold text-pine-primary shadow-soft hover:bg-surface-tint active:scale-95 transition-all"
                  >
                    + ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {/* Optional Note */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-note" className="type-field-label">
                  Add a note (Optional)
                </label>
                <div className="field-focus-shell flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3.5">
                  <input
                    id="payment-note"
                    type="text"
                    placeholder="e.g. Lunch, Dinner, Shopping"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full bg-transparent text-caption font-medium text-ink outline-none placeholder:text-muted"
                  />
                </div>
              </div>

              {/* Payment Method / Account Indicator */}
              <div className="flex items-center justify-between rounded-control bg-surface-muted px-3.5 py-2.5 text-xs">
                <span className="text-subtle font-medium">Paying from</span>
                <span className="font-bold text-pine-primary flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-pine-primary" />
                  PlusPay Wallet
                </span>
              </div>

              <button
                type="button"
                onClick={handlePay}
                className="btn-primary mt-1 w-full"
              >
                Pay ₹{amountInput ? Number(amountInput).toLocaleString("en-IN") : "0"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Direct Payment Success Dialog */}
      {successData ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-drawer animate-rise-in border border-border-line text-center">
            {/* Celebration Check Badge */}
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-soft"
              style={{ background: colors.success }}
              aria-hidden="true"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 id="success-title" className="type-section-title mt-4 text-ink font-bold text-xl">
              Payment Successful!
            </h3>
            <p className="type-amount mt-1 text-2xl font-bold text-pine-primary">
              ₹{successData.amount}
            </p>

            <p className="type-body-secondary mt-1 text-xs text-subtle">
              Paid to <strong className="text-ink">{successData.recipient.name}</strong>
            </p>

            {/* Receipt Summary Card */}
            <div className="mt-5 flex flex-col gap-2 rounded-control bg-surface-muted p-3.5 text-left text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-subtle">UPI ID</span>
                <span className="font-semibold text-ink">{successData.recipient.upiId}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-subtle">Txn Reference</span>
                <span className="font-mono font-medium text-ink">{successData.txnId}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-subtle">Debited From</span>
                <span className="font-semibold text-pine">PlusPay Account</span>
              </div>
              {successData.note ? (
                <div className="flex justify-between py-0.5">
                  <span className="text-subtle">Note</span>
                  <span className="font-medium text-ink italic">&ldquo;{successData.note}&rdquo;</span>
                </div>
              ) : null}
              <div className="flex justify-between py-0.5">
                <span className="text-subtle">Date & Time</span>
                <span className="text-subtle">{successData.timestamp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="btn-primary mt-6 w-full"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function RecipientAvatar({ item }: { item: ContactItem }) {
  if (item.brand === "zomato") {
    return (
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control shadow-soft font-black text-xs italic tracking-tighter text-white"
        style={{ background: "#E23744" }}
        aria-label="Zomato"
      >
        zomato
      </span>
    );
  }

  if (item.brand === "amazon") {
    return (
      <span
        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-control shadow-soft"
        style={{ background: "#FF9900" }}
        aria-label="Amazon"
      >
        <svg
          width="24"
          height="14"
          viewBox="0 0 24 14"
          fill="none"
          aria-hidden="true"
        >
          {/* Amazon smile arrow curve */}
          <path
            d="M3 4c5 7 13 7 18 0"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="m18 4 3.5-.5L20 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-muted text-body-sm font-bold text-ink shadow-soft"
      aria-hidden="true"
    >
      {item.initials}
    </span>
  );
}
