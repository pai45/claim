import { normalizeOcrText } from "./parseBill";
import {
  makerFromModel,
  makerModelDisplay,
  normalizeMaker,
  titleCase,
} from "@/lib/vehicle/makers";
import { repairRegNumber, tryParseRegNumber } from "@/lib/vehicle/regNumber";
import type { VehicleIdentity } from "@/lib/vehicle/types";

export type ParsedRc = VehicleIdentity & {
  /** Registration number as read off the document, canonicalised. */
  regNumber?: string;
  /** 0-1, from how many of the fields that matter were found. */
  confidence: number;
};

/**
 * RC layouts vary by state and by print run (smart card vs paper vs mParivahan
 * screenshot), so every field is matched two ways: value on the same line as
 * the label, and value on the line below it.
 */
function labelled(labels: string[], valuePattern: string): RegExp[] {
  const label = `(?:${labels.join("|")})`;
  return [
    new RegExp(`${label}\\s*[:.\\-]?\\s*(${valuePattern})`, "i"),
    new RegExp(`${label}\\s*[:.\\-]?\\s*\\n\\s*(${valuePattern})`, "i"),
  ];
}

const TEXT_VALUE = "[A-Za-z0-9][A-Za-z0-9 .&'\\-/()]{1,44}";
const DATE_VALUE = "\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}";

const MAKER_LABELS = [
  "maker'?s?\\s*name",
  "manufacturer'?s?\\s*name",
  "manufacturer",
  "mfr\\.?\\s*name",
  "makers?",
  "mfg\\.?\\s*by",
];

const MODEL_LABELS = [
  "maker'?s?\\s*(?:class(?:ification)?|model)",
  "model\\s*name",
  "vehicle\\s*model",
  "model",
];

const FUEL_LABELS = ["fuel\\s*(?:used|type)?", "type\\s*of\\s*fuel"];

const CLASS_LABELS = [
  "vehicle\\s*class",
  "class\\s*of\\s*vehicle",
  "veh\\.?\\s*class",
];

const CHASSIS_LABELS = ["chassis\\s*(?:no|number)?", "ch\\.?\\s*no"];
const ENGINE_LABELS = ["engine\\s*(?:no|number)?", "eng\\.?\\s*no"];
const OWNER_LABELS = [
  "owner'?s?\\s*name",
  "name\\s*of\\s*owner",
  "registered\\s*owner",
];
const REGN_DATE_LABELS = [
  "date\\s*of\\s*regn?\\.?",
  "regn?\\.?\\s*date",
  "date\\s*of\\s*registration",
];
const INSURANCE_LABELS = [
  "insurance\\s*(?:valid|upto|up\\s*to|expiry)[^\\n:]*",
  "valid\\s*upto\\s*\\(insurance\\)",
];
const PUC_LABELS = ["puc(?:c)?\\s*(?:valid|upto|up\\s*to|expiry)[^\\n:]*"];

const REG_NUMBER_LABELS = [
  "regn?\\.?\\s*(?:no|number)",
  "registration\\s*(?:no|number)",
  "vehicle\\s*(?:no|number)",
];

/** Label words that leak into a captured value when OCR drops the separator. */
const VALUE_NOISE =
  /^(?:name|no|number|type|class|used|date|of|the|is|a)\b[\s:.\-]*/i;

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim();
    if (!value) continue;
    const cleaned = value.replace(VALUE_NOISE, "").replace(/\s+/g, " ").trim();
    if (cleaned.length >= 2) return cleaned;
  }
  return undefined;
}

function pickFuel(text: string): string | undefined {
  const raw = firstMatch(text, labelled(FUEL_LABELS, "[A-Za-z /+]{3,20}"));
  const haystack = (raw ?? text).toLowerCase();

  // Order matters: "petrol/cng" and "petrol/hybrid" should not read as plain petrol
  if (/\bcng\b/.test(haystack)) return /petrol/.test(haystack) ? "Petrol + CNG" : "CNG";
  if (/\blpg\b/.test(haystack)) return "LPG";
  if (/electric|\bev\b|battery/.test(haystack)) return "Electric";
  if (/hybrid/.test(haystack)) return "Hybrid";
  if (/diesel/.test(haystack)) return "Diesel";
  if (/petrol|gasoline/.test(haystack)) return "Petrol";
  return raw ? titleCase(raw) : undefined;
}

function pickRegNumber(text: string): string | undefined {
  const laBelled = firstMatch(
    text,
    labelled(REG_NUMBER_LABELS, "[A-Z0-9][A-Z0-9 \\-]{5,13}"),
  );
  if (laBelled) {
    const repaired = repairRegNumber(laBelled);
    if (repaired) return repaired;
  }

  // Fall back to the first plate-shaped token anywhere in the document
  const candidates = text.match(/\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,3}[\s-]?\d{1,4}\b/g);
  for (const candidate of candidates ?? []) {
    const parsed = tryParseRegNumber(candidate);
    if (parsed) return parsed.normalized;
  }
  return undefined;
}

/**
 * The model line often carries the maker too ("MARUTI SUZUKI ALTO 800 LXI").
 * Strip a leading maker so the two fields don't duplicate each other.
 */
function splitModel(model: string, maker?: string): string {
  if (!maker) return model;
  const pattern = new RegExp(`^${maker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
  const stripped = model.replace(pattern, "").trim();
  return stripped.length >= 2 ? stripped : model;
}

export function parseRc(rawText: string): ParsedRc {
  const text = normalizeOcrText(rawText);

  const regNumber = pickRegNumber(text);
  const rawMaker = firstMatch(text, labelled(MAKER_LABELS, TEXT_VALUE));
  const rawModel = firstMatch(text, labelled(MODEL_LABELS, TEXT_VALUE));

  let maker = normalizeMaker(rawMaker);
  const modelCandidate = rawModel ? titleCase(rawModel) : undefined;

  // If the maker line was unreadable, the model name often gives it away
  if (!maker) maker = makerFromModel(rawModel) ?? makerFromModel(text);

  const model = modelCandidate ? splitModel(modelCandidate, maker) : undefined;

  const identity: ParsedRc = {
    regNumber,
    maker,
    model,
    makerModel: makerModelDisplay(maker, model),
    fuel: pickFuel(text),
    vehicleClass: firstMatch(text, labelled(CLASS_LABELS, TEXT_VALUE)),
    registrationDate: firstMatch(text, labelled(REGN_DATE_LABELS, DATE_VALUE)),
    chassisNumber: firstMatch(
      text,
      labelled(CHASSIS_LABELS, "[A-Z0-9]{6,25}"),
    )?.toUpperCase(),
    engineNumber: firstMatch(
      text,
      labelled(ENGINE_LABELS, "[A-Z0-9]{5,25}"),
    )?.toUpperCase(),
    ownerName: firstMatch(text, labelled(OWNER_LABELS, "[A-Za-z][A-Za-z .]{2,44}")),
    insuranceValidTo: firstMatch(text, labelled(INSURANCE_LABELS, DATE_VALUE)),
    pucValidTo: firstMatch(text, labelled(PUC_LABELS, DATE_VALUE)),
    confidence: 0,
  };

  return { ...identity, confidence: scoreRc(identity) };
}

/** Weighted towards the fields the flow actually needs to confirm a vehicle. */
function scoreRc(rc: ParsedRc): number {
  const weights: [keyof ParsedRc, number][] = [
    ["maker", 0.3],
    ["model", 0.25],
    ["regNumber", 0.2],
    ["fuel", 0.1],
    ["chassisNumber", 0.05],
    ["engineNumber", 0.05],
    ["registrationDate", 0.05],
  ];
  const total = weights.reduce(
    (sum, [field, weight]) => (rc[field] ? sum + weight : sum),
    0,
  );
  return Math.round(total * 100) / 100;
}
