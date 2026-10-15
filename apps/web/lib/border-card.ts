import type { CustomsItemRecord } from "@odyssway/engine";

/**
 * The printable "border card" for one verified customs row (GROWTH_AND_ROADMAP.md
 * §2.8): the rule, what to carry, who to contact, any transit rule, and the
 * source with its check date. Pure — the PDF button only lays these lines out,
 * so the wording is unit-testable and never diverges from the page.
 */
export type CardLine =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string }
  | { kind: "check"; text: string }
  | { kind: "small"; text: string }
  | { kind: "gap" };

export interface BorderCardLabels {
  title: string; // "{item} — {destination}" already filled in
  verdict: string; // the verdict's human label
  rule: string;
  quantity: string;
  notes: string;
  carry: string;
  apply: string;
  leadTime: string;
  applyUrl: string;
  atTheBorder: string;
  transit: string;
  transitRule: string; // the transit rule's human label
  source: string;
  checked: string; // "Checked against the source on {date}" already filled in
  footer: string; // generated-on line + disclaimer, already filled in
}

/**
 * The built-in PDF fonts only cover WinAnsi (Latin-1 plus a few typographic
 * characters). Swap the symbols our copy uses, strip accents the fonts lack
 * (č → c), and drop text in other scripts — e.g. a source's native-language
 * name — rather than printing it as "???". The source URL always survives.
 */
const WIN_ANSI = /[\x20-\x7e\u00a1-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac]/;
const SWAPS: Record<string, string> = {
  "→": "->", "←": "<-", "≤": "<=", "≥": ">=", "℃": "°C", "ı": "i", "İ": "I", "đ": "d", "Đ": "D",
  "，": ", ", "、": ", ", "。": ". ", "：": ": ", "（": " (", "）": ") ", "・": " ",
  "\u2009": " ", "\u202f": " ", "\u00a0": " ",
};

export function toPdfText(s: string): string {
  let out = "";
  for (const ch of s) {
    if (WIN_ANSI.test(ch)) out += ch;
    else if (SWAPS[ch] !== undefined) out += SWAPS[ch];
    else {
      const base = ch.normalize("NFD").replace(/[\u0300-\u036f\u031b]/g, "");
      out += base !== ch && [...base].every((c) => WIN_ANSI.test(c)) ? base : "\u0000";
    }
  }
  return out
    .replace(/\u0000+/g, "")
    .replace(/[([]\s*[)\]]/g, "")
    .replace(/“\s*”|""/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/ ([,.;:)])/g, "$1")
    .replace(/\( /g, "(")
    .trim();
}

export function buildBorderCardLines(row: CustomsItemRecord, l: BorderCardLabels): CardLine[] {
  const lines: CardLine[] = [{ kind: "title", text: l.title }, { kind: "text", text: l.verdict.charAt(0).toUpperCase() + l.verdict.slice(1) }, { kind: "gap" }];
  if (row.limits) {
    lines.push({ kind: "heading", text: l.rule }, { kind: "text", text: row.limits.description });
    if (row.limits.quantity) lines.push({ kind: "text", text: `${l.quantity} ${row.limits.quantity}` });
    lines.push({ kind: "gap" });
  }
  if (row.notes) lines.push({ kind: "heading", text: l.notes }, { kind: "text", text: row.notes }, { kind: "gap" });

  const p = row.procedure;
  if (p?.documents?.length) {
    lines.push({ kind: "heading", text: l.carry }, ...p.documents.map((d) => ({ kind: "check" as const, text: d })));
    lines.push({ kind: "gap" });
  }
  if (p) {
    lines.push({ kind: "heading", text: l.apply }, { kind: "text", text: p.authority });
    if (p.leadTime) lines.push({ kind: "text", text: `${l.leadTime} ${p.leadTime}` });
    if (p.applyUrl) lines.push({ kind: "text", text: `${l.applyUrl} ${p.applyUrl}` });
    if (p.atTheBorder) lines.push({ kind: "text", text: `${l.atTheBorder} ${p.atTheBorder}` });
    lines.push({ kind: "gap" });
  }
  if (row.transit) {
    lines.push(
      { kind: "heading", text: `${l.transit} (${l.transitRule})` },
      { kind: "text", text: row.transit.description },
      { kind: "small", text: `${row.transit.source.name}: ${row.transit.source.url}` },
      { kind: "gap" },
    );
  }
  lines.push(
    { kind: "heading", text: l.source },
    { kind: "text", text: row.legal_source.name },
    { kind: "small", text: row.legal_source.url },
    ...(row.verified_at ? [{ kind: "small" as const, text: l.checked }] : []),
    { kind: "gap" },
    { kind: "small", text: l.footer },
  );
  return lines.map((line) => ("text" in line ? { ...line, text: toPdfText(line.text) } : line));
}
