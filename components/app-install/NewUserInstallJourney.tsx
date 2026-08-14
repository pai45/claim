"use client";

import { useEffect, useReducer, type ReactNode } from "react";
import { PlusPayWordmark } from "@/components/login/PlusPayWordmark";
import { AppShell } from "@/components/shared/AppShell";
import {
  APP_DOWNLOAD_DURATION_MS,
  APP_SPLASH_DURATION_MS,
  initialInstallJourneyState,
  installJourneyReducer,
} from "@/features/app-install/controller";
import "./nativeInstallMocks.css";
import "./newUserInstallJourney.css";

type NewUserInstallJourneyProps = {
  onComplete: () => void;
};

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.PlusPay.app";
const APP_STORE_URL =
  "https://apps.apple.com/in/app/PlusPay-payments-disbursals/id1584941705";

function ArrowBackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="wa-verified" aria-label="Verified business">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="m6 10 2.5 2.5L14.5 7" />
      </svg>
    </span>
  );
}

function PlusPayAppIcon({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`install-app-icon${compact ? " is-compact" : ""}`}>
      <PlusPayWordmark />
    </div>
  );
}

function WhatsAppHeaderIcon({ children }: { children: ReactNode }) {
  return <span className="wa-header-icon">{children}</span>;
}

function WhatsAppMock({ onOpenStore }: { onOpenStore: () => void }) {
  return (
    <AppShell variant="surface" className="install-wa-screen login-viewport">
      <header className="wa-header">
        <WhatsAppHeaderIcon>
          <ArrowBackIcon />
        </WhatsAppHeaderIcon>
        <PlusPayAppIcon compact />
        <div className="wa-contact">
          <div className="wa-contact-name">
            <h1>PlusPay</h1>
            <VerifiedBadge />
          </div>
          <p>Business account</p>
        </div>
        <WhatsAppHeaderIcon>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7.2A2.2 2.2 0 0 1 6.2 5h7.6A2.2 2.2 0 0 1 16 7.2v9.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 16.8V7.2Z" />
            <path d="m16 10 4-2v8l-4-2" />
          </svg>
        </WhatsAppHeaderIcon>
        <WhatsAppHeaderIcon>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.2 3.8 10 8 8.2 9.8c1.2 2.7 3.3 4.8 6 6l1.8-1.9 4.2 2.8-.7 3.1c-.2.8-.9 1.3-1.7 1.2C9.8 20.2 3.8 14.2 3 6.4c-.1-.8.4-1.5 1.2-1.7l3-.9Z" />
          </svg>
        </WhatsAppHeaderIcon>
        <WhatsAppHeaderIcon>
          <MoreIcon />
        </WhatsAppHeaderIcon>
      </header>

      <main className="wa-chat-wallpaper">
        <div className="wa-encryption-note">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M6.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
            <rect x="4.5" y="8" width="11" height="8" rx="2" />
          </svg>
          Messages are end-to-end encrypted. No one outside of this chat can
          read them.
        </div>
        <p className="wa-day-chip">Today</p>

        <article className="wa-message-bubble animate-rise-in">
          <div className="wa-message-banner">
            <div className="wa-message-brand">
              <PlusPayWordmark />
            </div>
          </div>

          <p className="wa-message-title">🌟 Welcome, Pine Labs Team! 🌟</p>
          <p>
            Your corporate payments and claims just got easier with the PlusPay
            App!
          </p>
          <p>
            To access the PlusPay platform, login via OTP received on your
            official mail.
          </p>
          <p>
            Kickstart your seamless and hassle-free payment journey today by
            making your transactions directly through the PlusPay application!
            🚀
          </p>
          <p className="wa-message-label">📲 Download the app now:</p>
          <button type="button" onClick={onOpenStore} className="wa-store-link">
            🔹 Android: {PLAY_STORE_URL}
          </button>
          <a className="wa-store-link" href={APP_STORE_URL}>
            🔹 iOS: {APP_STORE_URL}
          </a>
          <div className="wa-message-features">
            <p className="wa-message-label">✨ Key Features:</p>
            <p>✅ Easy payment processing</p>
            <p>✅ 24x7 support</p>
            <p>✅ Dedicated Customer Manager</p>
          </div>
          <div className="wa-message-help">
            <p className="wa-message-label">📞 Need Help?</p>
            <p>Helpdesk: +91 011 4084 4899 | ✉️pinelabs@PlusPayapp.com</p>
            <p>Divyansh Madan 8218300623</p>
            <p>Karan Sharma 9650716076</p>
            <p>Rahul Arora 9999392526</p>
          </div>
          <p>👉 Download the app &amp; start transacting today!</p>
          <p>– Team PlusPay</p>
          <time className="wa-message-time">10:24 AM</time>
        </article>
      </main>

      <footer className="wa-composer-bar">
        <div className="wa-composer">
          <span className="wa-composer-emoji" aria-hidden="true">☺</span>
          <span className="wa-composer-placeholder">Message</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m20.5 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.3-8.3a3.5 3.5 0 0 1 5 5l-8.3 8.3a2 2 0 0 1-2.8-2.8l7.7-7.7" />
          </svg>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <span className="wa-mic" aria-label="Voice message">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
          </svg>
        </span>
      </footer>
    </AppShell>
  );
}

type PlayStoreMockProps = {
  phase: "store" | "downloading" | "installed";
  progress: number;
  onBack: () => void;
  onInstall: () => void;
  onOpen: () => void;
};

function PlayStoreToolbarIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="play-toolbar-icon" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function PlayStoreMock({
  phase,
  progress,
  onBack,
  onInstall,
  onOpen,
}: PlayStoreMockProps) {
  const isDownloading = phase === "downloading";
  const isInstalled = phase === "installed";

  return (
    <AppShell variant="surface" className="install-play-screen login-viewport">
      <header className="play-toolbar">
        <PlayStoreToolbarIcon label="Back to PlusPay message" onClick={onBack}>
          <ArrowBackIcon />
        </PlayStoreToolbarIcon>
        <div className="play-toolbar-spacer" />
        <PlayStoreToolbarIcon label="Search">
          <SearchIcon />
        </PlayStoreToolbarIcon>
        <PlayStoreToolbarIcon label="More options">
          <MoreIcon />
        </PlayStoreToolbarIcon>
      </header>

      <main className="play-content">
        <section className="play-app-hero animate-rise-in">
          <PlusPayAppIcon />
          <div className="play-app-copy">
            <h1>PlusPay</h1>
            <p className="play-developer">Pine Labs</p>
            <p className="play-subtitle">Contains ads · In-app purchases</p>
          </div>
        </section>

        <section className="play-stats" aria-label="App information">
          <div>
            <strong>4.8 ★</strong>
            <span>12K reviews</span>
          </div>
          <div>
            <strong>100K+</strong>
            <span>Downloads</span>
          </div>
          <div>
            <strong className="play-age-rating">3+</strong>
            <span>Rated for 3+</span>
          </div>
        </section>

        <section className="play-install-area" aria-live="polite">
          <button
            type="button"
            className="play-install-button"
            disabled={isDownloading}
            onClick={isInstalled ? onOpen : onInstall}
          >
            {isInstalled
              ? "Open"
              : isDownloading
                ? `Installing… ${progress}%`
                : "Install"}
          </button>
          {isDownloading || isInstalled ? (
            <div
              className="play-progress-track"
              role={isDownloading ? "progressbar" : undefined}
              aria-label={isDownloading ? "PlusPay download progress" : undefined}
              aria-valuemin={isDownloading ? 0 : undefined}
              aria-valuemax={isDownloading ? 100 : undefined}
              aria-valuenow={isDownloading ? progress : undefined}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          <p className="play-protect-copy">
            {isInstalled ? "Installed and ready to use" : "Verified by Play Protect"}
          </p>
        </section>

        <section className="play-section">
          <div className="play-section-heading">
            <h2>About this app</h2>
            <span aria-hidden="true">→</span>
          </div>
          <p>
            PlusPay brings corporate payments, expense tracking, UPI, and
            employee benefits together in one secure app.
          </p>
          <div className="play-category-row">
            <span>Finance</span>
            <span>Payments</span>
          </div>
        </section>

        <section className="play-section play-rating-section">
          <div className="play-section-heading">
            <h2>Ratings and reviews</h2>
            <span aria-hidden="true">→</span>
          </div>
          <div className="play-rating-layout">
            <div className="play-rating-score">
              <strong>4.8</strong>
              <span>★★★★★</span>
              <small>12K reviews</small>
            </div>
            <div className="play-rating-bars" aria-hidden="true">
              {[92, 64, 24, 10, 6].map((width, index) => (
                <div key={width}>
                  <span>{5 - index}</span>
                  <i><b style={{ width: `${width}%` }} /></i>
                </div>
              ))}
            </div>
          </div>

          <div className="play-review-list">
            {[
              {
                name: "Ananya Sharma",
                initial: "A",
                rating: "★★★★★",
                date: "8 Aug 2026",
                review:
                  "Really useful for managing my work benefits and payments in one place. The app is quick and easy to understand.",
              },
              {
                name: "Rahul Verma",
                initial: "R",
                rating: "★★★★☆",
                date: "2 Aug 2026",
                review:
                  "A smooth payment experience. Wallet balances and recent expenses are clear, and UPI payments work well.",
              },
            ].map((review, index) => (
              <article className="play-review" key={review.name}>
                <header className="play-review-header">
                  <span className={`play-review-avatar is-${index + 1}`} aria-hidden="true">
                    {review.initial}
                  </span>
                  <strong>{review.name}</strong>
                  <span className="play-review-more" aria-hidden="true">
                    <MoreIcon />
                  </span>
                </header>
                <div className="play-review-meta">
                  <span aria-label={`${review.rating.length} out of 5 stars`}>
                    {review.rating}
                  </span>
                  <time>{review.date}</time>
                </div>
                <p>{review.review}</p>
                <div className="play-review-helpful">
                  <span>Was this review helpful?</span>
                  <div>
                    <button type="button">Yes</button>
                    <button type="button">No</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

/**
 * The wordmark inlined from `public/assets/login/pluspay-logo.svg`, in white.
 *
 * Inlined rather than drawn through `PlusPayWordmark` because the splash
 * animates each glyph on its own delay, which needs addressable paths, and
 * because a fetched logo would flash in against the dark field. Path order is
 * the source file's: the seven letters run left-to-right, then the `+` glyph.
 * Styles live in `newUserInstallJourney.css`.
 */
function PlusPaySplashWordmark() {
  return (
    <svg
      className="pp-splash-mark relative z-10"
      viewBox="0 0 400 132"
      fill="#fff"
      role="img"
      aria-label="pluspay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="pp-splash-letter"
        d="M16.0909 81.8251V112.544H0V34.3498H16.0909V42.6347C19.9091 36.3047 26.2727 32.5811 35.6364 32.5811C53.3636 32.5811 60.7273 46.1721 60.7273 62.2764C60.7273 78.3808 53.4545 91.9718 35.6364 91.9718C26.2727 91.9718 19.9091 88.1551 16.0909 81.8251ZM30.6364 79.0324C40.9091 79.0324 44.6364 73.8195 44.6364 62.2764C44.6364 50.7334 40.9091 45.5204 30.6364 45.5204C20.3636 45.5204 16.0909 50.9196 16.0909 62.2764C16.0909 73.6333 20.4545 79.0324 30.6364 79.0324Z"
      />
      <path className="pp-splash-letter" d="M68 12.0085H84.0909V90.2031H68V12.0085Z" />
      <path
        className="pp-splash-letter"
        d="M93.0909 68.5134V34.3498H109.182V66.0931C109.182 74.9365 113 78.4739 119.909 78.4739C128 78.4739 133 72.33 133 59.67V34.3498H149.091V90.2031H133V79.4979C129.636 86.945 123.545 91.9718 113.727 91.9718C99.4545 91.9718 93.0909 83.1283 93.0909 68.5134Z"
      />
      <path
        className="pp-splash-letter"
        d="M184.273 81.5458C191.545 81.5458 194.091 78.9393 194.091 75.0296C194.091 71.6784 192.545 69.2581 186.455 68.4203L174.273 66.8378C164 65.5346 158.455 59.9492 158.455 50.5472C158.455 38.1664 168.727 32.3018 183.182 32.3018C197.636 32.3018 207.818 38.2595 208.818 50.5472H193.909C193.364 45.9859 190 42.7278 183.182 42.7278C176.364 42.7278 173.364 45.4274 173.364 48.9647C173.364 51.7574 174.818 53.9915 180.273 54.6432L191.727 55.9464C204.727 57.622 209.636 63.3004 209.636 73.2609C209.636 84.2454 202.909 91.7856 184.091 91.7856C165.273 91.7856 157.364 82.3836 157.091 71.7715H171.818C172.273 77.1707 176.182 81.3597 184.364 81.3597L184.273 81.5458Z"
      />
      <path
        className="pp-splash-letter"
        d="M236 101.281V132H219.909V53.8054H236V62.0903C239.818 55.7602 246.182 52.0367 255.545 52.0367C273.273 52.0367 280.636 65.6276 280.636 81.732C280.636 97.8364 273.364 111.427 255.545 111.427C246.182 111.427 239.818 107.611 236 101.281ZM250.545 98.488C260.818 98.488 264.545 93.275 264.545 81.732C264.545 70.189 260.818 64.976 250.545 64.976C240.273 64.976 236 70.3752 236 81.732C236 93.0889 240.364 98.488 250.545 98.488Z"
      />
      <path
        className="pp-splash-letter"
        d="M284.818 94.8575C284.818 85.921 288.727 80.1495 302.818 77.6361L315.545 75.402C320.636 74.4711 322.273 73.0748 322.273 69.8166C322.273 65.9069 320.091 63.3004 312.818 63.3004C305.545 63.3004 302 66.2793 301.727 71.9577H286C286.364 60.0423 295.909 51.8505 312.636 51.8505C329.364 51.8505 337.273 59.1114 337.273 70.9337V95.0437C337.273 100.257 337.455 104.725 338 109.566H323.909C323.455 105.842 323.182 102.212 323.182 97.6502C320.636 105.377 314.091 111.055 302.909 111.055C291.727 111.055 284.818 104.818 284.818 94.7644V94.8575ZM308.455 99.7912C317 99.7912 322.273 93.4612 322.273 83.0353V80.6149C319.545 82.6629 316.727 83.4076 313.364 84.1523L308.818 85.2694C303 86.7588 300.727 88.8068 300.727 93.0889C300.727 97.5571 304 99.7912 308.455 99.7912Z"
      />
      <path
        className="pp-splash-letter"
        d="M342.364 118.781H363.364L367 108.635H357.727L339.091 53.8054H355.545L367.545 88.6206L370.364 97.7433L373 88.6206L384.636 53.8054H400L380.818 111.334C376.455 124.925 371.727 132 356 132H342.364V118.781Z"
      />
      <path
        className="pp-splash-plus"
        d="M198.727 21.5035C210.091 21.5035 219.273 12.1016 219.273 0.465444V0H227.364V21.5966H247.909V29.323C236.545 29.323 227.364 38.725 227.364 50.3611V50.6403H219.273V29.323H198.727V21.5035Z"
      />
    </svg>
  );
}

function SplashMock() {
  return (
    <AppShell variant="pine" className="login-viewport overflow-hidden">
      <main className="relative flex min-h-0 flex-1 items-center justify-center">
        <span className="pp-splash-glow" aria-hidden="true" />
        <PlusPaySplashWordmark />
      </main>
    </AppShell>
  );
}

export function NewUserInstallJourney({
  onComplete,
}: NewUserInstallJourneyProps) {
  const [state, dispatch] = useReducer(
    installJourneyReducer,
    initialInstallJourneyState,
  );

  useEffect(() => {
    if (state.phase !== "downloading") return;

    const startedAt = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const elapsedMs = now - startedAt;
      dispatch({ type: "sync-download", elapsedMs });
      if (elapsedMs < APP_DOWNLOAD_DURATION_MS) {
        frame = window.requestAnimationFrame(update);
      }
    };

    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "splash") return;
    const timer = window.setTimeout(onComplete, APP_SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete, state.phase]);

  if (state.phase === "whatsapp") {
    return <WhatsAppMock onOpenStore={() => dispatch({ type: "open-store" })} />;
  }

  if (state.phase === "splash") return <SplashMock />;

  return (
    <PlayStoreMock
      phase={state.phase}
      progress={state.progress}
      onBack={() => dispatch({ type: "back-to-whatsapp" })}
      onInstall={() => dispatch({ type: "start-download" })}
      onOpen={() => dispatch({ type: "open-app" })}
    />
  );
}
