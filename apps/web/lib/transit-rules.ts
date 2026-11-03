import { schemas, type TransitHubRecord, type TransitRuleRecord } from "@odyssway/engine";
import rawTransit from "../../../data/transit-rules.json";
import { schengenCountries } from "./countries";

/**
 * Changing planes without passing immigration (data/transit-rules.json).
 * Verified hubs only; a hub we haven't verified resolves to undefined and the
 * UI says so rather than guessing.
 */
export const transitHubs: TransitHubRecord[] = schemas.transitRulesFileSchema
  .parse(rawTransit)
  .filter((h) => h.status === "verified") as TransitHubRecord[];

export interface AirsideTransit {
  hubName: string;
  rule: TransitRuleRecord;
  /** Applies to every passenger at the hub. */
  hubNotes?: string;
  legalSource: { name: string; url: string };
  sources: Array<{ claim?: string; name: string; url: string }>;
  verifiedAt?: string;
}

/** The airside rule for this passport when changing planes in `hubCode`, if we've verified that hub. */
export function resolveAirsideTransit(nationality: string, hubCode: string): AirsideTransit | undefined {
  const nat = nationality.toUpperCase();
  const code = hubCode.toUpperCase();
  const isSchengen = schengenCountries.some((c) => c.code === code);
  const hub = transitHubs.find((h) => h.hub === code) ?? (isSchengen ? transitHubs.find((h) => h.hub === "SCHENGEN") : undefined);
  if (!hub) return undefined;
  const listed = hub.rules.find(
    (r) => r.nationalities?.includes(nat) && (!r.states || r.states.includes(code)),
  );
  const rule = listed ?? hub.rules.find((r) => r.others);
  if (!rule) return undefined;
  return {
    hubName: hub.name,
    rule,
    ...(hub.notes ? { hubNotes: hub.notes } : {}),
    legalSource: hub.legal_source,
    sources: hub._sources?.length ? hub._sources : [hub.legal_source],
    ...(hub.verified_at ? { verifiedAt: hub.verified_at } : {}),
  };
}
