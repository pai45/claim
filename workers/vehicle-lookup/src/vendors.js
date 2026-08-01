/**
 * Vendor adapters. Each turns a registration number into the one normalised
 * shape the app consumes, so swapping vendors never touches the frontend.
 *
 * Every adapter returns:
 *   { maker, model, makerModel, fuel, vehicleClass, registrationDate,
 *     chassisNumber, engineNumber, ownerName, insuranceValidTo, pucValidTo,
 *     rcStatus }
 *
 * A `null` return means "no record for this vehicle" (a 404-equivalent), which
 * the Worker reports as not_found rather than as an outage.
 */

/** RC data is all-caps; keep short badges (LXI, SX, 4X4, XUV700) uppercase. */
function titleCase(value) {
  if (!value) return undefined;
  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => {
      const isUpper = token === token.toUpperCase() && /[A-Z]/.test(token);
      const letters = token.replace(/[^A-Za-z]/g, "");
      if (isUpper && (letters.length <= 3 || /\d/.test(token))) return token;
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
}

const MAKER_ALIASES = [
  ["Maruti Suzuki", ["maruti suzuki", "maruti udyog", "maruti"]],
  ["Hyundai", ["hyundai"]],
  ["Tata Motors", ["tata motors", "tata"]],
  ["Mahindra", ["mahindra"]],
  ["Toyota", ["toyota kirloskar", "toyota"]],
  ["Honda", ["honda"]],
  ["Kia", ["kia"]],
  ["MG Motor", ["mg motor", "morris garages"]],
  ["Renault", ["renault"]],
  ["Nissan", ["nissan"]],
  ["Volkswagen", ["volkswagen"]],
  ["Skoda", ["skoda"]],
  ["Ford", ["ford"]],
  ["Mercedes-Benz", ["mercedes"]],
  ["BMW", ["bmw"]],
  ["Audi", ["audi"]],
  ["Hero MotoCorp", ["hero motocorp", "hero honda", "hero"]],
  ["Bajaj", ["bajaj"]],
  ["TVS", ["tvs"]],
  ["Royal Enfield", ["royal enfield"]],
  ["Yamaha", ["yamaha"]],
  ["Ather", ["ather"]],
  ["Ola Electric", ["ola electric"]],
];

function normalizeMaker(raw) {
  if (!raw) return undefined;
  const cleaned = String(raw).toLowerCase().replace(/[^a-z& ]/g, " ").replace(/\s+/g, " ").trim();
  for (const [display, aliases] of MAKER_ALIASES) {
    const sorted = [...aliases].sort((a, b) => b.length - a.length);
    if (sorted.some((alias) => cleaned.includes(alias))) return display;
  }
  return titleCase(String(raw).replace(/\b(pvt|private|ltd|limited|india|inc|corp)\b\.?/gi, "").trim());
}

function normalizeFuel(raw) {
  if (!raw) return undefined;
  const value = String(raw).toLowerCase();
  if (value.includes("cng")) return value.includes("petrol") ? "Petrol + CNG" : "CNG";
  if (value.includes("lpg")) return "LPG";
  if (/electric|\bev\b|battery/.test(value)) return "Electric";
  if (value.includes("hybrid")) return "Hybrid";
  if (value.includes("diesel")) return "Diesel";
  if (value.includes("petrol")) return "Petrol";
  return titleCase(raw);
}

/** Vendors differ on whether `model` already includes the maker. */
function buildIdentity({ maker, model, ...rest }) {
  const cleanMaker = normalizeMaker(maker);
  let cleanModel = titleCase(model);

  if (cleanMaker && cleanModel) {
    const stripped = cleanModel.replace(new RegExp(`^${cleanMaker}\\s+`, "i"), "").trim();
    if (stripped.length >= 2) cleanModel = stripped;
  }

  const makerModel =
    cleanMaker && cleanModel
      ? cleanModel.toLowerCase().includes(cleanMaker.toLowerCase())
        ? cleanModel
        : `${cleanMaker} ${cleanModel}`
      : cleanMaker || cleanModel;

  return {
    maker: cleanMaker,
    model: cleanModel,
    makerModel,
    fuel: normalizeFuel(rest.fuel),
    vehicleClass: titleCase(rest.vehicleClass),
    registrationDate: rest.registrationDate || undefined,
    chassisNumber: rest.chassisNumber ? String(rest.chassisNumber).toUpperCase() : undefined,
    engineNumber: rest.engineNumber ? String(rest.engineNumber).toUpperCase() : undefined,
    ownerName: titleCase(rest.ownerName),
    insuranceValidTo: rest.insuranceValidTo || undefined,
    pucValidTo: rest.pucValidTo || undefined,
    rcStatus: rest.rcStatus || undefined,
  };
}

/** https://www.cashfree.com/docs/api-reference/vrs/v2/vehicle-rc */
async function cashfree(regNumber, env) {
  const base = env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

  const response = await fetch(`${base}/verification/vehicle-rc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": env.CASHFREE_CLIENT_ID,
      "x-client-secret": env.CASHFREE_CLIENT_SECRET,
    },
    body: JSON.stringify({
      verification_id: `rc-${regNumber}-${Date.now()}`,
      vehicle_number: regNumber,
    }),
  });

  if (response.status === 404 || response.status === 422) return null;
  if (!response.ok) throw new Error(`cashfree ${response.status}`);

  const data = await response.json();
  if (data.status && String(data.status).toUpperCase() === "INVALID") return null;

  return buildIdentity({
    maker: data.vehicle_manufacturer_name,
    model: data.model,
    fuel: data.type,
    vehicleClass: data.vehicle_category,
    registrationDate: data.reg_date,
    chassisNumber: data.chassis,
    engineNumber: data.engine,
    ownerName: data.owner,
    insuranceValidTo: data.vehicle_insurance_upto,
    pucValidTo: data.pucc_upto,
    rcStatus: data.rc_status || data.status,
  });
}

/** https://surepass.io/vehicle-rc-verification-api/ */
async function surepass(regNumber, env) {
  const base = env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io";

  const response = await fetch(`${base}/api/v1/rc/rc-full`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SUREPASS_TOKEN}`,
    },
    body: JSON.stringify({ id_number: regNumber }),
  });

  if (response.status === 404 || response.status === 422) return null;
  if (!response.ok) throw new Error(`surepass ${response.status}`);

  const body = await response.json();
  const data = body?.data;
  if (!data) return null;

  return buildIdentity({
    maker: data.maker_description,
    model: data.maker_model,
    fuel: data.fuel_type,
    vehicleClass: data.vehicle_category_description || data.vehicle_category,
    registrationDate: data.registration_date,
    chassisNumber: data.vehicle_chasi_number,
    engineNumber: data.vehicle_engine_number,
    ownerName: data.owner_name,
    insuranceValidTo: data.insurance_upto,
    pucValidTo: data.pucc_upto,
    rcStatus: data.rc_status,
  });
}

/**
 * Escape hatch for any other vendor. Point CUSTOM_URL at the endpoint and map
 * its field names with CUSTOM_FIELD_MAP, a JSON object of
 * { normalisedName: "dotted.path.in.their.response" }.
 */
async function custom(regNumber, env) {
  const response = await fetch(env.CUSTOM_URL, {
    method: env.CUSTOM_METHOD || "POST",
    headers: {
      "Content-Type": "application/json",
      ...JSON.parse(env.CUSTOM_HEADERS || "{}"),
    },
    body: JSON.stringify({
      [env.CUSTOM_REQUEST_FIELD || "vehicle_number"]: regNumber,
    }),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`custom ${response.status}`);

  const data = await response.json();
  const map = JSON.parse(env.CUSTOM_FIELD_MAP || "{}");
  const read = (path) =>
    path ? path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), data) : undefined;

  const identity = buildIdentity({
    maker: read(map.maker),
    model: read(map.model),
    fuel: read(map.fuel),
    vehicleClass: read(map.vehicleClass),
    registrationDate: read(map.registrationDate),
    chassisNumber: read(map.chassisNumber),
    engineNumber: read(map.engineNumber),
    ownerName: read(map.ownerName),
    insuranceValidTo: read(map.insuranceValidTo),
    pucValidTo: read(map.pucValidTo),
    rcStatus: read(map.rcStatus),
  });

  return identity.maker || identity.model ? identity : null;
}

export const VENDORS = { cashfree, surepass, custom };
