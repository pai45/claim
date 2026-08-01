import { VENDORS } from "./vendors.js";

/**
 * Proxy between the static app and a VAHAN-backed RC vendor.
 *
 * It exists for three reasons:
 *   1. The vendor key stays server-side. The app is a static export, so a key
 *      in the frontend would be readable by anyone — and it is billed per call.
 *   2. Lookups are cached. The same plate is often checked repeatedly during a
 *      claim, and vendors charge for every hit.
 *   3. Origin and rate limits are enforced here, so a scraped endpoint can't be
 *      turned into someone else's free RC lookup service.
 */

const REG_NUMBER = /^[A-Z0-9]{5,11}$/;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 60;

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin ?? "*",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

/** Only reflect an Origin we were configured to trust. */
function resolveOrigin(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const origin = request.headers.get("Origin");
  if (allowed.length === 0) return origin ?? "*";
  return origin && allowed.includes(origin) ? origin : null;
}

/**
 * Fixed-window limit keyed on client IP. KV is eventually consistent, so this
 * is a cost guard rather than an exact counter — good enough to stop a scraper
 * from burning the balance.
 */
async function overRateLimit(request, env) {
  if (!env.VEHICLE_CACHE) return false;

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const window = Math.floor(Date.now() / 1000 / RATE_WINDOW_SECONDS);
  const key = `rate:${ip}:${window}`;

  const current = Number((await env.VEHICLE_CACHE.get(key)) || 0);
  if (current >= RATE_LIMIT) return true;

  await env.VEHICLE_CACHE.put(key, String(current + 1), {
    expirationTtl: RATE_WINDOW_SECONDS * 2,
  });
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const origin = resolveOrigin(request, env);
    if (origin === null) return json({ ok: false, error: "forbidden_origin" }, 403, null);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: "bad_request" }, 400, origin);
    }

    const regNumber = String(payload?.regNumber ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!REG_NUMBER.test(regNumber)) {
      return json(
        { ok: false, error: "invalid_reg_number", message: "That isn't a valid vehicle number." },
        400,
        origin,
      );
    }

    if (await overRateLimit(request, env)) {
      return json(
        { ok: false, error: "rate_limited", message: "Too many lookups. Try again in a minute." },
        429,
        origin,
      );
    }

    const cacheKey = `rc:${regNumber}`;

    if (env.VEHICLE_CACHE) {
      const cached = await env.VEHICLE_CACHE.get(cacheKey, "json");
      // Negative results are cached too, so repeated misses don't cost money
      if (cached) {
        return cached.notFound
          ? json({ ok: false, error: "not_found", message: "No record found for that vehicle number." }, 200, origin)
          : json({ ok: true, vehicle: cached, cached: true }, 200, origin);
      }
    }

    const vendorName = env.VENDOR || "cashfree";
    const vendor = VENDORS[vendorName];
    if (!vendor) return json({ ok: false, error: "vendor_not_configured" }, 500, origin);

    let vehicle;
    try {
      vehicle = await vendor(regNumber, env);
    } catch (err) {
      console.error("vendor lookup failed", vendorName, err?.message);
      return json(
        { ok: false, error: "upstream_error", message: "The RTO lookup service is unavailable right now." },
        200,
        origin,
      );
    }

    if (!vehicle) {
      if (env.VEHICLE_CACHE) {
        ctx.waitUntil(
          env.VEHICLE_CACHE.put(cacheKey, JSON.stringify({ notFound: true }), {
            expirationTtl: 60 * 60 * 24,
          }),
        );
      }
      return json(
        { ok: false, error: "not_found", message: "No record found for that vehicle number." },
        200,
        origin,
      );
    }

    if (env.VEHICLE_CACHE) {
      ctx.waitUntil(
        env.VEHICLE_CACHE.put(cacheKey, JSON.stringify(vehicle), {
          expirationTtl: CACHE_TTL_SECONDS,
        }),
      );
    }

    return json({ ok: true, vehicle }, 200, origin);
  },
};
