import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import rawTopology from "world-atlas/countries-110m.json";
import { COUNTRY_GEO_IDS } from "./country-geo-ids";

const topology = rawTopology as unknown as Topology;
const countriesObject = topology.objects.countries!;

/** Every country's landmass, low-resolution (Natural Earth via world-atlas, public domain). */
export const WORLD_COUNTRIES: FeatureCollection<Geometry, { name: string }> = feature(
  topology,
  countriesObject,
) as unknown as FeatureCollection<Geometry, { name: string }>;

const featureById = new Map(WORLD_COUNTRIES.features.map((f) => [String(f.id), f]));
const alpha2ById = new Map(Object.entries(COUNTRY_GEO_IDS).map(([alpha2, id]) => [id, alpha2]));

/**
 * [lon, lat] for covered destinations too small to have any polygon in the 110m
 * atlas. They're drawn as marker dots instead — without this a country we cover
 * would silently look uncovered on the map. A unit test fails if a verified
 * destination has neither a polygon nor an entry here.
 */
export const MICRO_STATE_COORDS: Record<string, [number, number]> = {
  SG: [103.82, 1.35],
  HK: [114.17, 22.32],
  MV: [73.5, 3.2],
};

/** The country's geometry, or undefined if this alpha-2 code isn't in our crosswalk or the atlas. */
export function countryFeature(alpha2: string) {
  const id = COUNTRY_GEO_IDS[alpha2.toUpperCase()];
  return id ? featureById.get(id) : undefined;
}

/** The alpha-2 code for a world-atlas feature id, or undefined if it's outside our crosswalk. */
export function alpha2ForFeatureId(id: string | number | undefined): string | undefined {
  return id === undefined ? undefined : alpha2ById.get(String(id));
}
