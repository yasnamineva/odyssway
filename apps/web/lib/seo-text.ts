import type { CustomsItemRecord } from "@odyssway/engine";

/**
 * Search-snippet wording built from verified rows only (AGENTS.md §3): the
 * title carries the answer and the year it was checked, the description opens
 * with the rule itself. Nothing here adds a claim the row doesn't make.
 */

/** Google truncates titles around 60 characters and descriptions around 155. */
export const TITLE_MAX = 65;
export const DESCRIPTION_MAX = 158;

/** Cut at a word boundary and mark the cut, never mid-word. */
export function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[,;:\s—–-]+$/, "")}…`;
}

/** The first sentence of a rule, which is how our rows are written: answer first. */
export function firstSentence(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  // A full stop followed by a space and a capital ends a sentence; "e.g. x" and
  // "U.S. citizens" don't, since what follows isn't capitalised or is an initial.
  const sentences = t.match(/.+?[.!?](?=\s+[A-Z"“(]|$)/g) ?? [t];
  // A short opener ("Don't bring it.") reads better with the sentence after it.
  const first = sentences[0]!.trim();
  return first.length < 40 && sentences[1] ? `${first} ${sentences[1].trim()}` : first;
}

/** The line a row shows in snippets and hub lists: its summary, else its rule's opening. */
export function rowLead(row: CustomsItemRecord): string | undefined {
  if (row.summary) return row.summary;
  return row.limits?.description ? firstSentence(row.limits.description) : row.notes ? firstSentence(row.notes) : undefined;
}

/** Which short answer to put in a title for one row. */
export type SeoVerdictKey =
  | "prohibited"
  | "allowed_with_limits"
  | "allowed"
  | "declaration_required"
  | "depends"
  | "permit";

export function seoVerdictKey(row: CustomsItemRecord): SeoVerdictKey {
  if (row.verdict === "depends" && row.procedure && !row.procedure.optional) return "permit";
  return row.verdict;
}

/** Year the newest of these rows was checked against its source. */
export function checkedYear(rows: CustomsItemRecord[]): string | undefined {
  const dates = rows.map((r) => r.verified_at).filter((d): d is string => Boolean(d));
  return dates.length ? dates.sort().at(-1)!.slice(0, 4) : undefined;
}

/**
 * "Can you bring X to Y? No, it's banned (2026)", dropping the year and then
 * the answer if the title would run long.
 */
export function titleWithAnswer(
  question: string,
  answer: string | string[] | undefined,
  year: string | undefined,
): string {
  // Answers in order of preference (e.g. the limit, then the plain verdict):
  // each is tried with and without the year before giving up on an answer.
  const answers = answer === undefined ? [] : Array.isArray(answer) ? answer : [answer];
  const candidates = [
    ...answers.flatMap((a) => [year ? `${question} ${a} (${year})` : undefined, `${question} ${a}`]),
    year ? `${question} ${year} rules` : undefined,
    question,
  ].filter((c): c is string => Boolean(c));
  return candidates.find((c) => c.length <= TITLE_MAX) ?? question;
}

/** Description: the rule's own first sentence, then the source date. */
export function describeRule(lead: string, tail: string): string {
  const room = DESCRIPTION_MAX - tail.length - 1;
  return `${clip(lead, Math.max(room, 60))} ${tail}`.trim();
}

/** Longest limit worth putting in a title; longer ones read badly and get cut. */
const QUANTITY_IN_TITLE_MAX = 26;

/**
 * The title answer for one row: the limit itself ("Yes, limit: 200 cigarettes")
 * when the row has a short quantity, otherwise the plain verdict. Searchers ask
 * "how much", so the number in the result is the answer (GROWTH_AND_ROADMAP.md §0).
 */
export function titleAnswer(
  row: CustomsItemRecord,
  t: (key: string, values?: Record<string, string>) => string,
): string[] {
  const plain = t(`verdict.${seoVerdictKey(row)}`);
  const q = row.limits?.quantity;
  if (q && q.length <= QUANTITY_IN_TITLE_MAX && (row.verdict === "allowed_with_limits" || row.verdict === "declaration_required")) {
    return [t(`withQuantity.${row.verdict}`, { quantity: q }), plain];
  }
  return [plain];
}
