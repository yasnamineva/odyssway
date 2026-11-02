import {
  schemas,
  type CountryRecord,
  type EngineContext,
} from "@odyssway/engine";
import rawCountriesFile from "../../../data/countries.json";

/**
 * Production country data (data/countries.json), schema-validated at module
 * load so a malformed data edit fails the build, not the user.
 */
const parsed = schemas.countriesFileSchema.parse(rawCountriesFile);

/** Date the dataset was last checked against its official sources. */
export const countriesVerifiedAt: string = parsed.verified_at ?? "";

export const countries: CountryRecord[] = parsed.countries;

const byName = (a: CountryRecord, b: CountryRecord) =>
  a.name.localeCompare(b.name);

export const schengenCountries: CountryRecord[] = countries
  .filter((c) => c.schengenMember)
  .sort(byName);

export const nonSchengenCountries: CountryRecord[] = countries
  .filter((c) => !c.schengenMember)
  .sort(byName);

export const countryName = (code: string): string =>
  countries.find((c) => c.code === code)?.name ?? code;

/** Customs rows keyed "EU" answer for the harmonised EU regime (data/customs-items.json). */
const EU_CUSTOMS = "EU";
const SCHENGEN_SENTINEL = "SCHENGEN";

/**
 * Which customs rows answer for a destination. Schengen membership isn't customs
 * membership: Iceland, Liechtenstein, Norway and Switzerland are in Schengen but
 * outside the EU customs union, so the harmonised EU rows never answer for them;
 * only their own rows do (and until those exist, the item is "not verified").
 */
export function customsCodeFor(destination: string): string {
  const upper = destination.toUpperCase();
  if (upper === SCHENGEN_SENTINEL) return EU_CUSTOMS;
  const country = countries.find((c) => c.code === upper);
  if (country?.schengenMember) return country.euMember ? EU_CUSTOMS : upper;
  return upper;
}

export const engineContext: EngineContext = { countries };
