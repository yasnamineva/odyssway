import type { CustomsItemRecord, DestinationRecord } from "@odyssway/engine";
import rawCountriesFile from "../../../data/countries.json";
import { countries, customsCodeFor } from "./countries";
import { customsItems, destinations } from "./destinations";
import { nationalityRules, type NationalityRule } from "./nationalities";

/**
 * Hub and item pages for each Schengen state (owner-approved 2026-11-02). Schengen
 * members never get a row in destinations.json (AGENTS.md §5.9): their entry rule is
 * the shared Schengen one, resolved from nationality-rules.json, and their customs
 * rows are the harmonised EU rows (or their own customs territory's) plus any
 * national rows keyed by their code. This module derives page records from
 * countries.json so nothing is duplicated, and it is used only by the hub, item and
 * sitemap routes, not by Trip Check or the destination pickers.
 */
const countriesFile = rawCountriesFile as {
  legal_source: { name: string; url: string };
  verified_at: string;
  verified_by: string;
};

const SCHENGEN_SOURCE_URL = "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en";

export const schengenDestinations: DestinationRecord[] = countries
  .filter((c) => c.schengenMember && !destinations.some((d) => d.code === c.code))
  .map((c) => ({
    code: c.code,
    name: c.name,
    region: "Europe (Schengen Area)",
    officialAuthorityUrl: SCHENGEN_SOURCE_URL,
    legal_source: countriesFile.legal_source,
    verified_at: countriesFile.verified_at,
    verified_by: countriesFile.verified_by,
    status: "verified" as const,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function isSchengenHub(code: string): boolean {
  return schengenDestinations.some((d) => d.code === code);
}

/**
 * The customs rows that answer for a Schengen state: its own national rows, then the
 * rows of its customs territory (the harmonised "EU" rows for EU members, the Swiss
 * rows for Liechtenstein). Norway, Iceland and Switzerland have only their own rows.
 * Same resolution as Trip Check (`customsCodeFor`), so pages and tool never disagree.
 */
export function schengenCustomsRows(code: string): CustomsItemRecord[] {
  const territory = customsCodeFor(code);
  return customsItems
    .filter((i) => i.status === "verified" && (i.destination === code || (territory !== code && i.destination === territory)))
    .sort((a, b) => Number(b.destination === code) - Number(a.destination === code) || a.slug.localeCompare(b.slug));
}

export type SchengenEntryGroup = "free_movement" | "visa_free" | "visa_required";

/** Each passport's Schengen status, grouped for the hub page. */
export function schengenEntryGroups(): Array<{ group: SchengenEntryGroup; nationalities: NationalityRule[] }> {
  const verified = nationalityRules.filter((n) => n.status === "verified");
  const byName = (a: NationalityRule, b: NationalityRule) => a.name.localeCompare(b.name);
  return [
    { group: "free_movement" as const, nationalities: verified.filter((n) => n.euCitizen || n.eeaSwissNational).sort(byName) },
    {
      group: "visa_free" as const,
      nationalities: verified.filter((n) => !n.euCitizen && !n.eeaSwissNational && n.visaExempt).sort(byName),
    },
    {
      group: "visa_required" as const,
      nationalities: verified.filter((n) => !n.euCitizen && !n.eeaSwissNational && n.schengenVisaRequired).sort(byName),
    },
  ].filter((g) => g.nationalities.length > 0);
}
