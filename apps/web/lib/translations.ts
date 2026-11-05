import { customsRowFields, translationSourceHash, type CustomsItemRecord, type TranslatableFields } from "@odyssway/engine";
import deCustomsItems from "../../../data/i18n/de/customs-items.json";
import { bringPairs, type BringPair } from "./bring-pages";

/**
 * Machine translations of verified English rows (GROWTH_AND_ROADMAP.md §5.5).
 *
 * A translation is used only while it's *fresh* (its hash still matches the English
 * row) and *complete* (it covers every field the English row has). Otherwise the
 * row has no translation and no page is generated for it in that locale, so a reader
 * never sees a stale or half-translated rule.
 */
export const TRANSLATED_LOCALES = ["de"] as const;
export type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

type TranslationRow = { id: string; sourceHash: string; fields: TranslatableFields; translated_at: string };

const FILES: Record<TranslatedLocale, TranslationRow[]> = {
  de: deCustomsItems as TranslationRow[],
};

export interface TranslatedCustomsFields {
  summary?: string;
  limitsDescription?: string;
  limitsQuantity?: string;
  notes?: string;
  translatedAt: string;
}

const cache = new Map<TranslatedLocale, Map<string, TranslationRow>>();
function byId(locale: TranslatedLocale): Map<string, TranslationRow> {
  let m = cache.get(locale);
  if (!m) {
    m = new Map(FILES[locale].map((t) => [t.id, t]));
    cache.set(locale, m);
  }
  return m;
}

/** The row's fields in `locale`, or null when there's no fresh, complete translation. */
export function translatedCustomsRow(row: CustomsItemRecord, locale: TranslatedLocale): TranslatedCustomsFields | null {
  if (row.status !== "verified") return null;
  const t = byId(locale).get(row.slug);
  if (!t) return null;
  const english = customsRowFields(row);
  if (translationSourceHash(english) !== t.sourceHash) return null;
  for (const k of Object.keys(english) as (keyof TranslatableFields)[]) {
    if (english[k] !== undefined && t.fields[k] === undefined) return null;
  }
  return {
    summary: t.fields.summary,
    limitsDescription: t.fields.limitsDescription,
    limitsQuantity: t.fields.limitsQuantity,
    notes: t.fields.notes,
    translatedAt: t.translated_at,
  };
}

/** True when every row is translated (fresh and complete) in `locale`. */
export function allRowsTranslated(rows: CustomsItemRecord[], locale: TranslatedLocale): boolean {
  return rows.length > 0 && rows.every((r) => translatedCustomsRow(r, locale) !== null);
}

/** Country name in the locale's standard form (CLDR via Intl), with short forms where CLDR is long. */
const NAME_OVERRIDES: Record<TranslatedLocale, Record<string, string>> = {
  de: { HK: "Hongkong", MO: "Macau" },
};
export function countryName(code: string, locale: TranslatedLocale, fallback: string): string {
  const override = NAME_OVERRIDES[locale][code];
  if (override) return override;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

/** "Can I bring it?" pairs whose every row is translated in German (the /de pages). */
export function germanPairs(): BringPair[] {
  return bringPairs.filter((p) => allRowsTranslated(p.rows, "de"));
}
