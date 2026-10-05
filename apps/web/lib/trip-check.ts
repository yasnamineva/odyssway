import {
  MAX_DAYS_IN_WINDOW,
  WINDOW_DAYS,
  type CustomsItemRecord,
  type StayPolicy,
} from "@odyssway/engine";
import { countries, countryName, schengenCountries } from "./countries";
import {
  EU_CUSTOMS_CODE,
  customsItems,
  destinationByCode,
  entryRequirements,
  queuedDestinations,
} from "./destinations";
import { expandQuery, isFuzzyMatch } from "./fuzzy-match";
import { nationalityBySlug } from "./nationalities";

import { SCHENGEN_DESTINATION } from "./schengen-sentinel";

export { SCHENGEN_DESTINATION };

export type EntryBasis =
  | "citizen"
  | "free_movement"
  | "visa_free"
  | "eta_required"
  | "visa_required"
  | "visa_on_arrival"
  | "not_covered";

export interface TripCheckItemResult {
  query: string;
  match: CustomsItemRecord | null;
}

export interface TripCheckResult {
  nationality: string;
  /** Resolved destination code — a real country code, or SCHENGEN_DESTINATION. */
  destination: string;
  /** Always a real, mappable alpha-2 code — for the Schengen-Area-unspecified pick, a representative member state. */
  mapDestinationCode: string;
  destinationName: string;
  isSchengen: boolean;
  covered: boolean;
  basis: EntryBasis;
  stayPolicy: StayPolicy | null;
  documentsNeeded: string[];
  notes?: string;
  legalSource?: { name: string; url: string };
  /** When the cited row was last checked against its source (YYYY-MM-DD). */
  verifiedAt?: string;
  /** Set when `covered` is false and we at least know where to point the user. */
  officialAuthorityUrl?: string;
  items: TripCheckItemResult[];
  /** True for EU-citizen travel within the EU/Schengen: the customs data covers
   * arrivals from outside the EU, so item verdicts are withheld rather than
   * shown for the wrong situation. */
  intraEuCustoms?: boolean;
}

/** SBC Art. 6(1) entry conditions, already this project's foundational legal basis (see engine README / 90-180-rule content). */
const SCHENGEN_DOCUMENTS = [
  "A valid travel document (passport) recognized for crossing the border",
  "A visa, if your nationality requires one for a Schengen short stay",
  "Proof of the purpose and conditions of your stay (e.g. accommodation, itinerary)",
  "Sufficient funds for your stay and return journey",
];
/** Your Europe, "Travel documents for EU citizens" (checked 2026-10-02). */
const EU_CITIZEN_DOCUMENTS = ["A valid passport or national identity card"];
const SCHENGEN_LEGAL_SOURCE = {
  name: "Regulation (EU) 2016/399 (Schengen Borders Code), Art. 6(1)",
  url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0399-20251012",
};

function isSchengenCode(code: string): boolean {
  return schengenCountries.some((c) => c.code === code.toUpperCase());
}

/** EU members (incl. non-Schengen IE/CY) plus the Schengen states — everywhere
 * an EU citizen travels on free movement, per the Your Europe source below. */
function isFreeMovementDestination(code: string): boolean {
  const upper = code.toUpperCase();
  return upper === SCHENGEN_DESTINATION || isSchengenCode(upper) || countries.some((c) => c.code === upper && c.euMember);
}

/** Symbolic member state used to place the map marker when "Schengen Area, unspecified" is picked. */
const SCHENGEN_REPRESENTATIVE_CODE = "BE";

function resolveEntry(
  nationality: string,
  destination: string,
): Pick<
  TripCheckResult,
  | "destination"
  | "mapDestinationCode"
  | "destinationName"
  | "isSchengen"
  | "covered"
  | "basis"
  | "stayPolicy"
  | "documentsNeeded"
  | "notes"
  | "legalSource"
  | "verifiedAt"
  | "officialAuthorityUrl"
> {
  const nat = nationality.toUpperCase();
  const dest = destination.toUpperCase();

  if (nat === dest) {
    return {
      destination: dest,
      mapDestinationCode: dest,
      destinationName: dest,
      isSchengen: false,
      covered: true,
      basis: "citizen",
      stayPolicy: null,
      documentsNeeded: [],
      notes: "You're a citizen of your destination — none of these rules apply to you.",
    };
  }

  const natRule = nationalityBySlug(nat);
  if (natRule?.euCitizen && natRule.status === "verified" && isFreeMovementDestination(dest)) {
    const schengen = dest === SCHENGEN_DESTINATION || isSchengenCode(dest);
    return {
      destination: schengen ? SCHENGEN_DESTINATION : dest,
      mapDestinationCode: dest === SCHENGEN_DESTINATION ? SCHENGEN_REPRESENTATIVE_CODE : dest,
      destinationName: schengen ? "Schengen Area" : countryName(dest),
      isSchengen: schengen,
      covered: true,
      basis: "free_movement",
      stayPolicy: null,
      documentsNeeded: [...EU_CITIZEN_DOCUMENTS],
      notes: natRule.notes,
      legalSource: natRule.legal_source,
      verifiedAt: natRule.verified_at ?? undefined,
    };
  }

  if (dest === SCHENGEN_DESTINATION || isSchengenCode(dest)) {
    const mapDestinationCode = dest === SCHENGEN_DESTINATION ? SCHENGEN_REPRESENTATIVE_CODE : dest;
    const rule = natRule;
    if (!rule || rule.status !== "verified") {
      return {
        destination: SCHENGEN_DESTINATION,
        mapDestinationCode,
        destinationName: "Schengen Area",
        isSchengen: true,
        covered: false,
        basis: "not_covered",
        stayPolicy: null,
        documentsNeeded: [],
      };
    }
    return {
      destination: SCHENGEN_DESTINATION,
      mapDestinationCode,
      destinationName: "Schengen Area",
      isSchengen: true,
      covered: true,
      basis: rule.schengenVisaRequired ? "visa_required" : "visa_free",
      stayPolicy: { kind: "rolling_window", windowDays: WINDOW_DAYS, maxDays: MAX_DAYS_IN_WINDOW },
      documentsNeeded: SCHENGEN_DOCUMENTS,
      notes: rule.notes,
      legalSource: SCHENGEN_LEGAL_SOURCE,
      verifiedAt: rule.verified_at ?? undefined,
    };
  }

  const row = entryRequirements.find(
    (r) => r.nationality === nat && r.destination === dest && r.status === "verified",
  );
  const destRecord = destinationByCode(dest);
  const destinationName =
    destRecord?.name ?? queuedDestinations.find((d) => d.code === dest)?.name ?? dest;
  const officialAuthorityUrl =
    destRecord?.officialAuthorityUrl ?? queuedDestinations.find((d) => d.code === dest)?.officialAuthorityUrl;

  if (!row) {
    return {
      destination: dest,
      mapDestinationCode: dest,
      destinationName,
      isSchengen: false,
      covered: false,
      basis: "not_covered",
      stayPolicy: null,
      documentsNeeded: [],
      officialAuthorityUrl,
    };
  }

  const basis: EntryBasis =
    row.requirement === "visa_free"
      ? "visa_free"
      : row.requirement === "eta_required"
        ? "eta_required"
        : row.requirement === "visa_on_arrival"
          ? "visa_on_arrival"
          : "visa_required";

  return {
    destination: dest,
    mapDestinationCode: dest,
    destinationName: destRecord?.name ?? dest,
    isSchengen: false,
    covered: true,
    basis,
    stayPolicy: row.stayPolicy,
    documentsNeeded: row.documentsNeeded,
    notes: row.notes,
    legalSource: row.legal_source,
    verifiedAt: row.verified_at ?? undefined,
  };
}

/**
 * The real, mappable alpha-2 code for a raw destination picker value — same
 * Schengen-sentinel handling as resolveEntry, exposed standalone so the UI can
 * preview the map before a full trip check (nationality + items) is submitted.
 */
export function resolveMapDestinationCode(destination: string): string {
  const dest = destination.toUpperCase();
  return dest === SCHENGEN_DESTINATION ? SCHENGEN_REPRESENTATIVE_CODE : dest;
}

/**
 * Case-insensitive match against an item's slug or its synonym list — tried
 * in three passes, cheapest/most-precise first: exact, then substring, then
 * (as a last resort) typo/abbreviation-tolerant fuzzy matching. Each pass
 * runs across every query variant (the raw text plus any known alias) before
 * falling through to the next, so an exact alias hit always beats a fuzzy
 * guess on the raw text.
 */
function matchItem(query: string, destinationCode: string): CustomsItemRecord | null {
  const variants = expandQuery(query).filter(Boolean);
  if (variants.length === 0) return null;

  const candidates = customsItems.filter(
    (item) => item.destination === destinationCode && item.status === "verified",
  );

  for (const q of variants) {
    const exact = candidates.find(
      (item) => item.slug.replace(/-/g, " ") === q || item.names.some((n) => n.toLowerCase() === q),
    );
    if (exact) return exact;
  }

  for (const q of variants) {
    const substring = candidates.find(
      (item) =>
        item.slug.includes(q.replace(/\s+/g, "-")) ||
        item.names.some((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase())),
    );
    if (substring) return substring;
  }

  for (const q of variants) {
    const fuzzy = candidates.find((item) => item.names.some((n) => isFuzzyMatch(q, n)));
    if (fuzzy) return fuzzy;
  }

  return null;
}

export function resolveTripCheck(
  nationality: string,
  destination: string,
  itemQueries: string[],
): TripCheckResult {
  const entry = resolveEntry(nationality, destination);
  const customsDestination = entry.isSchengen ? EU_CUSTOMS_CODE : entry.destination;
  const intraEuCustoms = entry.basis === "free_movement";
  const items: TripCheckItemResult[] = itemQueries
    .map((q) => q.trim())
    .filter(Boolean)
    .map((query) => ({ query, match: intraEuCustoms ? null : matchItem(query, customsDestination) }));

  return {
    nationality: nationality.toUpperCase(),
    ...entry,
    items,
    ...(intraEuCustoms ? { intraEuCustoms } : {}),
  };
}
