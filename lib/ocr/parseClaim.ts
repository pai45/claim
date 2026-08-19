import { getEmployerBenefit } from "@/features/policy/constants";

export type ParsedClaimFields = {
  category?: string;
  vendor?: string;
  amount?: string;
  claimDate?: string;
  claimMonth?: string;
  invoiceNo?: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_HINTS: { category: string; keywords: string[] }[] = [
  {
    category: getEmployerBenefit("mobile").display.label,
    keywords: [
      "airtel",
      "jio",
      "broadband",
      "internet",
      "wifi",
      "fiber",
      "fibre",
      "bsnl",
      "act fibernet",
      "hathway",
    ],
  },
  {
    category: getEmployerBenefit("fuel").display.label,
    keywords: [
      "petrol",
      "diesel",
      "fuel",
      "indian oil",
      "hpcl",
      "bpcl",
      "essar",
      "reliance petroleum",
      "petrol pump",
    ],
  },
  {
    category: getEmployerBenefit("meal").display.label,
    keywords: [
      "restaurant",
      "cafe",
      "swiggy",
      "zomato",
      "food",
      "dining",
      "cinema",
      "pvr",
      "inox",
      "dominos",
      "mcdonald",
    ],
  },
  {
    category: getEmployerBenefit("professional").display.label,
    keywords: [
      "course",
      "training",
      "udemy",
      "coursera",
      "workshop",
      "seminar",
      "certification",
      "linkedin learning",
    ],
  },
  {
    category: getEmployerBenefit("books").display.label,
    keywords: ["book", "books", "journal", "periodical", "subscription"],
  },
];

const SKIP_VENDOR =
  /^(total|amount|tax|gst|cgst|sgst|igst|invoice|bill|receipt|date|time|tel|phone|www\.|http|thank|cash|card|qty|item|category|subtotal|discount|paid|balance|customer|address|pin|pincode|gstin|cin|pan|hsn|sac|page|original|duplicate|tax\s*invoice|cash\s*memo|retail\s*invoice|particulars|description|qty|rate|value)$/i;

const ADDRESSISH =
  /\b(?:road|rd\.?|street|st\.?|nagar|colony|sector|floor|near|opp\.?|opposite|india|state|district|pin\s*:?\s*\d{6})\b/i;

const TAXISH_AMOUNT_LABEL =
  /\b(?:cgst|sgst|igst|ugst|vat|cess|taxable|tax\s*amount|gst\s*amount|discount|round\s*off|convenience|delivery\s*fee|qty|quantity|rate|mrp|hsn)\b/i;

type Scored<T> = { value: T; score: number };

/** Fix common OCR noise before field extraction. */
export function normalizeOcrText(rawText: string): string {
  return rawText
    .replace(/\u20b9/g, "₹")
    .replace(/(?:^|[\s:])(?:¥|€|¢)\s*(?=\d)/gm, "₹")
    .replace(/[|]/g, " ")
    .replace(/\bR[5S8]\b\.?/gi, "Rs")
    .replace(/\b[8B]s\.?\b/g, "Rs")
    .replace(/\bINR\b/gi, "INR")
    .replace(/\bTota[l1I|]\b/gi, "Total")
    .replace(/\bArnount\b/gi, "Amount")
    .replace(/\bArnoun[t1]\b/gi, "Amount")
    .replace(/\blnvoice\b/gi, "Invoice")
    .replace(/\blnv\.?\b/gi, "Inv")
    .replace(/\bDa[t1]e\b/gi, "Date")
    .replace(/\bBi[l1]{2}\b/gi, "Bill")
    .replace(/\bR\s+s\.?\b/gi, "Rs")
    .replace(/\bI\s*N\s*R\b/gi, "INR")
    .replace(
      /((?:rs\.?|inr|₹|rupees?|total|amount|payable))(\s*)(\d{1,3})\s(\d{2,3})([.]\d{1,2})?/gi,
      (_, label, spaces, a, b, cents) =>
        `${label}${spaces}${a},${b}${cents ?? ""}`,
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num) || num <= 0 || num >= 1_000_000) return null;
  return num;
}

function looksLikeDate(value: string): boolean {
  return Boolean(
    value.match(/^\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4}$/) ||
      value.match(/^\d{4}[\/\-.\s]\d{1,2}[\/\-.\s]\d{1,2}$/) ||
      value.match(
        /^\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{2,4}$/i,
      ),
  );
}

function looksLikeMoney(value: string): boolean {
  if (looksLikeDate(value)) return false;
  if (/[a-z]/i.test(value.replace(/(?:rs\.?|inr|rupees?|₹)/gi, ""))) {
    return false;
  }
  const num = toNumber(value);
  if (num === null || num < 1) return false;
  // Years / long ids are not amounts
  if (/^\d{4}$/.test(value.replace(/[^\d]/g, "")) && num >= 2000 && num <= 2100) {
    return false;
  }
  return true;
}

function looksLikeInvoice(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 3 || cleaned.length > 28) return false;
  if (!/\d/.test(cleaned)) return false;
  if (looksLikeDate(value)) return false;
  // Decimal money belongs in Amount, not Invoice No
  if (/^\d{1,3}(?:,\d{2,3})*\.\d{1,2}$|^\d+\.\d{2}$/.test(value.trim())) {
    return false;
  }
  if (
    /^(TOTAL|DATE|DATED|AMOUNT|TAX|GST|CASH|CARD|BILL|INVOICE|RECEIPT|ORIGINAL|DUPLICATE|PAGE|ONLY|RUPEES?|CGST|SGST|IGST)$/i.test(
      cleaned,
    )
  ) {
    return false;
  }
  // GSTIN / PAN-like
  if (/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/i.test(cleaned)) return false;
  if (/^[A-Z]{5}\d{4}[A-Z]$/i.test(cleaned)) return false;
  // Phone numbers
  if (/^\d{10}$/.test(cleaned)) return false;
  return true;
}

function parseDateParts(raw: string): Date | null {
  const cleaned = raw.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  const monthName = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)[.]?\s+(\d{2,4})$/);
  if (monthName) {
    const day = Number(monthName[1]);
    const monthIndex = MONTH_NAMES.findIndex((name) =>
      name.toLowerCase().startsWith(monthName[2].toLowerCase().slice(0, 3)),
    );
    let year = Number(monthName[3]);
    if (year < 100) year += 2000;
    if (monthIndex >= 0 && day >= 1 && day <= 31) {
      return new Date(year, monthIndex, day);
    }
  }

  const iso = cleaned.match(/^(\d{4})[\/\-.\s](\d{1,2})[\/\-.\s](\d{1,2})$/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const dmy = cleaned.match(/^(\d{1,2})[\/\-.\s](\d{1,2})[\/\-.\s](\d{2,4})$/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    const first = Number(dmy[1]);
    const second = Number(dmy[2]);
    if (first > 12 && second <= 12) return new Date(year, second - 1, first);
    if (second > 12 && first <= 12) return new Date(year, first - 1, second);
    return new Date(year, second - 1, first);
  }

  return null;
}

function isSaneDate(date: Date): boolean {
  if (Number.isNaN(date.getTime())) return false;
  const year = date.getFullYear();
  const now = new Date();
  return year >= 2000 && year <= now.getFullYear() + 1;
}

function formatClaimDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const date = parseDateParts(raw);
  if (!date || !isSaneDate(date)) return raw;
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatClaimMonth(raw?: string): string | undefined {
  if (!raw) return undefined;
  const date = parseDateParts(raw);
  if (!date || !isSaneDate(date)) return undefined;
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDisplayAmount(amount?: string): string | undefined {
  if (!amount) return undefined;
  const num = toNumber(amount);
  if (num === null) return undefined;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function splitLabelValue(line: string): { label: string; value: string } | null {
  const colon = line.match(
    /^(.{2,40}?)\s*[:：\-]\s+(.{1,60})$/,
  );
  if (colon) {
    return { label: colon[1].trim(), value: colon[2].trim() };
  }

  // "Order #SW12345" / "Invoice #INV-9"
  const hashId = line.match(
    /^((?:invoice|inv\.?|bill|receipt|order|ref(?:erence)?))\s*#\s*([A-Z0-9][A-Z0-9\-\/]{2,})$/i,
  );
  if (hashId) {
    return { label: `${hashId[1]} #`, value: hashId[2].trim() };
  }

  // "Invoice No INV-123" / "Total Amount Rs 1,250"
  const spaced = line.match(
    /^((?:invoice|inv\.?|bill|receipt|order|ref(?:erence)?)\s*(?:no|number|#|num\.?)|(?:bill|invoice|txn|transaction|payment)?\s*date|dated?|grand\s*total|net\s*payable|amount\s*payable|total\s*amount|bill\s*amount|total|amount|amt\.?)\s+(.+)$/i,
  );
  if (spaced) {
    return { label: spaced[1].trim(), value: spaced[2].trim() };
  }

  return null;
}

function amountLabelScore(label: string): number {
  const l = label.toLowerCase().replace(/\s+/g, " ").trim();
  if (TAXISH_AMOUNT_LABEL.test(l)) return 0;
  if (/grand\s*total|net\s*payable|amount\s*payable|total\s*payable/.test(l)) {
    return 100;
  }
  if (/bill\s*amount|invoice\s*amount|total\s*amount|amount\s*due|balance\s*due|paid\s*amount|amount\s*paid/.test(l)) {
    return 90;
  }
  if (/^(total|amount|amt\.?)$/.test(l)) return 60;
  if (/total|amount|payable|amt/.test(l)) return 40;
  return 0;
}

function dateLabelScore(label: string): number {
  const l = label.toLowerCase().replace(/\s+/g, " ").trim();
  if (/bill\s*date|invoice\s*date|date\s*of\s*(?:invoice|bill|issue)/.test(l)) {
    return 100;
  }
  if (/^(dated?|txn\s*date|transaction\s*date|payment\s*date)$/.test(l)) {
    return 80;
  }
  if (/due\s*date|period|from|to\b/.test(l)) return 20;
  if (/date/.test(l)) return 50;
  return 0;
}

function invoiceLabelScore(label: string): number {
  const l = label.toLowerCase().replace(/\s+/g, " ").trim();
  // Do not treat "Invoice Amount" as an invoice-number label
  if (/amount|total|date|payable/.test(l)) return 0;
  if (/(?:invoice|inv\.?)\s*(?:no|number|#|num\.?)/.test(l)) return 100;
  if (/(?:bill|receipt)\s*(?:no|number|#|num\.?)/.test(l)) return 90;
  if (/(?:order|ref(?:erence)?)\s*(?:no|number|#|num\.?)/.test(l)) return 80;
  if (/^(invoice|inv\.?|bill|receipt|order)\s*#$/.test(l)) return 80;
  if (/^(invoice|inv\.?|bill|receipt|order)$/.test(l)) return 40;
  return 0;
}

function extractMoneyToken(value: string): string | undefined {
  const match = value.match(
    /(?:(?:rs\.?|inr|₹|rupees?)\s*)?(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
  );
  if (!match?.[1] || !looksLikeMoney(match[1])) return undefined;
  return match[1];
}

function extractDateToken(value: string): string | undefined {
  const patterns = [
    /\b(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})\b/,
    /\b(\d{4}[\/\-.\s]\d{1,2}[\/\-.\s]\d{1,2})\b/,
    /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{2,4})\b/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;
    const date = parseDateParts(match[1]);
    if (date && isSaneDate(date)) return match[1];
  }
  return undefined;
}

function extractInvoiceToken(value: string): string | undefined {
  const cleaned = value.replace(/^(?:no|number|#|num\.?)[.:\s#-]*/i, "").trim();
  const token =
    cleaned.match(/\b((?:INV|RCPT|TXN|ORD)[-/][A-Z0-9][-A-Z0-9\/]{2,})\b/i)?.[1] ??
    cleaned.match(/\b([A-Z0-9][A-Z0-9\-\/]{2,})\b/i)?.[1] ??
    cleaned;
  if (!looksLikeInvoice(token)) return undefined;
  return token.replace(/\s+/g, "").toUpperCase();
}

function pickBest<T>(items: Scored<T>[]): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((a, b) => (b.score > a.score ? b : a)).value;
}

function collectLabeledFields(lines: string[]): {
  amount?: string;
  claimDate?: string;
  invoiceNo?: string;
} {
  const amounts: Scored<string>[] = [];
  const dates: Scored<string>[] = [];
  const invoices: Scored<string>[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const next = lines[i + 1] ?? "";
    const parsed = splitLabelValue(line);

    const label = parsed?.label ?? line;
    const valueOnLine = parsed?.value ?? "";
    const valueNext = next.trim();

    const aScore = amountLabelScore(label);
    if (aScore > 0) {
      const money =
        extractMoneyToken(valueOnLine) ||
        (!valueOnLine ? extractMoneyToken(valueNext) : undefined);
      if (money) {
        const num = toNumber(money) ?? 0;
        // Prefer higher label priority, then larger amount among same-class labels
        amounts.push({ value: money, score: aScore * 1000 + num });
      }
    }

    const dScore = dateLabelScore(parsed?.label ?? "");
    if (dScore > 0) {
      const date =
        extractDateToken(valueOnLine) ||
        (!valueOnLine ? extractDateToken(valueNext) : undefined);
      if (date) dates.push({ value: date, score: dScore });
    }

    // Whole-line date labels like "Date 12/03/2026" without colon
    if (!parsed && /date|dated/i.test(line)) {
      const date = extractDateToken(line);
      if (date) dates.push({ value: date, score: dateLabelScore("date") });
    }

    const iScore = invoiceLabelScore(label);
    if (iScore > 0) {
      const invoice =
        extractInvoiceToken(valueOnLine) ||
        (!valueOnLine ? extractInvoiceToken(valueNext) : undefined);
      // Never treat a pure money token as invoice even if label was weak
      if (invoice && !looksLikeMoney(invoice)) {
        invoices.push({ value: invoice, score: iScore });
      } else if (invoice && iScore >= 90 && looksLikeInvoice(invoice)) {
        invoices.push({ value: invoice, score: iScore });
      }
    }
  }

  return {
    amount: pickBest(amounts),
    claimDate: pickBest(dates),
    invoiceNo: pickBest(invoices),
  };
}

function fallbackAmount(text: string, lines: string[]): string | undefined {
  const currency = [
    ...text.matchAll(
      /(?:rs\.?|inr|₹|rupees?)\s*(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi,
    ),
  ]
    .map((match) => match[1])
    .filter((raw) => looksLikeMoney(raw));

  if (currency.length > 0) {
    return currency
      .map((raw) => ({ raw, value: toNumber(raw) ?? 0 }))
      .reduce((a, b) => (b.value > a.value ? b : a)).raw;
  }

  const bottom = lines.slice(Math.floor(lines.length * 0.45));
  const nums: { raw: string; value: number }[] = [];
  for (const line of bottom) {
    if (TAXISH_AMOUNT_LABEL.test(line)) continue;
    if (/gstin|phone|mobile|tel|pin/i.test(line)) continue;
    for (const match of line.matchAll(
      /\b(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+\.\d{2})\b/g,
    )) {
      if (!looksLikeMoney(match[1])) continue;
      const value = toNumber(match[1]);
      if (value !== null && value >= 10) nums.push({ raw: match[1], value });
    }
  }
  if (nums.length === 0) return undefined;
  return nums.reduce((a, b) => (b.value > a.value ? b : a)).raw;
}

function fallbackDate(text: string): string | undefined {
  const labeled =
    text.match(
      /(?:bill\s*date|invoice\s*date|dated?|date)\s*[:\-.]?\s*(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{2,4})/i,
    )?.[1] ?? extractDateToken(text);
  if (!labeled) return undefined;
  const date = parseDateParts(labeled);
  if (!date || !isSaneDate(date)) return undefined;
  return labeled;
}

function fallbackInvoice(text: string): string | undefined {
  const match =
    text.match(
      /(?:invoice|inv\.?|bill|receipt|order)\s*(?:no|number|num\.?)[.:\s#-]+([A-Z0-9][A-Z0-9\-\/]{2,})/i,
    )?.[1] ??
    text.match(
      /(?:invoice|inv\.?|bill|receipt|order)\s*#\s*([A-Z0-9][A-Z0-9\-\/]{2,})/i,
    )?.[1] ??
    text.match(/\b((?:INV|RCPT|TXN|ORD)[-/][A-Z0-9][-A-Z0-9\/]{2,})\b/i)?.[1];
  if (!match || !looksLikeInvoice(match)) return undefined;
  return match.replace(/\s+/g, "").toUpperCase();
}

function pickVendor(lines: string[]): string | undefined {
  const candidates: string[] = [];

  for (const line of lines.slice(0, 12)) {
    if (SKIP_VENDOR.test(line)) continue;
    if (ADDRESSISH.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (/^[A-Z0-9]{10,15}$/i.test(line)) continue;
    if (/\bgstin\b/i.test(line)) continue;
    if (looksLikeDate(line)) continue;
    if (/(?:rs\.?|inr|₹|rupees?)\s*\d/i.test(line)) continue;
    if (amountLabelScore(line) > 0 && extractMoneyToken(line)) continue;
    if ((line.match(/[a-zA-Z]/g) ?? []).length < 3) continue;
    if ((line.match(/\d/g) ?? []).length > line.length * 0.45) continue;
    candidates.push(line.replace(/^[\-*:#.\s]+|[\-*:#.\s]+$/g, ""));
  }

  const ranked = [...candidates].sort((a, b) => {
    const score = (line: string) => {
      let s = 0;
      if (line === line.toUpperCase()) s += 2;
      if (
        /\b(pvt|ltd|limited|clinic|hospital|pharmacy|store|cafe|restaurant|hotel|motors|petroleum)\b/i.test(
          line,
        )
      ) {
        s += 3;
      }
      if (line.length >= 6 && line.length <= 40) s += 1;
      return s;
    };
    return score(b) - score(a);
  });

  return ranked[0];
}

function pickCategory(text: string, vendor?: string): string {
  const haystack = `${vendor ?? ""} ${text}`.toLowerCase();
  for (const hint of CATEGORY_HINTS) {
    if (hint.keywords.some((keyword) => haystack.includes(keyword))) {
      return hint.category;
    }
  }
  return "Other / HR review";
}

/**
 * Guardrails so a value only lands in the field it belongs to.
 * e.g. money never becomes Invoice No; dates never become Amount.
 */
function assignFields(input: {
  amount?: string;
  claimDate?: string;
  invoiceNo?: string;
}): {
  amount?: string;
  claimDate?: string;
  invoiceNo?: string;
} {
  let { amount, claimDate, invoiceNo } = input;

  if (amount && !looksLikeMoney(amount)) amount = undefined;
  if (claimDate && !looksLikeDate(claimDate)) claimDate = undefined;
  if (invoiceNo && !looksLikeInvoice(invoiceNo)) invoiceNo = undefined;

  // If a date landed in Invoice No, move it to Claim Date
  if (invoiceNo && looksLikeDate(invoiceNo)) {
    if (!claimDate) claimDate = invoiceNo;
    invoiceNo = undefined;
  }

  // Decimal money in Invoice No is almost always a mis-filed Amount
  if (invoiceNo && /^\d{1,3}(?:,\d{2,3})*\.\d{2}$|^\d+\.\d{2}$/.test(invoiceNo)) {
    if (!amount) amount = invoiceNo;
    invoiceNo = undefined;
  }

  return { amount, claimDate, invoiceNo };
}

export function parseClaim(rawText: string): ParsedClaimFields {
  const text = normalizeOcrText(rawText);
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labeled = collectLabeledFields(lines);
  const assigned = assignFields({
    amount: labeled.amount ?? fallbackAmount(text, lines),
    claimDate: labeled.claimDate ?? fallbackDate(text),
    invoiceNo: labeled.invoiceNo ?? fallbackInvoice(text),
  });

  const vendor = pickVendor(lines);
  const amount = formatDisplayAmount(assigned.amount);

  return {
    vendor,
    amount,
    claimDate: formatClaimDate(assigned.claimDate),
    claimMonth: formatClaimMonth(assigned.claimDate),
    invoiceNo: assigned.invoiceNo,
    category: pickCategory(text, vendor),
  };
}
