/**
 * RC books print the manufacturer's legal name ("MARUTI SUZUKI INDIA LTD"),
 * which is not what a user expects to read back. This maps the legal forms and
 * common OCR manglings onto display names.
 */

type MakerEntry = {
  display: string;
  /** Lowercased substrings that identify this maker in RC text. */
  aliases: string[];
};

const MAKERS: MakerEntry[] = [
  { display: "Maruti Suzuki", aliases: ["maruti suzuki", "maruti udyog", "maruti"] },
  { display: "Hyundai", aliases: ["hyundai motor", "hyundai"] },
  { display: "Tata Motors", aliases: ["tata motors", "tata motor", "tata"] },
  { display: "Mahindra", aliases: ["mahindra & mahindra", "mahindra and mahindra", "mahindra"] },
  { display: "Toyota", aliases: ["toyota kirloskar", "toyota"] },
  { display: "Honda", aliases: ["honda cars", "honda motorcycle", "honda siel", "honda"] },
  { display: "Kia", aliases: ["kia motors", "kia india", "kia"] },
  { display: "MG Motor", aliases: ["mg motor", "morris garages"] },
  { display: "Renault", aliases: ["renault"] },
  { display: "Nissan", aliases: ["nissan"] },
  { display: "Volkswagen", aliases: ["volkswagen", "vw"] },
  { display: "Skoda", aliases: ["skoda"] },
  { display: "Ford", aliases: ["ford india", "ford"] },
  { display: "Jeep", aliases: ["jeep"] },
  { display: "Citroen", aliases: ["citroen", "citroën"] },
  { display: "BMW", aliases: ["bmw"] },
  { display: "Mercedes-Benz", aliases: ["mercedes benz", "mercedes-benz", "mercedes"] },
  { display: "Audi", aliases: ["audi"] },
  { display: "Volvo", aliases: ["volvo"] },
  { display: "Jaguar", aliases: ["jaguar"] },
  { display: "Land Rover", aliases: ["land rover", "range rover"] },
  { display: "Isuzu", aliases: ["isuzu"] },
  { display: "Force Motors", aliases: ["force motors"] },
  { display: "Ashok Leyland", aliases: ["ashok leyland"] },
  { display: "Eicher", aliases: ["eicher", "vecv"] },
  { display: "BharatBenz", aliases: ["bharatbenz", "daimler india"] },
  { display: "Hero MotoCorp", aliases: ["hero motocorp", "hero honda", "hero"] },
  { display: "Bajaj", aliases: ["bajaj auto", "bajaj"] },
  { display: "TVS", aliases: ["tvs motor", "tvs"] },
  { display: "Royal Enfield", aliases: ["royal enfield", "eicher motors ltd"] },
  { display: "Yamaha", aliases: ["india yamaha", "yamaha"] },
  { display: "Suzuki Motorcycle", aliases: ["suzuki motorcycle"] },
  { display: "KTM", aliases: ["ktm"] },
  { display: "Ather", aliases: ["ather energy", "ather"] },
  { display: "Ola Electric", aliases: ["ola electric", "ola"] },
  { display: "Piaggio", aliases: ["piaggio", "vespa"] },
  { display: "BYD", aliases: ["byd"] },
  { display: "Tesla", aliases: ["tesla"] },
];

/** Model names that help confirm a maker when the maker line is unreadable. */
const MODEL_HINTS: Record<string, string> = {
  alto: "Maruti Suzuki",
  swift: "Maruti Suzuki",
  baleno: "Maruti Suzuki",
  dzire: "Maruti Suzuki",
  wagonr: "Maruti Suzuki",
  "wagon r": "Maruti Suzuki",
  celerio: "Maruti Suzuki",
  ertiga: "Maruti Suzuki",
  brezza: "Maruti Suzuki",
  ciaz: "Maruti Suzuki",
  ignis: "Maruti Suzuki",
  fronx: "Maruti Suzuki",
  jimny: "Maruti Suzuki",
  "grand vitara": "Maruti Suzuki",
  eeco: "Maruti Suzuki",
  i10: "Hyundai",
  i20: "Hyundai",
  creta: "Hyundai",
  venue: "Hyundai",
  verna: "Hyundai",
  exter: "Hyundai",
  alcazar: "Hyundai",
  tucson: "Hyundai",
  santro: "Hyundai",
  aura: "Hyundai",
  nexon: "Tata Motors",
  punch: "Tata Motors",
  harrier: "Tata Motors",
  safari: "Tata Motors",
  altroz: "Tata Motors",
  tiago: "Tata Motors",
  tigor: "Tata Motors",
  curvv: "Tata Motors",
  scorpio: "Mahindra",
  thar: "Mahindra",
  xuv700: "Mahindra",
  xuv300: "Mahindra",
  bolero: "Mahindra",
  marazzo: "Mahindra",
  innova: "Toyota",
  fortuner: "Toyota",
  glanza: "Toyota",
  hyryder: "Toyota",
  camry: "Toyota",
  city: "Honda",
  amaze: "Honda",
  elevate: "Honda",
  jazz: "Honda",
  seltos: "Kia",
  sonet: "Kia",
  carens: "Kia",
  carnival: "Kia",
  hector: "MG Motor",
  astor: "MG Motor",
  gloster: "MG Motor",
  kwid: "Renault",
  triber: "Renault",
  kiger: "Renault",
  magnite: "Nissan",
  polo: "Volkswagen",
  virtus: "Volkswagen",
  taigun: "Volkswagen",
  slavia: "Skoda",
  kushaq: "Skoda",
  activa: "Honda",
  splendor: "Hero MotoCorp",
  pulsar: "Bajaj",
  classic: "Royal Enfield",
  bullet: "Royal Enfield",
  himalayan: "Royal Enfield",
  apache: "TVS",
  jupiter: "TVS",
};

/** Normalise an RC maker string to a display name, or return it title-cased. */
export function normalizeMaker(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z& ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return undefined;

  for (const maker of MAKERS) {
    // Longest alias first so "maruti suzuki" beats "maruti"
    const sorted = [...maker.aliases].sort((a, b) => b.length - a.length);
    if (sorted.some((alias) => cleaned.includes(alias))) return maker.display;
  }

  return titleCase(
    raw.replace(/\b(pvt|private|ltd|limited|india|inc|corp|co)\b\.?/gi, "").trim(),
  );
}

/** Infer the maker from a model name when the maker line didn't survive OCR. */
export function makerFromModel(model?: string): string | undefined {
  if (!model) return undefined;
  const cleaned = model.toLowerCase().replace(/\s+/g, " ").trim();
  const hits = Object.keys(MODEL_HINTS)
    .filter((hint) => new RegExp(`\\b${hint}\\b`).test(cleaned))
    .sort((a, b) => b.length - a.length);
  return hits.length > 0 ? MODEL_HINTS[hits[0]] : undefined;
}

/**
 * RC text is all-caps, so a plain title-case turns trim badges into noise
 * ("LXI" -> "Lxi"). Tokens stay uppercase when they were uppercase in the
 * source and look like a badge rather than a word: three letters or fewer, or
 * containing a digit (LXI, SX, 4X4, XUV700).
 */
export function titleCase(value: string): string {
  return value
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

export function makerModelDisplay(
  maker?: string,
  model?: string,
): string | undefined {
  if (!maker && !model) return undefined;
  if (!model) return maker;
  if (!maker) return model;
  // Avoid "Maruti Suzuki Maruti Swift"
  if (model.toLowerCase().includes(maker.toLowerCase())) return model;
  return `${maker} ${model}`;
}
