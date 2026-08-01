# Claims Assistant

Mobile-only Next.js chatbot for tax-benefit reimbursements and vehicle registration.

## Live site

[https://pai45.github.io/claim/](https://pai45.github.io/claim/)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating assistant replies

Edit [`lib/assistant/replies.ts`](lib/assistant/replies.ts) to change intents, keywords, and generic replies. The assistant runs in the browser so the app remains compatible with GitHub Pages.

## On-device policy answers

Policy questions are matched against the structured records in
[`features/policy/constants.ts`](features/policy/constants.ts). On browsers with
WebGPU, the app lazily loads the Apache-2.0-licensed Qwen3 0.6B Instruct ONNX
model through Transformers.js. Its q4f16 weights are about 570 MB and are cached
after the first successful download. Questions and policy content stay in the
browser.

Browsers without WebGPU, interrupted model downloads, and devices without
enough memory automatically use a deterministic summary built from the same
policy record. A download that makes no progress for 30 seconds or takes longer
than three minutes also falls back automatically. Both paths render an app-owned
link to the complete policy page.

## Claims and dashboard answers

The assistant also answers questions about the local claims history and claims
dashboard records. It selects only the matching dashboard category, claim ID, or
status-filtered claims before prompting the on-device model. Unsupported model
output falls back to a summary calculated directly from the same records, and
the app renders the dashboard, history, or claim-details link separately.
