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
  const m = t.match(/^(.+?[.!?])\s+(?=[A-Z"“(])/);
  return m && m[1]!.length >= 25 ? m[1]! : t;
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
  if (row.verdict === "depends" && row.procedure) return "permit";
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
export function titleWithAnswer(question: string, answer: string | undefined, year: string | undefined): string {
  const candidates = [
    answer && year ? `${question} ${answer} (${year})` : undefined,
    answer ? `${question} ${answer}` : undefined,
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
