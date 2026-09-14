"use client";

import { geoCentroid, geoEquirectangular, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinations } from "../lib/destinations";
import { alpha2ForFeatureId, countryFeature, WORLD_COUNTRIES } from "../lib/world-map-data";

const WIDTH = 960;
const HEIGHT = 460;
const SCHENGEN_FILL = "#d3e0ee";

/** One color per region — pins are grouped/legended by this, not by
 * destination, so the legend stays a handful of items even as coverage
 * grows past two dozen individual destinations. */
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

/** Classic map-pin outline, tip at local (12, 24) — matches WorldMap.tsx's marker. */
const PIN_PATH = "M12 24s8-9.5 8-15A8 8 0 104 9c0 5.5 8 15 8 15z";
const PIN_SCALE = 0.6;

function PinIcon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className}>
      <path d={PIN_PATH} />
    </svg>
  );
}

/**
 * "Where Trip Check covers" — every verified non-Schengen destination as a
 * region-colored pin, plus the whole Schengen Area tinted as one bloc
 * (individually pinning all 29 members would just be visual noise at this
 * scale). Static/no interactivity, so this stays a lightweight SVG render —
 * dynamically imported (see app/page.tsx) purely to keep the ~100KB country
 * geometry out of the initial homepage bundle, matching WorldMap.tsx.
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

  const pins = useMemo(
    () =>
      destinations
        .filter((d) => d.status === "verified")
        .map((d) => {
          const feature = countryFeature(d.code);
          if (!feature) return null;
          const centroid = geoCentroid(feature);
          const point = projection(centroid);
          if (!point) return null;
          return { code: d.code, name: d.name, region: d.region, point };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null),
    [projection],
  );

  const regionsPresent = useMemo(() => {
    const seen = new Set(pins.map((p) => p.region));
    return Object.keys(REGION_COLORS).filter((r) => seen.has(r));
  }, [pins]);

  const filterOptions = [...regionsPresent, SCHENGEN_KEY];
  const visiblePins =
    activeFilter && activeFilter !== SCHENGEN_KEY
      ? pins.filter((p) => p.region === activeFilter)
      : pins;
  const showSchengen = !activeFilter || activeFilter === SCHENGEN_KEY;
  const showPins = activeFilter !== SCHENGEN_KEY;

  return (
    <div>
      {/* Pill-outlined filter legend, reference2-style — a real region
          filter, not decorative: clicking a pill isolates that region's
          pins on the map, clicking it again (or "All") resets. */}
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
                <PinIcon color={active ? "#ffffff" : color} className="h-3 w-3 shrink-0" />
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
          return (
            <path
              key={`${f.id}-${i}`}
              d={path(f) ?? undefined}
              fill={isSchengen && showSchengen ? SCHENGEN_FILL : "#e6edf5"}
              stroke="#ffffff"
              strokeWidth={0.5}
            />
          );
        })}
        {showPins &&
          visiblePins.map((p) => {
            const [x, y] = p.point;
            const color = REGION_COLORS[p.region] ?? FALLBACK_COLOR;
            const pinHeight = 24 * PIN_SCALE;
            return (
              <g key={p.code}>
                <title>{p.name}</title>
                <path
                  d={PIN_PATH}
                  transform={`translate(${x - 12 * PIN_SCALE}, ${y - pinHeight}) scale(${PIN_SCALE})`}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
                <circle cx={x} cy={y - pinHeight + 8 * PIN_SCALE} r={1.8} fill="#ffffff" />
              </g>
            );
          })}
      </svg>
    </div>
  );
}
