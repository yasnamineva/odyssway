"use client";

import { geoCentroid, geoEquirectangular, geoPath } from "d3-geo";
import { useMemo } from "react";
import { alpha2ForFeatureId, countryFeature, WORLD_COUNTRIES } from "../lib/world-map-data";

const WIDTH = 720;
const HEIGHT = 380;

const STRIP_COUNTED = "#3767a8";
const MARK_ORIGIN = "#d97706";
/** Distinct from STRIP_COUNTED so the destination marker stays visible when its country is highlighted the same color. */
const MARK_DESTINATION = "#0f172a";

export interface WorldMapProps {
  /** Alpha-2 code for the "from" point. */
  originCode?: string;
  /** Alpha-2 code for the "to" point. */
  destinationCode?: string;
  /** Additional country codes to tint (e.g. the whole Schengen Area) without a marker. */
  highlightCodes?: string[];
  originLabel?: string;
  destinationLabel?: string;
}

export default function WorldMap({
  originCode,
  destinationCode,
  highlightCodes = [],
  originLabel,
  destinationLabel,
}: WorldMapProps) {
  const projection = useMemo(
    () => geoEquirectangular().fitSize([WIDTH, HEIGHT], WORLD_COUNTRIES),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const highlightSet = new Set(highlightCodes.map((c) => c.toUpperCase()));
  if (originCode) highlightSet.add(originCode.toUpperCase());
  if (destinationCode) highlightSet.add(destinationCode.toUpperCase());

  const originPoint = originCode ? pointFor(originCode, projection) : null;
  const destinationPoint = destinationCode ? pointFor(destinationCode, projection) : null;

  const arcPath =
    originPoint && destinationPoint && originCode !== destinationCode
      ? buildArc(originPoint, destinationPoint)
      : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={
        originLabel && destinationLabel
          ? `Map showing a route from ${originLabel} to ${destinationLabel}`
          : "World map"
      }
      className="h-auto w-full"
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#eef4fb" />
      {WORLD_COUNTRIES.features.map((f, i) => {
        const code = alpha2ForFeatureId(f.id);
        const isHighlighted = code !== undefined && highlightSet.has(code);
        return (
          <path
            // Natural Earth's low-res atlas reuses id "-99" for several
            // unrecognized territories, so id alone isn't a unique key.
            key={`${f.id}-${i}`}
            d={path(f) ?? undefined}
            fill={isHighlighted ? STRIP_COUNTED : "#d7e2ee"}
            stroke="#ffffff"
            strokeWidth={0.5}
          />
        );
      })}
      {arcPath && <path d={arcPath} fill="none" stroke="#334155" strokeWidth={1.5} strokeDasharray="4 3" />}
      {originPoint && <Marker point={originPoint} color={MARK_ORIGIN} label={originLabel} />}
      {destinationPoint && (
        <Marker point={destinationPoint} color={MARK_DESTINATION} label={destinationLabel} />
      )}
    </svg>
  );
}

/** Classic map-pin outline, tip at local (12, 24) — the anchor point every
 * caller positions at the actual geographic coordinate. */
const PIN_PATH = "M12 24s8-9.5 8-15A8 8 0 104 9c0 5.5 8 15 8 15z";
const PIN_SCALE = 0.85;

function Marker({
  point,
  color,
  label,
}: {
  point: [number, number];
  color: string;
  label?: string;
}) {
  const [x, y] = point;
  const pinHeight = 24 * PIN_SCALE;
  return (
    <g>
      <path
        d={PIN_PATH}
        transform={`translate(${x - 12 * PIN_SCALE}, ${y - pinHeight}) scale(${PIN_SCALE})`}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.2}
      />
      <circle cx={x} cy={y - pinHeight + 8 * PIN_SCALE} r={2.6} fill="#ffffff" />
      {label && (
        <text
          x={x}
          y={y - pinHeight - 4}
          textAnchor="middle"
          className="font-sans"
          fontSize={11}
          fontWeight={600}
          fill="#1e293b"
          stroke="#ffffff"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function pointFor(
  alpha2: string,
  projection: ReturnType<typeof geoEquirectangular>,
): [number, number] | null {
  const f = countryFeature(alpha2);
  if (!f) return null;
  const centroid = geoCentroid(f);
  const projected = projection(centroid);
  return projected ? [projected[0], projected[1]] : null;
}

/** A gently bowed "flight path" between two points, always arcing upward on screen. */
function buildArc(from: [number, number], to: [number, number]): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const bow = Math.min(dist * 0.25, 60);
  const controlX = (x1 + x2) / 2;
  const controlY = (y1 + y2) / 2 - bow;
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}
