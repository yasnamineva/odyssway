import { customsRowDetails, customsRowFields, detailsId, translationSourceHash, type CustomsItemRecord, type TranslatableFields } from "@odyssway/engine";
import deCustomsItems from "../../../data/i18n/de/customs-items.json";
import { bringPairs, type BringPair } from "./bring-pages";
import { customsCodeFor } from "./countries";
import deMessages from "../messages/de.json";

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

/** The translation with this id if it's fresh (hash matches) and complete, else null. */
function freshTranslation(id: string, english: TranslatableFields, locale: TranslatedLocale): TranslationRow | null {
  const t = byId(locale).get(id);
  if (!t || translationSourceHash(english) !== t.sourceHash) return null;
  for (const k of Object.keys(english) as (keyof TranslatableFields)[]) {
    if (english[k] !== undefined && t.fields[k] === undefined) return null;
  }
  return t;
}

/**
 * The row's procedure, letter checklist and transit text in `locale`, or null when the
 * row has none or its "{slug}#details" translation isn't fresh and complete.
 */
export function translatedCustomsDetails(row: CustomsItemRecord, locale: TranslatedLocale): TranslatableFields | null {
  const english = customsRowDetails(row);
  if (!english || row.status !== "verified") return null;
  return freshTranslation(detailsId(row.slug), english, locale)?.fields ?? null;
}

/**
 * The row's fields in `locale`, or null when there's no fresh, complete translation.
 * A row with a procedure, letter checklist or transit rule also needs those translated:
 * a German page never drops what the English page shows.
 */
export function translatedCustomsRow(row: CustomsItemRecord, locale: TranslatedLocale): TranslatedCustomsFields | null {
  if (row.status !== "verified") return null;
  const t = freshTranslation(row.slug, customsRowFields(row), locale);
  if (!t) return null;
  if (customsRowDetails(row) && !translatedCustomsDetails(row, locale)) return null;
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

/** Kind of heading a row gets on a German page with several rows. */
export type GermanRowHeading = { kind: "shared" } | { kind: "label"; label: string } | { kind: "national" };

const DE_ROW_LABELS = (deMessages.dePages as { rowLabels: Record<string, string> }).rowLabels;

/** True for a customs-territory row shown on a member state's page (e.g. drones-eu on France). */
export function isSharedRow(slug: string, destinationCode: string): boolean {
  const territory = customsCodeFor(destinationCode);
  return territory !== destinationCode && slug.endsWith(`-${territory.toLowerCase()}`);
}

/**
 * How a row is headed on a German page: the shared EU row, a German label for the
 * row's kind (rowLabels in messages/de.json), or "additional rules in {country}" for a
 * national row shown next to the EU one. Null when none fits: that page isn't built.
 */
export function germanRowHeading(
  slug: string,
  pair: { destination: { code: string }; rows: CustomsItemRecord[] },
): GermanRowHeading | null {
  const code = pair.destination.code;
  if (isSharedRow(slug, code)) return { kind: "shared" };
  const base = slug.replace(new RegExp(`-(${code.toLowerCase()})$`), "");
  const label = DE_ROW_LABELS[base];
  if (label) return { kind: "label", label };
  if (pair.rows.some((r) => isSharedRow(r.slug, code))) return { kind: "national" };
  return null;
}

/** True when every row is translated and, on a page with several rows, each can be headed. */
export function germanRowsReady(pair: { destination: { code: string }; rows: CustomsItemRecord[] }): boolean {
  return (
    allRowsTranslated(pair.rows, "de") &&
    (pair.rows.length === 1 || pair.rows.every((r) => germanRowHeading(r.slug, pair) !== null))
  );
}

/** An ISO date as German readers write it ("8. November 2026"), timezone-free. */
export function germanDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

/** "Can I bring it?" pairs whose every row is translated in German and can be headed (the /de pages). */
export function germanPairs(): BringPair[] {
  return bringPairs.filter(germanRowsReady);
}

let germanSet: Set<BringPair> | null = null;
/** True when the pair has a German page (the same rule the /de route uses). */
export function hasGermanPage(pair: BringPair): boolean {
  germanSet ??= new Set(germanPairs());
  return germanSet.has(pair);
}
