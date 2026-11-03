/**
 * Ranking for the country pickers (SearchableSelect). Pure string logic.
 *
 * A query matches an option by, best first: its ISO code or a common
 * abbreviation ("US", "USA", "UK", "UAE"), the start of its name, the start of
 * a word in its name ("korea" → "South Korea"), a well-known other name
 * ("Holland", "Turkey", "Burma"), anywhere in the name, and finally a one- or
 * two-letter typo ("germnay"). Accents are ignored, so "turkiye" finds Türkiye.
 */

export interface SearchOption {
  value: string;
  label: string;
}

/**
 * Other names and abbreviations people type, keyed by ISO 3166-1 alpha-2.
 * Only names that unambiguously mean that one country.
 */
const ALIASES: Record<string, string[]> = {
  US: ["usa", "u.s.", "u.s.a.", "america", "united states of america", "american"],
  GB: ["uk", "u.k.", "britain", "great britain", "england", "scotland", "wales", "northern ireland", "british"],
  AE: ["uae", "emirates", "dubai", "abu dhabi"],
  KR: ["korea", "south korea", "republic of korea", "rok", "korean"],
  NL: ["holland", "dutch"],
  CZ: ["czech republic", "czech"],
  TR: ["turkey", "turkiye", "turkish"],
  CI: ["ivory coast"],
  MK: ["macedonia", "fyrom"],
  MM: ["burma"],
  CV: ["cape verde"],
  SZ: ["swaziland"],
  RU: ["russian federation"],
  VA: ["vatican", "vatican city"],
  BA: ["bosnia", "herzegovina"],
  DO: ["dominican rep"],
  ZA: ["rsa"],
  DE: ["deutschland", "german"],
  ES: ["espana", "spanish"],
  FR: ["french"],
  IT: ["italia", "italian"],
  CH: ["swiss", "schweiz", "suisse"],
  AT: ["austrian", "osterreich"],
  GR: ["hellas", "greek"],
  CN: ["prc", "chinese"],
  JP: ["japanese", "nippon"],
  IN: ["indian", "bharat"],
  CA: ["canadian"],
  AU: ["aussie", "australian"],
  NZ: ["kiwi", "aotearoa"],
  MX: ["mexican"],
  BR: ["brasil", "brazilian"],
  IE: ["eire", "irish"],
  PH: ["filipino", "philippine"],
  TH: ["thai", "siam"],
  VN: ["viet nam", "vietnamese"],
  HK: ["hong kong sar"],
  MO: ["macau"],
  TW: ["taiwanese"],
  UA: ["ukrainian"],
  PL: ["polish"],
  PT: ["portuguese"],
  SE: ["swedish"],
  NO: ["norwegian"],
  DK: ["danish"],
  FI: ["finnish"],
  IL: ["israeli"],
  EG: ["egyptian"],
  MA: ["moroccan"],
  KE: ["kenyan"],
  NG: ["nigerian"],
};

/** Lower-case, accents removed, punctuation other than spaces collapsed. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9. ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Edit distance counting a swap of two neighbouring letters as one edit. */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = v;
    }
  }
  return d[a.length]![b.length]!;
}

function typoTolerance(len: number): number {
  if (len < 4) return 0;
  if (len <= 7) return 1;
  return 2;
}

const isCode = (v: string) => /^[A-Z]{2}$/.test(v);

/**
 * Lower is better; null means no match. Exposed for tests.
 */
export function scoreOption(rawQuery: string, opt: SearchOption): number | null {
  const q = normalize(rawQuery);
  if (!q) return 0;
  const label = normalize(opt.label);
  const aliases = isCode(opt.value) ? (ALIASES[opt.value] ?? []) : [];
  const code = isCode(opt.value) ? opt.value.toLowerCase() : null;
  const qNoDots = q.replace(/\./g, "");

  if (code === qNoDots || aliases.some((a) => a.replace(/\./g, "") === qNoDots)) return 0;
  if (label.startsWith(q)) return 1;
  if (aliases.some((a) => a.startsWith(q)) && q.length >= 2) return 2;
  const words = label.split(" ");
  if (words.some((w) => w.startsWith(q))) return 3;
  if (label.includes(q)) return 4;
  if (q.length >= 3 && aliases.some((a) => a.includes(q))) return 5;

  const tol = typoTolerance(q.length);
  if (tol > 0) {
    // Compare with whole words and with word starts of the query's length,
    // so a typo in a half-typed name ("austrl") still matches.
    const candidates = [label, ...words, ...aliases].filter((c) => c.length >= 3);
    if (candidates.some((c) => editDistance(q, c) <= tol || editDistance(q, c.slice(0, q.length)) <= tol)) return 6;
  }
  return null;
}

/** Options matching `query`, best first; ties keep their original order. */
export function searchOptions<T extends SearchOption>(query: string, options: T[]): T[] {
  if (!normalize(query)) return options;
  return options
    .map((o, i) => ({ o, i, s: scoreOption(query, o) }))
    .filter((x): x is { o: T; i: number; s: number } => x.s !== null)
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.o);
}
