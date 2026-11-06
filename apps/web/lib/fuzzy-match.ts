/**
 * Typo- and abbreviation-tolerant matching for the "bringing X?" item search
 * (Trip Check). Pure string logic, no network/LLM calls — catching "adderal"
 * or "addy" doesn't need a model, just edit-distance and a small alias table.
 */

/**
 * Known slang/abbreviations/misspellings, mapped to the exact canonical term
 * already used somewhere in data/customs-items.json's `names` arrays. Every
 * entry here must point at the SAME substance already covered in the data —
 * never a different drug, even a related one (e.g. "roxy" is oxycodone, not
 * codeine, so it's deliberately left out rather than aliased to the wrong
 * item). A wrong alias would silently misinform a traveler.
 */
const ABBREVIATIONS: Record<string, string> = {
  addy: "adderall",
  addys: "adderall",
  addies: "adderall",
  adderal: "adderall",
  adderoll: "adderall",
  xannies: "xanax",
  xanies: "xanax",
  zannies: "xanax",
  xanbars: "xanax",
  vyvance: "vyvanse",
  lisdexamphetamine: "lisdexamfetamine",
  amphetamines: "amphetamine",
  amphetimine: "amphetamine",
  codine: "codeine",
  opiates: "opioid painkiller",
  painkillers: "opioid painkiller",
  painkiller: "opioid painkiller",
  pseudophedrine: "pseudoephedrine",
  stimulants: "stimulant medication",
};

/**
 * A raw search query, plus its known alias target if any — callers try every
 * variant returned here against the data. Deliberately conservative: only
 * `.trim().toLowerCase()`, matching the base normalization `matchItem` has
 * always used, so this doesn't change behavior for queries that already
 * worked via exact/substring matching.
 */
export function expandQuery(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  const alias = ABBREVIATIONS[q];
  return alias ? [q, alias] : [q];
}

/** Classic Levenshtein edit distance (insert/delete/substitute), iterative DP. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length]!;
}

/**
 * How many edits are tolerated before two words count as "the same word,
 * typo'd". Short words get zero tolerance — a 4-letter query is one edit
 * away from plenty of unrelated 4-letter words (e.g. "cash" vs "hash", two
 * genuinely different customs categories), so allowing any slack there risks
 * a false match; the exact/substring passes already catch short words that
 * really are correct. Longer, more distinctive drug names can safely allow
 * a couple of wrong letters.
 */
function toleranceFor(len: number): number {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  if (len <= 12) return 2;
  return 3;
}

/**
 * Real everyday words that sit one or two letters from a controlled item's
 * name ("pepper" vs "poppers"). Someone typing these means the word itself,
 * so they must never be "corrected" into a prohibited item.
 */
const NOT_TYPOS = new Set(["pepper", "peppers", "copper", "paper", "cava", "hopper", "hoppers", "topper", "toppers"]);

/**
 * True if `query` is close enough to `candidate` to treat as the same word.
 * Used as a last-resort pass, after exact and substring matching have both
 * failed — deliberately narrow (single-word comparison, length-scaled
 * tolerance) so it catches real typos without matching unrelated words.
 */
export function isFuzzyMatch(query: string, candidate: string): boolean {
  const q = query.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();
  if (!q || !c) return false;
  if (q === c) return true;
  if (NOT_TYPOS.has(q)) return false;
  // Only compare single-word candidates this way — multi-word names (e.g.
  // "opioid painkiller") already have substring matching; fuzzy-matching a
  // short query against a long phrase produces false positives.
  if (c.includes(" ")) return false;
  return levenshtein(q, c) <= toleranceFor(Math.max(q.length, c.length));
}

/** The alias target for a known slang word or misspelling ("addy" → "adderall"), if any. */
export function aliasFor(raw: string): string | undefined {
  return ABBREVIATIONS[raw.trim().toLowerCase()];
}

/**
 * Up to `limit` item names close to an unrecognised query, nearest first, for a
 * "Did you mean …?" line. Looser than `isFuzzyMatch` (it only suggests, it never
 * answers), and it also compares against each word of multi-word names. Never
 * suggests for a real word listed in NOT_TYPOS, or for queries under 3 letters.
 */
export function suggestNames(raw: string, names: readonly string[], limit = 3): string[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 3 || NOT_TYPOS.has(q)) return [];
  const max = Math.max(2, Math.ceil(q.length * 0.4));
  const scored = new Map<string, number>();
  for (const name of names) {
    const n = name.trim().toLowerCase();
    if (!n || n === q) continue;
    const words = n.split(/\s+/);
    const d = Math.min(levenshtein(q, n), ...words.filter((w) => w.length >= 3).map((w) => levenshtein(q, w)));
    if (d <= max && (scored.get(n) ?? Infinity) > d) scored.set(n, d);
  }
  return [...scored.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].length - b[0].length)
    .slice(0, limit)
    .map(([n]) => n);
}
