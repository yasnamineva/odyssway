import { countryName } from "../../lib/countries";
import { publishedEesRecords } from "../../lib/ees";
import { publishedOverstayPenalties } from "../../lib/overstay-penalties";

/** A tap-sized grid of country links, alphabetical by name. */
export function CountryGrid({ codes, basePath }: { codes: string[]; basePath: string }) {
  const countries = codes
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {countries.map((c) => (
        <li key={c.code}>
          <a
            href={`${basePath}/${c.code.toLowerCase()}`}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 no-underline transition hover:border-slate-900"
          >
            <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-600">
              {c.code}
            </span>
            <span className="min-w-0 break-words">{c.name}</span>
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
