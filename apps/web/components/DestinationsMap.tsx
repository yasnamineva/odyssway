"use client";

import { geoEquirectangular, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinations } from "../lib/destinations";
import { alpha2ForFeatureId, WORLD_COUNTRIES } from "../lib/world-map-data";

const WIDTH = 960;
const HEIGHT = 460;
/** Baseline tint (shown whenever Schengen isn't specifically filtered out)
 * vs. a bolder shade + thicker stroke when the Schengen pill is actively
 * selected — without this distinction, clicking "Schengen Area" produced
 * no visible change at all, since the bloc was already tinted by default. */
const SCHENGEN_FILL_DEFAULT = "#d3e0ee";
const SCHENGEN_FILL_ACTIVE = "#4a6f96";
const NEUTRAL_FILL = "#e6edf5";

/** One color per region, used to fill each covered country's actual shape
 * (not a pin) — a small dot reads as "barely anything here" at world-map
 * scale, but a filled country, especially a large one, reads as real
 * coverage at a glance. This is deliberately the opposite framing from a
 * pin-based map. */
const REGION_COLORS: Record<string, string> = {
  "North America": "#4e79a7",
  "South America": "#ff9da7",
  Europe: "#76b7b2",
  "Europe/Asia": "#af7aa1",
  Africa: "#59a14f",
  "Middle East": "#e15759",
  Asia: "#f28e2b",
  Oceania: "#edc949",
};
const FALLBACK_COLOR = "#8298b3";
const SCHENGEN_KEY = "Schengen Area";

/**
 * "Where Trip Check covers" — every verified non-Schengen destination filled
 * in its region's color (not a pin), plus the whole Schengen Area tinted as
 * one bloc. Static/no interactivity beyond the region filter, so this stays
 * a lightweight SVG render — dynamically imported (see app/page.tsx) purely
 * to keep the ~100KB country geometry out of the initial homepage bundle,
 * matching WorldMap.tsx.
 */
export default function DestinationsMap() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const projection = useMemo(
    () => geoEquirectangular().fitSize([WIDTH, HEIGHT], WORLD_COUNTRIES),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const schengenSet = useMemo(
    () => new Set(schengenCountries.map((c) => c.code)),
    [],
  );

  const destinationByCode = useMemo(() => {
    const map = new Map<string, { name: string; region: string }>();
    for (const d of destinations) {
      if (d.status === "verified") map.set(d.code, { name: d.name, region: d.region });
    }
    return map;
  }, []);

  const regionsPresent = useMemo(() => {
    const seen = new Set([...destinationByCode.values()].map((d) => d.region));
    return Object.keys(REGION_COLORS).filter((r) => seen.has(r));
  }, [destinationByCode]);

  const filterOptions = [...regionsPresent, SCHENGEN_KEY];
  const showSchengen = !activeFilter || activeFilter === SCHENGEN_KEY;
  const schengenActive = activeFilter === SCHENGEN_KEY;
  const schengenFilterOnly = activeFilter === SCHENGEN_KEY;

  return (
    <div>
      {/* Pill-outlined filter legend, reference2-style — a real region
          filter, not decorative: clicking a pill isolates that region's
          countries on the map, clicking it again (or "All") resets. */}
      <ul className="mb-4 flex flex-wrap justify-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === null
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            All
          </button>
        </li>
        {filterOptions.map((region) => {
          const isSchengen = region === SCHENGEN_KEY;
          const color = isSchengen ? "#6f8aa8" : (REGION_COLORS[region] ?? FALLBACK_COLOR);
          const active = activeFilter === region;
          return (
            <li key={region}>
              <button
                type="button"
                onClick={() => setActiveFilter(active ? null : region)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? "#ffffff" : color }}
                />
                {isSchengen ? "Schengen Area (29 states)" : region}
              </button>
            </li>
          );
        })}
      </ul>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="World map showing every destination Trip Check currently covers"
        className="h-auto w-full"
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#eef4fb" />
        {WORLD_COUNTRIES.features.map((f, i) => {
          const code = alpha2ForFeatureId(f.id);
          const isSchengen = code !== undefined && schengenSet.has(code);
          const dest = code !== undefined ? destinationByCode.get(code) : undefined;
          const destVisible = dest !== undefined && !schengenFilterOnly && (!activeFilter || activeFilter === dest.region);

          let fill = NEUTRAL_FILL;
          let strokeWidth = 0.5;
          if (isSchengen && showSchengen) {
            fill = schengenActive ? SCHENGEN_FILL_ACTIVE : SCHENGEN_FILL_DEFAULT;
            strokeWidth = schengenActive ? 1.25 : 0.5;
          } else if (destVisible) {
            fill = REGION_COLORS[dest.region] ?? FALLBACK_COLOR;
            strokeWidth = activeFilter === dest.region ? 1.25 : 0.5;
          }

          return (
            <path key={`${f.id}-${i}`} d={path(f) ?? undefined} fill={fill} stroke="#ffffff" strokeWidth={strokeWidth}>
              {dest ? <title>{dest.name}</title> : null}
            </path>
          );
        })}
      </svg>
    </div>
  );
}
