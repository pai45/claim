"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ReceiptActions } from "@/components/scan-pay/ScanPayResult";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import {
  formatScanPayINR,
  paymentPayeeIdentifier,
  receiptRows,
  transactionStatusLabel,
} from "@/features/scan-pay/receipt";
import type { ScanPayTransaction } from "@/features/scan-pay/types";
import { withBasePath } from "@/lib/basePath";
import { SCAN_PAY_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function ScanPayReward({
  transaction,
  revealed,
  onReveal,
  onViewDetails,
  onDownload,
  onShare,
  onClose,
}: {
  transaction: ScanPayTransaction;
  revealed: boolean;
  onReveal: () => void;
  onViewDetails: () => void;
  onDownload: (transaction: ScanPayTransaction) => void;
  onShare: (transaction: ScanPayTransaction) => void;
  onClose: () => void;
}) {
  const [scratchReady, setScratchReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setScratchReady(true), reduced ? 0 : 1700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AppShell className="scan-pay-shell scan-pay-reward-screen relative overflow-hidden bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        <section className="scan-pay-reward-hero relative flex flex-col items-center px-page pt-12 text-center text-white">
          <div className="scan-pay-reward-copy relative z-10 flex flex-col items-center">
            <AppIcon
              src={SCAN_PAY_ASSETS.financeIllustration}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
            <p className="mt-2 text-caption font-bold uppercase tracking-wide text-white/80">
              Paid to <span className="ml-1 text-body font-bold normal-case text-white">{transaction.payee.name}</span>
            </p>
            <p className="mt-1 text-body-sm text-white/80">
              {paymentPayeeIdentifier(transaction)}
            </p>
            <p className="mt-2 font-display text-display font-bold text-white">
              {formatScanPayINR(transaction.amount)}
            </p>
          </div>

          <ScratchCashbackCard
            amount={transaction.cashbackAmount}
            ready={scratchReady}
            revealed={revealed}
            onReveal={onReveal}
          />
        </section>

        <section className="scan-pay-reward-details px-page pt-28">
          <dl className="divide-y divide-border-soft">
            {receiptRows(transaction).map(([label, value], index) => (
              <div
                key={label}
                className="animate-rise-in flex items-start justify-between gap-4 py-2.5 text-caption"
                style={staggerStyle(index, 55, 360)}
              >
                <dt className="text-ink-secondary">{label}</dt>
                <dd className={`max-w-[62%] text-right font-bold ${label === "Status" ? "text-success" : "text-ink"}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <ReceiptActions
            transaction={transaction}
            onViewDetails={onViewDetails}
            onDownload={onDownload}
            onShare={onShare}
          />
        </section>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 border-t border-border-soft bg-white px-page pb-5 pt-3">
        <button type="button" className="btn-primary gap-2" onClick={onClose}>
          Back to Home
          <ScanPayIcon name="arrow" />
        </button>
      </footer>
      <p className="sr-only" aria-live="polite">
        {revealed
          ? `${formatScanPayINR(transaction.cashbackAmount)} cashback revealed`
          : "Scratch card ready"}
      </p>
    </AppShell>
  );
}

/** Bank transfers share the Scan & Pay paid-to layout but never offer cashback. */
export function ScanPayBankTransferPaid({
  transaction,
  onClose,
}: {
  transaction: ScanPayTransaction;
  onClose: () => void;
}) {
  return (
    <AppShell className="scan-pay-shell scan-pay-reward-screen relative overflow-hidden bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        <section className="scan-pay-bank-transfer-hero scan-pay-reward-hero relative flex flex-col items-center px-page pt-4 text-center text-white">
          <div className="scan-pay-reward-copy relative z-10 flex flex-col items-center">
            <AppIcon
              src={SCAN_PAY_ASSETS.financeIllustration}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
            <p className="mt-2 text-caption font-bold uppercase tracking-wide text-white/80">
              Paid to <span className="ml-1 text-body font-bold normal-case text-white">{transaction.payee.name}</span>
            </p>
            <p className="mt-1 text-body-sm text-white/80">
              {paymentPayeeIdentifier(transaction)}
            </p>
            <p className="mt-2 font-display text-display font-bold text-white">
              {formatScanPayINR(transaction.amount)}
            </p>
          </div>
        </section>

        <section className="scan-pay-bank-transfer-details scan-pay-reward-details px-page pt-3">
          <dl className="divide-y divide-border-soft">
            {receiptRows(transaction).map(([label, value], index) => (
              <div
                key={label}
                className="animate-rise-in flex items-start justify-between gap-4 py-2.5 text-caption"
                style={staggerStyle(index, 55, 360)}
              >
                <dt className="text-ink-secondary">{label}</dt>
                <dd className={`max-w-[62%] text-right font-bold ${label === "Status" ? "text-warning" : "text-ink"}`}>
                  {label === "Status" ? transactionStatusLabel(transaction) : value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 border-t border-border-soft bg-white px-page pb-5 pt-3">
        <button type="button" className="btn-primary gap-2" onClick={onClose}>
          Back to Home
          <ScanPayIcon name="arrow" />
        </button>
      </footer>
    </AppShell>
  );
}

function ScratchCashbackCard({
  amount,
  ready,
  revealed,
  onReveal,
}: {
  amount: number;
  ready: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coverReady, setCoverReady] = useState(false);
  const interactive = ready && coverReady;

  // Prepare the supplied artwork before the card reaches its first visible
  // entrance frame. The branded fallback prevents the prize flashing through
  // if the image is still decoding or cannot be loaded.
  useLayoutEffect(() => {
    if (revealed) return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!stage || !canvas || !context) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintScratchCover(context, width, height);

    let cancelled = false;
    let painted = false;
    const cover = new Image();
    const paintAsset = () => {
      if (cancelled || painted || !cover.naturalWidth) return;
      painted = true;
      paintScratchAsset(context, cover, width, height);
      setCoverReady(true);
    };
    cover.onload = paintAsset;
    cover.onerror = () => {
      if (!cancelled) setCoverReady(true);
    };
    cover.src = withBasePath(SCAN_PAY_ASSETS.scratchCard);
    if (cover.complete) void cover.decode().then(paintAsset).catch(() => undefined);

    return () => {
      cancelled = true;
      cover.onload = null;
      cover.onerror = null;
    };
  }, [revealed]);

  useEffect(() => {
    if (!interactive || revealed) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let drawing = false;
    let moved = false;
    let finished = false;
    let last: { x: number; y: number } | null = null;

    function point(event: PointerEvent) {
      const bounds = canvas!.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    }

    function scratch(next: { x: number; y: number }) {
      context!.globalCompositeOperation = "destination-out";
      context!.lineWidth = 46;
      context!.lineCap = "round";
      context!.lineJoin = "round";
      if (last) {
        context!.beginPath();
        context!.moveTo(last.x, last.y);
        context!.lineTo(next.x, next.y);
        context!.stroke();
      }
      context!.beginPath();
      context!.arc(next.x, next.y, 23, 0, Math.PI * 2);
      context!.fill();
      last = next;
    }

    function clearedRatio() {
      const pixels = context!.getImageData(0, 0, canvas!.width, canvas!.height).data;
      let cleared = 0;
      for (let index = 3; index < pixels.length; index += 256) {
        if (pixels[index] === 0) cleared += 1;
      }
      return cleared / Math.max(1, (canvas!.width * canvas!.height) / 64);
    }

    function finish() {
      if (finished) return;
      finished = true;
      onReveal();
    }

    function onPointerDown(event: PointerEvent) {
      drawing = true;
      moved = false;
      last = point(event);
      scratch(last);
      try {
        canvas!.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is an enhancement; scratching still works without it.
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (!drawing || finished) return;
      event.preventDefault();
      moved = true;
      scratch(point(event));
      if (clearedRatio() >= 0.5) finish();
    }

    function onPointerUp() {
      if (!drawing || finished) return;
      drawing = false;
      last = null;
      if (!moved || clearedRatio() >= 0.5) finish();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [interactive, onReveal, revealed]);

  return (
    <div
      ref={stageRef}
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={revealed ? `Cashback ${formatScanPayINR(amount)}` : "Scratch to reveal cashback"}
      onKeyDown={(event) => {
        if (interactive && !revealed && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onReveal();
        }
      }}
      className={`scan-pay-scratch-card ${interactive ? "is-ready" : ""} ${revealed ? "is-revealed" : ""}`}
    >
      <div className="scan-pay-scratch-prize flex h-full flex-col items-center justify-center rounded-card text-center">
        <p className="font-display text-display font-bold text-pine-dark">
          {formatScanPayINR(amount)}
        </p>
        <p className="mt-1 type-section-title text-pine-primary">Cashback</p>
      </div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none rounded-card transition-opacity duration-500 ${revealed ? "pointer-events-none opacity-0" : interactive ? "opacity-100" : "pointer-events-none opacity-100"}`}
        aria-hidden="true"
      />
    </div>
  );
}

function paintScratchAsset(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.clearRect(0, 0, width, height);
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
  paintScratchTitle(context, width);
}

function paintScratchTitle(
  context: CanvasRenderingContext2D,
  width: number,
) {
  context.globalAlpha = 1;
  context.textAlign = "center";
  context.fillStyle = colors.pineDark;
  context.font = "700 22px 'PP Telegraf', 'Lato', sans-serif";
  context.fillText("You Got a", width / 2, 42);
  context.fillText("Scratch Card", width / 2, 68);
}

function paintScratchCover(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.globalCompositeOperation = "source-over";
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.mintSoft);
  gradient.addColorStop(0.55, colors.mint);
  gradient.addColorStop(1, colors.success);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  paintScratchTitle(context, width);

  context.fillStyle = colors.mintSoft;
  context.fillRect(width * 0.18, height * 0.55, width * 0.64, height * 0.28);
  context.fillStyle = colors.white;
  context.globalAlpha = 0.5;
  context.fillRect(width * 0.45, height * 0.5, width * 0.1, height * 0.38);
  context.fillRect(width * 0.14, height * 0.62, width * 0.72, height * 0.1);
  context.globalAlpha = 1;

  for (let index = 0; index < 18; index += 1) {
    const x = ((index * 47) % Math.max(1, width - 20)) + 10;
    const y = ((index * 71) % Math.max(1, height - 20)) + 10;
    context.fillStyle = colors.white;
    context.globalAlpha = 0.34;
    context.fillRect(x, y, 3, 3);
  }
  context.globalAlpha = 1;
}
