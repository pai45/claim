# Benefits Assistant

Mobile-only Next.js chatbot for tax-benefit reimbursements and vehicle registration.

## Live site

[https://pai45.github.io/claim/](https://pai45.github.io/claim/)

The GitHub Pages build is static. Generative answers use deterministic fallbacks there. For backend AI, run the app locally with Node (below).

The site is also an installable PWA: open it on a phone and choose "Add to Home
Screen" to launch it standalone, without browser chrome.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This starts the Next.js server, including `POST /api/assistant`. Policy and claims questions go through that route; the server loads the Apache-2.0 Qwen3 0.6B Instruct ONNX model (about 570 MB on first use, then cached on disk). No API keys or third-party accounts are required.

Production-style local run:

```bash
npm run build
npm start
```

## Updating assistant replies

Edit [`lib/assistant/replies.ts`](lib/assistant/replies.ts) to change intents, keywords, and generic replies.

## Backend policy / claims answers

Matching still uses the structured records in
[`features/policy/constants.ts`](features/policy/constants.ts) and the dashboard /
claims data. The browser calls `/api/assistant`; the server builds a grounded
prompt and runs the model with ONNX Runtime (CPU).

If the API is unavailable (static Pages host, model download failure, or a
timeout), the UI falls back to a deterministic summary from the same records.
Grounding checks still reject invented numbers and claim IDs.

## Static GitHub Pages build

```bash
npm run build:pages
```

This removes `app/api` for the export-only build. CI does the same before
deploying `./out` to Pages.

## Mobile app

[`mobile/`](mobile/) is an Expo app that presents the deployed site full-screen
in a WebView, so it installs as a real Android/iOS app.

```bash
cd mobile
npm install
npm start
```

Camera capture and file pickers only work on a physical device, not a simulator.

It loads [`SITE_URL`](mobile/src/siteBridge.ts) — the live Pages deployment —
so content changes ship through the normal CI with no app rebuild.

The shell stays deliberately thin. OCR, PDF parsing, WebGL backgrounds, and
chat persistence all keep running in the device browser engine exactly as they
do on the web. What the shell adds is native glue:

- External links open in the system browser; `blob:` previews stay in-app.
- Android back closes the chat overlay before leaving the page. The overlay is
  opened with `history.replaceState`, which fires no event, so
  [`mobile/src/siteBridge.ts`](mobile/src/siteBridge.ts) patches history to
  report hash changes to the shell.
- Camera and photo library permissions for bill and licence capture.
- An offline retry screen, and a reload if the WebView process is reaped.

### Building an APK

Needs a JDK and the Android SDK. Android Studio supplies both; point `JAVA_HOME`
at its bundled JBR.

```bash
cd mobile
npx expo prebuild -p android     # regenerates ./android from app.json
cd android
./gradlew assembleRelease
```

The APK lands in `mobile/android/app/build/outputs/apk/release/`.

`android/` is generated and gitignored — edit [`app.json`](mobile/app.json) and
re-run `prebuild` rather than editing native files directly.

The APK is ~70 MB because it carries native libraries for all four ABIs. The
`x86` and `x86_64` slices are ~31 MB of that and are only used by emulators, so
restricting the build to ARM roughly halves the download for real devices.

**This APK is signed with the shared Android debug keystore**, which is the
React Native template default. That is fine for sideloading onto your own
device, but Play Store uploads need a real keystore — see
[Signed APK](https://reactnative.dev/docs/signed-apk-android). Cloud builds via
`npx eas build -p android --profile preview` handle signing for you, at the cost
of an Expo account.

## Icons

App and PWA icons are generated, then committed:

```bash
node scripts/generate-icons.mjs
```

Re-run it after changing the mark or the brand colours in
[`lib/ui/colors.ts`](lib/ui/colors.ts).
