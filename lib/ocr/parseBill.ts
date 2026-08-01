export type ParsedBillFields = {
  category?: string;
  vendor?: string;
  amount?: string;
  billDate?: string;
  billingMonth?: string;
  invoiceNo?: string;
};

const NUMBER =
  "(\\d{1,3}(?:,\\d{2,3})+(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)";

const CURRENCY = "(?:rs\\.?|inr|inr\\.?|₹|rupees?)";

/** Prefer labeled totals; these usually beat incidental amounts. */
const LABELED_AMOUNT_PATTERNS = [
  new RegExp(
    `(?:grand\\s*total|net\\s*(?:payable|amount)|amount\\s*payable|total\\s*amount|amount\\s*due|balance\\s*due|total\\s*due|total\\s*payable|payable\\s*amount|bill\\s*amount|invoice\\s*amount|amt\\.?\\s*payable|round\\s*off)[:\\s.-]*${CURRENCY}?\\s*${NUMBER}`,
    "gi",
  ),
  new RegExp(
    `(?:^|\\n)\\s*(?:total|amount|amt\\.?)[:\\s.-]+${CURRENCY}?\\s*${NUMBER}`,
    "gi",
  ),
  new RegExp(
    `${CURRENCY}\\s*${NUMBER}\\s*(?:only)?\\s*$`,
    "gim",
  ),
];

const CURRENCY_AMOUNT_PATTERN = new RegExp(
  `${CURRENCY}\\s*${NUMBER}`,
  "gi",
);

/** Amount on the next line after a total label (common OCR layout). */
const LABEL_THEN_AMOUNT = new RegExp(
  `(?:grand\\s*total|net\\s*(?:payable|amount)|amount\\s*payable|total\\s*amount|total\\s*due|total\\s*payable|bill\\s*amount|amount|total|amt\\.?)[:\\s.-]*\\n\\s*${CURRENCY}?\\s*${NUMBER}`,
  "gi",
);

const LABELED_DATE_PATTERNS = [
  /(?:bill\s*date|invoice\s*date|dated?|date\s*of\s*(?:invoice|bill|issue)|txn\s*date|transaction\s*date|payment\s*date)[:\s.-]*(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})/i,
  /(?:bill\s*date|invoice\s*date|dated?|date\s*of\s*(?:invoice|bill|issue))[:\s.-]*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{2,4})/i,
  /(?:bill\s*date|invoice\s*date|dated?)[:\s.-]*(\d{4}[\/\-.\s]\d{1,2}[\/\-.\s]\d{1,2})/i,
];

const DATE_PATTERNS = [
  /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
  /\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/,
  /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{2,4})\b/i,
];

const INVOICE_PATTERNS = [
  /(?:invoice|inv\.?|bill|receipt|order|ref(?:erence)?)\s*(?:no|number|#|num\.?)[.:\s#-]+([A-Z0-9][A-Z0-9\-\/]{2,})/i,
  /\b((?:INV|RCPT|TXN|ORD)[-/][A-Z0-9][-A-Z0-9\/]{2,})\b/i,
  /(?:invoice|inv\.?)\s*[:#]\s*([A-Z0-9][A-Z0-9\-\/]*\d[A-Z0-9\-\/]*)/i,
  /(?:order)\s*#\s*([A-Z0-9][A-Z0-9\-\/]{2,})/i,
];

const INVALID_INVOICE = /^(TOTAL|DATE|DATED|AMOUNT|TAX|GST|CASH|CARD|BILL|INVOICE|RECEIPT|ORIGINAL|DUPLICATE|PAGE|ONLY|RUPEES?)$/i;

const SKIP_VENDOR =
  /^(total|amount|tax|gst|cgst|sgst|igst|invoice|bill|receipt|date|time|tel|phone|www\.|http|thank|cash|card|qty|item|category|subtotal|discount|paid|balance|customer|address|pin|pincode|gstin|cin|pan|hsn|sac|page|original|duplicate|tax\s*invoice|cash\s*memo|retail\s*invoice)/i;

const ADDRESSISH =
  /\b(?:road|rd\.?|street|st\.?|nagar|colony|sector|floor|near|opp\.?|opposite|india|state|district|pin\s*:?\s*\d{6})\b/i;

const CATEGORY_HINTS: { category: string; keywords: string[] }[] = [
  {
    category: "Internet & Broadband",
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
    category: "Medical",
    keywords: [
      "hospital",
      "pharmacy",
      "clinic",
      "medical",
      "doctor",
      "chemist",
      "apollo",
      "medplus",
      "diagnostic",
      "pathology",
    ],
  },
  {
    category: "Fuel",
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
    category: "Travel",
    keywords: [
      "uber",
      "ola",
      "flight",
      "airline",
      "hotel",
      "taxi",
      "cab",
      "irctc",
      "makemytrip",
      "goibibo",
      "indigo",
      "air india",
      "booking.com",
    ],
  },
  {
    category: "Food & Entertainment",
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
    category: "Professional Development",
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
    category: "Office Supplies",
    keywords: [
      "stationery",
      "office",
      "supplies",
      "amazon business",
      "staples",
      "printer",
      "toner",
    ],
  },
];

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

/** Fix common OCR noise before field extraction. */
export function normalizeOcrText(rawText: string): string {
  return rawText
    .replace(/\u20b9/g, "₹")
    .replace(/[|]/g, " ")
    .replace(/\bR(?:s|S)\b\.?/g, "Rs")
    .replace(/\bINR\b/gi, "INR")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "");
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  // Likely phone / account fragments, not bill totals
  if (num >= 1_000_000) return null;
  return num;
}

function collectAmounts(
  text: string,
  patterns: RegExp[],
): { value: number; raw: string }[] {
  const found: { value: number; raw: string }[] = [];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1] ?? match[2];
      if (!raw) continue;
      const value = toNumber(raw);
      if (value === null) continue;
      // Tiny amounts are usually tax lines / qty noise unless labeled later
      if (value < 1) continue;
      found.push({ value, raw });
    }
  }

  return found;
}

function pickAmount(text: string): string | undefined {
  const labeled = [
    ...collectAmounts(text, LABELED_AMOUNT_PATTERNS),
    ...collectAmounts(text, [LABEL_THEN_AMOUNT]),
  ];

  if (labeled.length > 0) {
    const max = labeled.reduce((a, b) => (b.value > a.value ? b : a));
    return max.raw;
  }

  const currencyAmounts = collectAmounts(text, [CURRENCY_AMOUNT_PATTERN]);
  if (currencyAmounts.length > 0) {
    const max = currencyAmounts.reduce((a, b) => (b.value > a.value ? b : a));
    return max.raw;
  }

  // Last resort: largest plausible money-like number in the bottom half of the bill
  const lines = text.split(/\r?\n/);
  const bottom = lines.slice(Math.floor(lines.length * 0.4)).join("\n");
  const bare = new RegExp(`\\b${NUMBER}\\b`, "g");
  const fallback = collectAmounts(bottom, [bare]).filter(
    (item) => item.value >= 10,
  );
  if (fallback.length === 0) return undefined;
  const max = fallback.reduce((a, b) => (b.value > a.value ? b : a));
  return max.raw;
}

function formatDisplayAmount(amount?: string): string | undefined {
  if (!amount) return undefined;
  const num = toNumber(amount);
  if (num === null) return `₹${amount}`;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseDateParts(raw: string): Date | null {
  const cleaned = raw.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  const monthName = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]+)[.]?\s+(\d{2,4})$/,
  );
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
    // Prefer DD/MM/YYYY (India); swap when first looks like a month
    if (first > 12 && second <= 12) {
      return new Date(year, second - 1, first);
    }
    if (second > 12 && first <= 12) {
      return new Date(year, first - 1, second);
    }
    // Ambiguous: assume DD/MM/YYYY
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

function formatBillDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const date = parseDateParts(raw);
  if (!date || !isSaneDate(date)) return raw;
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatBillingMonth(raw?: string): string | undefined {
  if (!raw) return undefined;
  const date = parseDateParts(raw);
  if (!date || !isSaneDate(date)) return undefined;
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function pickDate(text: string): string | undefined {
  for (const pattern of LABELED_DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const date = parseDateParts(match[1]);
      if (date && isSaneDate(date)) return match[1];
    }
  }

  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const date = parseDateParts(match[1]);
      if (date && isSaneDate(date)) return match[1];
    }
  }

  return undefined;
}

function pickVendor(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && line.length <= 70);

  const candidates: string[] = [];

  for (const line of lines.slice(0, 12)) {
    if (SKIP_VENDOR.test(line)) continue;
    if (ADDRESSISH.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (/^[A-Z0-9]{10,15}$/i.test(line)) continue; // PAN / GSTIN-like
    if (/\bgstin\b/i.test(line)) continue;
    if (DATE_PATTERNS.some((pattern) => pattern.test(line))) continue;
    if (/(?:rs\.?|inr|₹|rupees?)\s*\d/i.test(line)) continue;
    if ((line.match(/[a-zA-Z]/g) ?? []).length < 3) continue;
    if ((line.match(/\d/g) ?? []).length > line.length * 0.45) continue;
    candidates.push(line.replace(/^[\-*:#.\s]+|[\-*:#.\s]+$/g, ""));
  }

  // Prefer ALL-CAPS or Title-ish merchant lines that look like brand names
  const ranked = [...candidates].sort((a, b) => {
    const score = (line: string) => {
      let s = 0;
      if (line === line.toUpperCase()) s += 2;
      if (/\b(pvt|ltd|limited|clinic|hospital|pharmacy|store|cafe|restaurant|hotel|motors|petroleum)\b/i.test(line)) {
        s += 3;
      }
      if (line.length >= 6 && line.length <= 40) s += 1;
      return s;
    };
    return score(b) - score(a);
  });

  return ranked[0];
}

function pickInvoiceNo(text: string): string | undefined {
  for (const pattern of INVOICE_PATTERNS) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const value = match[1].replace(/\s+/g, "").toUpperCase();
    if (INVALID_INVOICE.test(value)) continue;
    if (value.length < 3) continue;
    // Real invoice ids almost always include a digit
    if (!/\d/.test(value)) continue;
    return value;
  }
  return undefined;
}

function pickCategory(text: string, vendor?: string): string {
  const haystack = `${vendor ?? ""} ${text}`.toLowerCase();
  for (const hint of CATEGORY_HINTS) {
    if (hint.keywords.some((keyword) => haystack.includes(keyword))) {
      return hint.category;
    }
  }
  return "Other";
}

export function parseBill(rawText: string): ParsedBillFields {
  const text = normalizeOcrText(rawText);
  const rawDate = pickDate(text);
  const vendor = pickVendor(text);
  const amount = formatDisplayAmount(pickAmount(text));

  return {
    vendor,
    amount,
    billDate: formatBillDate(rawDate),
    billingMonth: formatBillingMonth(rawDate),
    invoiceNo: pickInvoiceNo(text),
    category: pickCategory(text, vendor),
  };
}
