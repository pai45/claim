# Claims Assistant

Mobile-only Next.js chatbot for tax-benefit reimbursements and vehicle registration.

## Live site

[https://pai45.github.io/claim/](https://pai45.github.io/claim/)

The GitHub Pages build is static. Generative answers use deterministic fallbacks there. For backend AI, run the app locally with Node (below).

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
