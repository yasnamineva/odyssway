import { countryName } from "../../lib/countries";
import { publishedEesRecords } from "../../lib/ees";
import { publishedOverstayPenalties } from "../../lib/overstay-penalties";

/** Country links in columns, alphabetical by name. */
export function CountryGrid({ codes, basePath }: { codes: string[]; basePath: string }) {
  const countries = codes
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
      {countries.map((c) => (
        <li key={c.code}>
          <a
            href={`${basePath}/${c.code.toLowerCase()}`}
            className="block py-1.5 text-[15px] text-brand-800 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700"
          >
            {c.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Every EES country with a verified correction guide. */
export function EesCountryGrid() {
  return <CountryGrid codes={publishedEesRecords.map((r) => r.country)} basePath="/ees/data-access" />;
}

/** Every Schengen country with verified national overstay penalties. */
export function OverstayCountryGrid() {
  return (
    <CountryGrid codes={publishedOverstayPenalties.map((r) => r.country)} basePath="/rules/overstay-penalties" />
  );
}
