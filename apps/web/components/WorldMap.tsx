"use client";

import { geoCentroid, geoEquirectangular, geoGraticule10, geoPath } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import { alpha2ForFeatureId, countryFeature, MICRO_STATE_COORDS, WORLD_COUNTRIES } from "../lib/world-map-data";

const WIDTH = 720;
const HEIGHT = 380;

export type MapStopKind = "origin" | "transit" | "destination";

export interface MapStop {
  /** Alpha-2 code. */
  code: string;
  label?: string;
  kind: MapStopKind;
}

/** Fill for a country on the route, and the matching pin colour. */
const KIND_STYLE: Record<MapStopKind, { fill: string; pin: string }> = {
  origin: { fill: "#f6d6a8", pin: "#d97706" },
  transit: { fill: "#bfd7f5", pin: "#2563eb" },
  destination: { fill: "#9fd4b4", pin: "#1f7a48" },
};
const HIGHLIGHT_FILL = "#c9e6d3";
const LAND = "#e4dfd6";
const ROUTE = "#1e3a5f";

export interface WorldMapProps {
  /** The route in travel order. Consecutive stops are joined by a flight arc. */
  stops?: MapStop[];
  /** Additional country codes to tint (e.g. the whole Schengen Area) without a pin. */
  highlightCodes?: string[];
  /** Legend labels; the legend lists only kinds present on the route. */
  legend?: Partial<Record<MapStopKind, string>>;
  ariaLabel?: string;
}

export default function WorldMap({ stops = [], highlightCodes = [], legend, ariaLabel }: WorldMapProps) {
  const projection = useMemo(() => geoEquirectangular().fitSize([WIDTH, HEIGHT], WORLD_COUNTRIES), []);
  const path = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => path(geoGraticule10()) ?? undefined, [path]);

  // De-duplicate consecutive repeats; keep every stop that can be placed.
  const placed = stops
    .filter((s, i) => s.code && (i === 0 || s.code !== stops[i - 1]!.code))
    .map((s) => ({ ...s, code: s.code.toUpperCase(), point: pointFor(s.code, projection) }))
    .filter((s): s is MapStop & { point: [number, number] } => s.point !== null);

  const kindByCode = new Map<string, MapStopKind>();
  for (const s of placed) if (!kindByCode.has(s.code) || s.kind === "destination") kindByCode.set(s.code, s.kind);
  const highlightSet = new Set(highlightCodes.map((c) => c.toUpperCase()));

  // The rendered size, so the view fits the box's real shape (taller on phones)
  // and pins and labels keep a readable size in screen pixels.
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 640, h: 338 });
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (r && r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom to the route: a box around the stops, padded, at least a third of
  // the world wide and at most the whole world.
  const box = viewBoxFor(placed.map((s) => s.point), size.w / size.h);
  const k = box.w / size.w; // map units per screen pixel

  // Labels sit above their pin unless that would overlap an earlier label; then below.
  const labelBelow = placeLabels(placed, k);
  // Keep each label inside the visible frame.
  const labelX = placed.map((s) => {
    const half = ((s.label?.length ?? 0) * 7.2 * k) / 2 + 4 * k;
    return Math.min(Math.max(s.point[0], box.x + half), box.x + box.w - half);
  });

  const arcs = placed.slice(1).map((s, i) => buildArc(placed[i]!.point, s.point, k));
  const legendKinds = (["origin", "transit", "destination"] as MapStopKind[]).filter(
    (kind) => legend?.[kind] && placed.some((s) => s.kind === kind),
  );

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div ref={frameRef} className="aspect-[16/10] w-full sm:aspect-[720/380]">
      <svg
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        role="img"
        aria-label={ariaLabel ?? "World map"}
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="wm-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef5fb" />
            <stop offset="1" stopColor="#dde9f4" />
          </linearGradient>
          <marker id="wm-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={ROUTE} />
          </marker>
          <filter id="wm-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy={0.8 * k} stdDeviation={1.2 * k} floodOpacity="0.25" />
          </filter>
        </defs>
        <rect x={-WIDTH} y={-HEIGHT} width={WIDTH * 3} height={HEIGHT * 3} fill="url(#wm-sea)" />
        {graticule && <path d={graticule} fill="none" stroke="#c7d8e8" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />}
        {WORLD_COUNTRIES.features.map((f, i) => {
          const code = alpha2ForFeatureId(f.id);
          const kind = code ? kindByCode.get(code) : undefined;
          const fill = kind ? KIND_STYLE[kind].fill : code && highlightSet.has(code) ? HIGHLIGHT_FILL : LAND;
          return (
            <path
              // Natural Earth's low-res atlas reuses id "-99" for several
              // unrecognized territories, so id alone isn't a unique key.
              key={`${f.id}-${i}`}
              d={path(f) ?? undefined}
              fill={fill}
              stroke="#ffffff"
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {arcs.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.8} />
            <path
              d={d}
              fill="none"
              stroke={ROUTE}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              markerEnd="url(#wm-arrow)"
              className="wm-route"
            />
          </g>
        ))}
        {placed.map((s, i) => (
          <Pin
            key={`${s.code}-${i}`}
            point={s.point}
            color={KIND_STYLE[s.kind].pin}
            n={placed.length > 2 ? i + 1 : undefined}
            label={s.label}
            below={labelBelow[i]}
            labelX={labelX[i]}
            k={k}
          />
        ))}
        <style>{`
          .wm-route { animation: wm-dash 1.2s linear infinite; }
          @keyframes wm-dash { to { stroke-dashoffset: -20; } }
          @media (prefers-reduced-motion: reduce) { .wm-route { animation: none; } }
        `}</style>
      </svg>
      </div>
      {legendKinds.length > 0 && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
          {legendKinds.map((kind) => (
            <span key={kind} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_STYLE[kind].pin }} />
              {legend![kind]}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

/** Pin with a white ring; `n` numbers the stop when the route has three or more. */
function Pin({
  point,
  color,
  n,
  label,
  below,
  labelX,
  k,
}: {
  point: [number, number];
  color: string;
  n?: number;
  label?: string;
  below?: boolean;
  labelX?: number;
  k: number;
}) {
  const [x, y] = point;
  const r = 10 * k;
  const lift = 20 * k;
  return (
    <g filter="url(#wm-shadow)">
      <path
        d={`M ${x} ${y} L ${x - r * 0.62} ${y - lift + r * 0.5} A ${r} ${r} 0 1 1 ${x + r * 0.62} ${y - lift + r * 0.5} Z`}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.4 * k}
      />
      {n !== undefined ? (
        <text x={x} y={y - lift + 4 * k} textAnchor="middle" fontSize={11 * k} fontWeight={700} fill="#ffffff">
          {n}
        </text>
      ) : (
        <circle cx={x} cy={y - lift} r={3.5 * k} fill="#ffffff" />
      )}
      {label && (
        <text
          x={labelX ?? x}
          y={below ? y + 16 * k : y - lift - r - 4 * k}
          textAnchor="middle"
          className="font-sans"
          fontSize={13 * k}
          fontWeight={600}
          fill="#1f1b16"
          stroke="#ffffff"
          strokeWidth={3.5 * k}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Rough label boxes in map units; true for each label that should go below its pin. */
function placeLabels(stops: Array<{ point: [number, number]; label?: string }>, k: number): boolean[] {
  const boxes: Array<[number, number, number, number]> = [];
  const overlaps = (a: [number, number, number, number]) =>
    boxes.some((b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]);
  return stops.map(({ point: [x, y], label }) => {
    if (!label) return false;
    const half = (label.length * 7.2 * k) / 2;
    const above: [number, number, number, number] = [x - half, y - 50 * k, x + half, y - 30 * k];
    const under: [number, number, number, number] = [x - half, y + 3 * k, x + half, y + 20 * k];
    const below = overlaps(above) && !overlaps(under);
    boxes.push(below ? under : above);
    return below;
  });
}

function pointFor(alpha2: string, projection: ReturnType<typeof geoEquirectangular>): [number, number] | null {
  const code = alpha2.toUpperCase();
  const f = countryFeature(code);
  const lonLat = f ? geoCentroid(f) : MICRO_STATE_COORDS[code];
  if (!lonLat) return null;
  const projected = projection(lonLat);
  return projected ? [projected[0], projected[1]] : null;
}

/** The part of the world map to show: the stops' bounding box, padded, kept to the map's aspect ratio. */
function viewBoxFor(points: [number, number][], aspect: number): { x: number; y: number; w: number; h: number } {
  const fit = (w: number, h: number, cx: number, cy: number) => {
    // Grow to the frame's shape, cap at the whole world's width, then centre
    // on the route and keep inside the map where it can.
    if (w / h < aspect) w = h * aspect;
    else h = w / aspect;
    if (w > WIDTH) {
      w = WIDTH;
      h = w / aspect;
    }
    const x = Math.min(Math.max(cx - w / 2, 0), WIDTH - w);
    const y = h >= HEIGHT ? (HEIGHT - h) / 2 : Math.min(Math.max(cy - h / 2, 0), HEIGHT - h);
    return { x, y, w, h };
  };
  if (points.length === 0) return fit(WIDTH, HEIGHT, WIDTH / 2, HEIGHT / 2);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max((maxX - minX) * 1.4 + 60, WIDTH / 3);
  const h = (maxY - minY) * 1.4 + 90; // room above for pins and labels
  return fit(w, h, (minX + maxX) / 2, (minY + maxY) / 2 - 12);
}

/** A bowed flight path between two points, arcing upward on screen, stopping short of the pin. */
function buildArc(from: [number, number], to: [number, number], k: number): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const bow = Math.min(dist * 0.3, 80);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - bow;
  // Shorten the end so the arrowhead sits beside the destination pin, not under it.
  const gap = Math.min(5 * k, dist / 4);
  const ex = x2 - ((x2 - cx) / Math.hypot(x2 - cx, y2 - cy || 1)) * gap;
  const ey = y2 - ((y2 - cy) / Math.hypot(x2 - cx, y2 - cy || 1)) * gap;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${ex} ${ey}`;
}
