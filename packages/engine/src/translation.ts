/**
 * Translations restate verified English rows (GROWTH_AND_ROADMAP.md §5.5). Each
 * translated row records a hash of the English text it was made from: when the
 * English row changes, the hash no longer matches and the page falls back to
 * English until the row is retranslated. Figures must survive translation
 * unchanged, in ASCII digits, so a mistranslated amount can't slip through.
 */

/** The English fields a translation may restate, in a fixed order. */
export interface TranslatableFields {
  summary?: string;
  limitsDescription?: string;
  limitsQuantity?: string;
  notes?: string;
  documentsNeeded?: string[];
}

const ORDER: (keyof TranslatableFields)[] = ["summary", "limitsDescription", "limitsQuantity", "notes", "documentsNeeded"];

/** FNV-1a (32-bit) over the fields that exist; enough to notice a changed row. */
export function translationSourceHash(fields: TranslatableFields): string {
  const text = ORDER.filter((k) => fields[k] !== undefined)
    .map((k) => `${k}\u0000${JSON.stringify(fields[k])}`)
    .join("\u0001");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Figures in a text, with thousands separators removed ("10,000" → "10000"). */
export function figuresIn(text: string): string[] {
  const plain = text.replace(/(?<=\d)[,   ](?=\d{3}\b)/g, "");
  return plain.match(/\d+(?:[.,]\d+)?/g)?.map((n) => n.replace(",", ".")) ?? [];
}

/**
 * Figures in the English text that the translation doesn't contain (as many times
 * as the English uses them). Empty means every amount, day count and age survived.
 */
export function missingFigures(english: TranslatableFields, translated: TranslatableFields): string[] {
  const missing: string[] = [];
  for (const k of ORDER) {
    const en = english[k];
    if (en === undefined) continue;
    const tr = translated[k];
    const enText = Array.isArray(en) ? en.join("\n") : en;
    const trText = tr === undefined ? "" : Array.isArray(tr) ? tr.join("\n") : tr;
    const have = new Map<string, number>();
    for (const n of figuresIn(trText)) have.set(n, (have.get(n) ?? 0) + 1);
    for (const n of figuresIn(enText)) {
      const left = have.get(n) ?? 0;
      if (left > 0) have.set(n, left - 1);
      else missing.push(`${k}: ${n}`);
    }
  }
  return missing;
}

/** The translatable English fields of a customs row. */
export function customsRowFields(row: {
  summary?: string;
  limits?: { description: string; quantity?: string };
  notes?: string;
}): TranslatableFields {
  return {
    summary: row.summary,
    limitsDescription: row.limits?.description,
    limitsQuantity: row.limits?.quantity,
    notes: row.notes,
  };
}

/** The translatable English fields of an entry-requirement row. */
export function entryRowFields(row: { documentsNeeded: string[]; notes?: string }): TranslatableFields {
  return { documentsNeeded: row.documentsNeeded, notes: row.notes };
}

/** Id of an entry row in a translation file: "US>JP". */
export const entryRowId = (row: { nationality: string; destination: string }) => `${row.nationality}>${row.destination}`;
