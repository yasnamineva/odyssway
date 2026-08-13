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

export const engineContext: EngineContext = { countries };
