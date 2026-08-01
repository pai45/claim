# Vehicle lookup proxy

Turns a registration number into make/model by querying a VAHAN-backed vendor,
so the app can identify a vehicle from the number alone.

The app is a static export (`output: "export"` in `next.config.ts`), so it has
no server routes. This Worker is where the vendor credential lives. Putting the
key in the frontend would publish it in the JS bundle, and RC lookups are billed
per call.

## Why a proxy and not a direct call

- **The key stays secret.** Nothing in the browser bundle can bill your account.
- **Results are cached in KV for 30 days.** During a claim the same plate gets
  checked repeatedly; you pay for the first lookup only. Misses are cached for
  24h too, so a typo'd plate can't be retried in a loop at your expense.
- **Origin and rate limits are enforced.** Without them a public endpoint is a
  free RC lookup service that you fund.

## Setup

```bash
cd workers/vehicle-lookup
npm install -g wrangler        # if you don't have it

# 1. Create the cache namespace, then paste the id into wrangler.toml
npx wrangler kv namespace create VEHICLE_CACHE

# 2. Add your vendor credentials (never commit these)
npx wrangler secret put CASHFREE_CLIENT_ID
npx wrangler secret put CASHFREE_CLIENT_SECRET

# 3. Point ALLOWED_ORIGINS at your deployed site in wrangler.toml, then
npx wrangler deploy
```

Set the resulting URL in the app's environment:

```
NEXT_PUBLIC_VEHICLE_API_URL=https://vehicle-lookup.<your-subdomain>.workers.dev
```

Leave it unset and the app falls back to RTO decoding plus RC scanning — the
flow still works, it just asks for the RC instead of resolving the model itself.

## Switching vendors

Set `VENDOR` in `wrangler.toml` to `cashfree`, `surepass`, or `custom`.
Adapters live in `src/vendors.js` and all return the same normalised shape, so
the frontend never changes.

For a vendor without an adapter, use `custom` and describe its API with vars:

```toml
[vars]
VENDOR = "custom"
CUSTOM_URL = "https://api.example.com/v1/rc"
CUSTOM_REQUEST_FIELD = "vehicle_number"
CUSTOM_HEADERS = '{"Authorization":"Bearer ..."}'   # prefer a secret
CUSTOM_FIELD_MAP = '{"maker":"data.maker_description","model":"data.maker_model","fuel":"data.fuel_type","ownerName":"data.owner_name","registrationDate":"data.registration_date"}'
```

`CUSTOM_FIELD_MAP` maps our field names to dotted paths in their response.

## Contract

```
POST /
{ "regNumber": "MH01AB1234" }

200 { "ok": true, "vehicle": { "makerModel": "Maruti Suzuki Alto 800 LXI", ... } }
200 { "ok": false, "error": "not_found",      "message": "..." }
200 { "ok": false, "error": "upstream_error", "message": "..." }
429 { "ok": false, "error": "rate_limited",   "message": "..." }
```

Upstream failures return 200 with `ok: false` so the app can degrade to the RC
scan path rather than surfacing a network error.

## Cost note

Every uncached lookup is billed by the vendor (roughly ₹1.4–₹3). The cache and
rate limit are the main defences. Start with `CASHFREE_ENV = "sandbox"` while
integrating — sandbox returns fixture data and is not billed.
