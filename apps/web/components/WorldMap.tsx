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
  /** Labels for the zoom controls (translated by the caller). */
  controls?: { open: string; hint: string; close: string; zoomIn: string; zoomOut: string; reset: string };
}

const DEFAULT_CONTROLS = { open: "Open a larger map you can zoom", hint: "Zoom", close: "Close", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset" };

export default function WorldMap(props: WorldMapProps) {
  const { stops = [], legend } = props;
  const c = props.controls ?? DEFAULT_CONTROLS;
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [expanded]);

  const legendKinds = (["origin", "transit", "destination"] as MapStopKind[]).filter(
    (kind) => legend?.[kind] && stops.some((s) => s.kind === kind),
  );
  const legendRow = legendKinds.length > 0 && (
    <figcaption className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
      {legendKinds.map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_STYLE[kind].pin }} />
          {legend![kind]}
        </span>
      ))}
    </figcaption>
  );

  return (
    <>
      <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block aspect-[4/3] w-full cursor-zoom-in sm:aspect-[16/11]"
          aria-label={`${props.ariaLabel ?? "World map"}. ${c.open}`}
          data-testid="world-map-open"
        >
          <MapCanvas {...props} />
          <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm group-hover:bg-white">
            ⤢ {c.hint}
          </span>
        </button>
        {legendRow}
      </figure>
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={props.ariaLabel ?? "World map"}
          onClick={(e) => e.target === e.currentTarget && setExpanded(false)}
          data-testid="world-map-dialog"
        >
          <figure className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative min-h-0 flex-1">
              <MapCanvas {...props} interactive />
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute top-2 right-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow"
                data-testid="world-map-close"
              >
                {c.close} ✕
              </button>
            </div>
            {legendRow}
          </figure>
        </div>
      )}
    </>
  );
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

/** The map itself. `interactive` adds zoom buttons, wheel zoom and drag-to-pan. */
function MapCanvas({
  stops = [],
  highlightCodes = [],
  ariaLabel,
  interactive = false,
  controls,
}: WorldMapProps & { interactive?: boolean }) {
  const c = controls ?? DEFAULT_CONTROLS;
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
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 640, h: 440 });
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
  // the world wide and at most the whole world. In the large view the reader
  // can zoom further (z) and pan (offset, in map units).
  const fitted = viewBoxFor(placed.map((s) => s.point), size.w / size.h);
  const [z, setZ] = useState(1);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const box = zoomBox(fitted, z, offset);
  const k = box.w / size.w; // map units per screen pixel

  const zoomBy = (factor: number) => setZ((v) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v * factor)));
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const handlers = interactive
    ? {
        onWheel: (e: React.WheelEvent) => zoomBy(e.deltaY < 0 ? 1.25 : 0.8),
        onPointerDown: (e: React.PointerEvent) => {
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ox: offset[0], oy: offset[1] };
        },
        onPointerMove: (e: React.PointerEvent) => {
          const d = drag.current;
          if (!d) return;
          setOffset([d.ox - (e.clientX - d.x) * k, d.oy - (e.clientY - d.y) * k]);
        },
        onPointerUp: () => (drag.current = null),
        onPointerCancel: () => (drag.current = null),
      }
    : {};

  const labels = placeLabels(placed, k, box);
  const arcs = placed.slice(1).map((s, i) => buildArc(placed[i]!.point, s.point, k));

  return (
    <div
      ref={frameRef}
      className={`h-full w-full ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
      {...handlers}
    >
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
            place={labels[i]!}
            k={k}
          />
        ))}
        <style>{`
          .wm-route { animation: wm-dash 1.2s linear infinite; }
          @keyframes wm-dash { to { stroke-dashoffset: -20; } }
          @media (prefers-reduced-motion: reduce) { .wm-route { animation: none; } }
        `}</style>
      </svg>
      {interactive && (
        <div className="absolute bottom-3 left-3 flex flex-col overflow-hidden rounded-lg bg-white shadow" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => zoomBy(1.5)} className="px-3 py-1.5 text-lg font-semibold text-slate-800 hover:bg-slate-100" aria-label={c.zoomIn} data-testid="world-map-zoom-in">+</button>
          <button type="button" onClick={() => zoomBy(1 / 1.5)} className="border-t border-slate-200 px-3 py-1.5 text-lg font-semibold text-slate-800 hover:bg-slate-100" aria-label={c.zoomOut} data-testid="world-map-zoom-out">−</button>
          <button
            type="button"
            onClick={() => {
              setZ(1);
              setOffset([0, 0]);
            }}
            className="border-t border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
          >
            {c.reset}
          </button>
        </div>
      )}
    </div>
  );
}

/** The fitted route view, zoomed in by `z` around its centre and panned by `offset` (map units). */
function zoomBox(
  fitted: { x: number; y: number; w: number; h: number },
  z: number,
  [ox, oy]: [number, number],
): { x: number; y: number; w: number; h: number } {
  const w = fitted.w / z;
  const h = fitted.h / z;
  const cx = fitted.x + fitted.w / 2 + ox;
  const cy = fitted.y + fitted.h / 2 + oy;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

type LabelPlace = { x: number; y: number; anchor: "start" | "end" | "middle" };

/** Pin with a white ring; `n` numbers the stop when the route has three or more. */
function Pin({
  point,
  color,
  n,
  label,
  place,
  k,
}: {
  point: [number, number];
  color: string;
  n?: number;
  label?: string;
  place: LabelPlace;
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
          x={place.x}
          y={place.y}
          textAnchor={place.anchor}
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

/**
 * Where each label goes, in map units. A label sits beside its own pin head
 * (right, else left), so it never lands on the country above the pin; below
 * the pin only when both sides clash with an earlier label or the frame edge.
 */
function placeLabels(
  stops: Array<{ point: [number, number]; label?: string }>,
  k: number,
  frame: { x: number; y: number; w: number; h: number },
): LabelPlace[] {
  const boxes: Array<[number, number, number, number]> = [];
  const pins: Array<[number, number, number, number]> = stops.map(({ point: [x, y] }) => [x - 11 * k, y - 32 * k, x + 11 * k, y]);
  const clash = (a: [number, number, number, number], self: number) =>
    boxes.some((b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) ||
    pins.some((p, i) => i !== self && a[0] < p[2] && p[0] < a[2] && a[1] < p[3] && p[1] < a[3]);
  const inside = (a: [number, number, number, number]) =>
    a[0] >= frame.x && a[2] <= frame.x + frame.w && a[1] >= frame.y && a[3] <= frame.y + frame.h;
  return stops.map(({ point: [x, y], label }, i) => {
    const headY = y - 20 * k;
    if (!label) return { x, y: headY, anchor: "middle" };
    const w = label.length * 7.4 * k;
    const gap = 13 * k;
    const baseline = headY + 4.5 * k;
    const options: Array<{ place: LabelPlace; box: [number, number, number, number] }> = [
      { place: { x: x + gap, y: baseline, anchor: "start" }, box: [x + gap, baseline - 12 * k, x + gap + w, baseline + 4 * k] },
      { place: { x: x - gap, y: baseline, anchor: "end" }, box: [x - gap - w, baseline - 12 * k, x - gap, baseline + 4 * k] },
      { place: { x, y: y + 16 * k, anchor: "middle" }, box: [x - w / 2, y + 3 * k, x + w / 2, y + 20 * k] },
    ];
    const pick = options.find((o) => inside(o.box) && !clash(o.box, i)) ?? options.find((o) => !clash(o.box, i)) ?? options[0]!;
    boxes.push(pick.box);
    return pick.place;
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
