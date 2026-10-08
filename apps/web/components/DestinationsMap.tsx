"use client";

import { geoArea, geoCentroid, geoCircle, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { useCallback, useMemo, useRef, useState } from "react";
import { alpha2ForFeatureId, countryFeature, MICRO_STATE_COORDS, WORLD_COUNTRIES } from "../lib/world-map-data";

const WIDTH = 760;
const HEIGHT = 780;
const RADIUS = 300;
const CENTER: [number, number] = [WIDTH / 2, 345];
/** The brass meridian ring sits just outside the sphere, like a desk globe's. */
const RING_RADIUS = RADIUS + 16;
/** Earth's axial tilt — where the ring's pivot pins sit, as on a real desk globe. */
const AXIAL_TILT = 23.5;
/** Starting rotation centers the globe on the Europe/Africa boundary
 * (matching reference.png's framing) — d3's rotate is [-lon, -lat]. The
 * viewer can drag from here; see the pointer handlers below. */
const INITIAL_ROTATION = { lon: 12, lat: 18 };
/** deg of rotation per pixel dragged — matches GlobeStory's cobe drag feel
 * (0.005 rad/px ≈ 0.29 deg/px) so the two globes on this page respond alike. */
const DRAG_SENSITIVITY = 0.3;
const MAX_LAT = 85;

/** Antique desk-globe palette: parchment land, an aged green-grey sea,
 * sepia borders and graticule. Coverage stays the one thing that's read
 * at a glance — every verified destination in the same deep green, the
 * Schengen Area as an ochre bloc — so "covered / not covered" survives
 * the period styling. */
const DESTINATION_FILL = "#3f6b45";
const SCHENGEN_FILL_DEFAULT = "#d6b06e";
const SCHENGEN_FILL_ACTIVE = "#a8722f";
const NEUTRAL_FILL = "#efe2bf";
const BORDER = "#8a6a42";
const INK = "#5b4630";
const SCHENGEN_KEY = "Schengen Area";
/** Polygons smaller than this (steradians, roughly under 100,000 km²) are a few
 * pixels wide at this scale — present but easy to miss (Ireland, Georgia, the
 * UAE, Rwanda) — so they also get a halo ring. */
const TINY_AREA = 0.002;
const GRATICULE = geoGraticule10();
const EQUATOR = geoCircle().center([0, 90]).radius(90)();

/** Static paper grain, rendered once as an image rather than as a live SVG
 * filter so dragging the globe doesn't re-run the turbulence every frame. */
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;
/** Degree ticks on the meridian ring, every 10°. */
const RING_TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

/** True if (lon, lat) sits on the visible (front) hemisphere for the given
 * rotation — geoOrthographic still happily projects back-hemisphere points
 * to an (x, y), so this manual great-circle check is what actually keeps
 * their markers from appearing "through" the globe. */
function isFrontFacing(lon: number, lat: number, rotation: { lon: number; lat: number }): boolean {
  const toRad = Math.PI / 180;
  const phi1 = rotation.lat * toRad;
  const lambda1 = rotation.lon * toRad;
  const phi2 = lat * toRad;
  const lambda2 = lon * toRad;
  const cosC = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  return cosC > 0.02;
}

/**
 * "Where Trip Check covers" — a literal, draggable globe (orthographic
 * projection, the same technique behind reference.png's own map) rather
 * than a flat rectangle: every verified destination filled in the one
 * brand color (not a pin — a small dot reads as "barely anything here" at
 * world-map scale, but a filled country reads as real coverage at a
 * glance), plus the whole Schengen Area tinted as its own bloc.
 * Dynamically imported (see app/page.tsx) purely to keep the ~100KB
 * country geometry out of the initial homepage bundle, matching
 * WorldMap.tsx.
 */
export interface MapDestination {
  code: string;
  name: string;
  region: string;
}

/** Data comes in as props (built on the server in app/page.tsx) so the
 * homepage doesn't bundle the whole data corpus just to color a globe. */
export default function DestinationsMap({
  destinations,
  schengenCodes,
}: {
  /** Verified destinations only. */
  destinations: MapDestination[];
  schengenCodes: string[];
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [rotation, setRotation] = useState(INITIAL_ROTATION);
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number }>({
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const projection = useMemo(
    () => geoOrthographic().rotate([-rotation.lon, -rotation.lat]).translate(CENTER).scale(RADIUS),
    [rotation],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    // The surface follows the pointer: dragging right brings the land on the
    // left into view, so the centre longitude moves west (and likewise for
    // latitude: dragging down brings the north into view).
    setRotation((r) => ({
      lon: r.lon - dx * DRAG_SENSITIVITY,
      lat: Math.max(-MAX_LAT, Math.min(MAX_LAT, r.lat + dy * DRAG_SENSITIVITY)),
    }));
  }, []);
  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const schengenSet = useMemo(
    () => new Set(schengenCodes),
    [schengenCodes],
  );

  const destinationByCode = useMemo(() => {
    const map = new Map<string, { name: string; region: string }>();
    for (const d of destinations) {
      map.set(d.code, { name: d.name, region: d.region });
    }
    return map;
  }, [destinations]);

  /** Dots for covered destinations with no polygon, halos for ones with a tiny polygon. */
  const markers = useMemo(() => {
    const out: Array<{ code: string; name: string; region: string; x: number; y: number; halo: boolean }> = [];
    for (const [code, dest] of destinationByCode) {
      const feature = countryFeature(code);
      let lonLat: [number, number] | undefined;
      if (!feature) lonLat = MICRO_STATE_COORDS[code];
      else if (geoArea(feature) < TINY_AREA) lonLat = geoCentroid(feature) as [number, number];
      if (!lonLat || !isFrontFacing(lonLat[0], lonLat[1], rotation)) continue;
      const point = projection(lonLat);
      if (point) out.push({ code, ...dest, x: point[0], y: point[1], halo: Boolean(feature) });
    }
    return out;
  }, [destinationByCode, projection, rotation]);

  const regionsPresent = useMemo(() => {
    const seen = new Set([...destinationByCode.values()].map((d) => d.region));
    return [...seen].sort();
  }, [destinationByCode]);

  const filterOptions = [...regionsPresent, SCHENGEN_KEY];
  const showSchengen = !activeFilter || activeFilter === SCHENGEN_KEY;
  const schengenActive = activeFilter === SCHENGEN_KEY;
  const schengenFilterOnly = activeFilter === SCHENGEN_KEY;


  return (
    <div>
      {/* Region filter — plain text toggles rather than pills: clicking one
          isolates that region's countries on the globe, clicking it again
          (or "All") resets. */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
        {[null, ...filterOptions].map((region) => {
          const active = activeFilter === region;
          return (
            <li key={region ?? "all"}>
              <button
                type="button"
                onClick={() => setActiveFilter(active || region === null ? null : region)}
                aria-pressed={active}
                className={`underline-offset-[6px] transition ${
                  active
                    ? "font-semibold text-slate-900 underline decoration-brand-500 decoration-2"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {region === null ? "All" : region === SCHENGEN_KEY ? "Schengen Area" : region}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Drag handling lives on this HTML wrapper, not the <svg>: iOS Safari
          ignores touch-action on SVG elements, so touches on the svg were
          taken as page scrolls and the drag was cancelled. pan-y keeps
          vertical page scrolling working on phones (the globe is nearly
          screen-wide); a sideways swipe turns the globe. */}
      <div
        className="relative mt-4 cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Draggable globe showing every destination Trip Check currently covers"
          className="relative h-auto w-full"
        >
          <defs>
            <radialGradient id="vg-sea" cx="40%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#e4e2c9" />
              <stop offset="55%" stopColor="#b5bfa4" />
              <stop offset="100%" stopColor="#7b8970" />
            </radialGradient>
            <radialGradient id="vg-volume" cx="38%" cy="32%" r="72%">
              <stop offset="0%" stopColor="#fffbea" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#fffbea" stopOpacity="0" />
              <stop offset="82%" stopColor="#3a2810" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2a1c0a" stopOpacity="0.55" />
            </radialGradient>
            <linearGradient id="vg-brass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2c27c" />
              <stop offset="45%" stopColor="#b48a45" />
              <stop offset="100%" stopColor="#6e5024" />
            </linearGradient>
            <linearGradient id="vg-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b4a2e" />
              <stop offset="100%" stopColor="#3b2818" />
            </linearGradient>
            <clipPath id="vg-sphere">
              <circle cx={CENTER[0]} cy={CENTER[1]} r={RADIUS} />
            </clipPath>
          </defs>

          {/* Stand: cast shadow, wooden base, brass stem up to the ring. */}
          <ellipse cx={CENTER[0]} cy={HEIGHT - 26} rx={190} ry={14} fill="#2a1c0a" opacity={0.12} />
          <ellipse cx={CENTER[0]} cy={HEIGHT - 36} rx={130} ry={16} fill="url(#vg-wood)" />
          <ellipse cx={CENTER[0]} cy={HEIGHT - 42} rx={124} ry={12} fill="#7a5636" />
          <path
            d={`M ${CENTER[0] - 9} ${CENTER[1] + RING_RADIUS + 4} L ${CENTER[0] - 16} ${HEIGHT - 46} L ${CENTER[0] + 16} ${HEIGHT - 46} L ${CENTER[0] + 9} ${CENTER[1] + RING_RADIUS + 4} Z`}
            fill="url(#vg-brass)"
          />
          <ellipse cx={CENTER[0]} cy={HEIGHT - 47} rx={26} ry={6} fill="#8c6a35" />

          <g clipPath="url(#vg-sphere)">
            <circle cx={CENTER[0]} cy={CENTER[1]} r={RADIUS} fill="url(#vg-sea)" />
            <path d={path(GRATICULE) ?? undefined} fill="none" stroke={INK} strokeOpacity={0.22} strokeWidth={0.6} />
            {WORLD_COUNTRIES.features.map((f, i) => {
              const code = alpha2ForFeatureId(f.id);
              const isSchengen = code !== undefined && schengenSet.has(code);
              const dest = code !== undefined ? destinationByCode.get(code) : undefined;
              const destVisible = dest !== undefined && !schengenFilterOnly && (!activeFilter || activeFilter === dest.region);

              let fill = NEUTRAL_FILL;
              let strokeWidth = 0.45;
              if (isSchengen && showSchengen) {
                fill = schengenActive ? SCHENGEN_FILL_ACTIVE : SCHENGEN_FILL_DEFAULT;
                strokeWidth = schengenActive ? 1 : 0.45;
              } else if (destVisible) {
                fill = DESTINATION_FILL;
                strokeWidth = activeFilter === dest.region ? 1 : 0.45;
              }

              return (
                <path key={`${f.id}-${i}`} d={path(f) ?? undefined} fill={fill} stroke={BORDER} strokeOpacity={0.75} strokeWidth={strokeWidth}>
                  {dest ? <title>{dest.name}</title> : null}
                </path>
              );
            })}
            {/* Graticule again, faintly, over the land — printed globes run it across everything. */}
            <path d={path(GRATICULE) ?? undefined} fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={0.5} />
            <path d={path(EQUATOR) ?? undefined} fill="none" stroke="#7a2e1f" strokeOpacity={0.55} strokeWidth={1} strokeDasharray="5 3" />
            <circle cx={CENTER[0]} cy={CENTER[1]} r={RADIUS} fill="url(#vg-volume)" pointerEvents="none" />
          </g>

          {markers
            .filter((m) => !schengenFilterOnly && (!activeFilter || activeFilter === m.region))
            .map((m) => (
              <g key={m.code}>
                <title>{m.name}</title>
                {m.halo ? (
                  <circle cx={m.x} cy={m.y} r={7} fill="none" stroke={DESTINATION_FILL} strokeWidth={1.75} />
                ) : (
                  <>
                    <circle cx={m.x} cy={m.y} r={8} fill="none" stroke={DESTINATION_FILL} strokeWidth={1.25} />
                    <circle cx={m.x} cy={m.y} r={3.5} fill={DESTINATION_FILL} />
                  </>
                )}
              </g>
            ))}

          <circle cx={CENTER[0]} cy={CENTER[1]} r={RADIUS} fill="none" stroke="#3b2a14" strokeOpacity={0.45} strokeWidth={1.25} />

          {/* Brass meridian ring, tilted to the axis, with degree ticks and pivot pins. */}
          <g transform={`rotate(${AXIAL_TILT} ${CENTER[0]} ${CENTER[1]})`}>
            <circle cx={CENTER[0]} cy={CENTER[1]} r={RING_RADIUS} fill="none" stroke="url(#vg-brass)" strokeWidth={11} />
            <circle cx={CENTER[0]} cy={CENTER[1]} r={RING_RADIUS + 5.5} fill="none" stroke="#5a3f1a" strokeOpacity={0.5} strokeWidth={0.75} />
            <circle cx={CENTER[0]} cy={CENTER[1]} r={RING_RADIUS - 5.5} fill="none" stroke="#5a3f1a" strokeOpacity={0.5} strokeWidth={0.75} />
            {RING_TICKS.map((deg) => (
              <line
                key={deg}
                x1={CENTER[0]}
                y1={CENTER[1] - RING_RADIUS - (deg % 30 === 0 ? 5 : 2.5)}
                x2={CENTER[0]}
                y2={CENTER[1] - RING_RADIUS + (deg % 30 === 0 ? 5 : 2.5)}
                stroke="#4a3415"
                strokeOpacity={0.7}
                strokeWidth={0.9}
                transform={`rotate(${deg} ${CENTER[0]} ${CENTER[1]})`}
              />
            ))}
            {[-1, 1].map((side) => (
              <circle
                key={side}
                cx={CENTER[0]}
                cy={CENTER[1] + side * RING_RADIUS}
                r={7}
                fill="url(#vg-brass)"
                stroke="#5a3f1a"
                strokeWidth={1}
              />
            ))}
          </g>
        </svg>
        {/* Paper grain over the sphere only — see GRAIN_URL. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full opacity-40 mix-blend-multiply"
          style={{
            left: `${((CENTER[0] - RADIUS) / WIDTH) * 100}%`,
            top: `${((CENTER[1] - RADIUS) / HEIGHT) * 100}%`,
            width: `${((2 * RADIUS) / WIDTH) * 100}%`,
            height: `${((2 * RADIUS) / HEIGHT) * 100}%`,
            backgroundImage: GRAIN_URL,
          }}
        />
        <span className="pointer-events-none absolute top-0 right-0 font-display text-xs text-slate-500 italic">
          Drag to turn the globe
        </span>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[2px] border border-black/15" style={{ backgroundColor: DESTINATION_FILL }} />
          Verified destination
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[2px] border border-black/15" style={{ backgroundColor: SCHENGEN_FILL_DEFAULT }} />
          Schengen Area
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[2px] border border-black/15" style={{ backgroundColor: NEUTRAL_FILL }} />
          Not yet covered
        </li>
      </ul>
    </div>
  );
}
