"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Stage = { eyebrow: string; heading: string; body: string; markers: string[] };

/** [lat, lon] — spread across the Schengen area so labels don't collide on screen. */
const POINTS: Array<[number, number]> = [
  [50.85, 4.35], // Brussels
  [52.52, 13.4], // Berlin
  [37.98, 23.73], // Athens
];

const STAGE_ACCENT = [
  { diamond: "border-amber-400 bg-amber-400/30", dot: [0.98, 0.65, 0.13] as [number, number, number] },
  { diamond: "border-red-400 bg-red-400/30", dot: [0.94, 0.33, 0.31] as [number, number, number] },
  { diamond: "border-emerald-400 bg-emerald-400/30", dot: [0.2, 0.78, 0.53] as [number, number, number] },
];

const BASE_COLOR: [number, number, number] = [0.32, 0.4, 0.55];
const GLOW_COLOR: [number, number, number] = [0.2, 0.32, 0.5];
const THETA = 0.32;

/** Orthographic projection matching cobe's internal marker placement (phi/theta rotation), so the HTML diamond overlay tracks the WebGL globe exactly. */
function projectMarker(lat: number, lon: number, phi: number, theta: number) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(latRad);
  const t0 = -cosLat * Math.cos(lonRad);
  const t1 = Math.sin(latRad);
  const t2 = cosLat * Math.sin(lonRad);

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  const radius = 0.82;
  const c = cosPhi * (t0 * radius) + sinPhi * (t2 * radius);
  const s = sinPhi * sinTheta * (t0 * radius) + cosTheta * (t1 * radius) - cosPhi * sinTheta * (t2 * radius);
  const facingCamera = -sinPhi * cosTheta * t0 + sinTheta * t1 + cosPhi * cosTheta * t2 >= 0;
  // Matches cobe's own marker-visibility check: also show points right at the
  // sphere's silhouette edge, so the HTML label never blinks off before the
  // WebGL-rendered dot does.
  const front = facingCamera || c * c + s * s >= 0.64;

  return { xPct: ((c + 1) / 2) * 100, yPct: ((-s + 1) / 2) * 100, front };
}

/**
 * Sticky scroll-driven story: a pinned dotted globe with diamond markers whose
 * label and color evolve through three narrative stages as the reader scrolls.
 * Desktop only (CSS-gated) — a plain stacked fallback covers small screens
 * so nothing scroll-jacks on mobile and there's no WebGL context to spare.
 */
export default function GlobeStory() {
  const t = useTranslations("home.story");
  const stages = t.raw("stages") as Stage[];
  const sectionIndex = t("sectionIndex");
  const revealRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Fades + lifts the whole section in once the reader actually scrolls to
  // it. Gated on window.scrollY > 0, not just IntersectionObserver — on a
  // tall viewport the section can already overlap the initial viewport at
  // scrollY 0 (short hero, tall screen), and IntersectionObserver reports
  // that as "intersecting" on its very first callback, before any real
  // scrolling happens. That made the reveal fire immediately on load
  // instead of on scroll. Requiring scrollY > 0 first guarantees nothing
  // shows until the user has actually moved.
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    let hasScrolled = window.scrollY > 0;
    let observer: IntersectionObserver | null = null;

    const startObserving = () => {
      if (observer) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true);
            observer?.disconnect();
          }
        },
        { threshold: 0 },
      );
      observer.observe(el);
    };

    const onScroll = () => {
      if (hasScrolled) return;
      hasScrolled = window.scrollY > 0;
      if (hasScrolled) {
        startObserving();
        window.removeEventListener("scroll", onScroll);
      }
    };

    if (hasScrolled) {
      startObserving();
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <section
      ref={revealRef}
      aria-label={t("ariaLabel")}
      className={`relative left-1/2 w-screen -translate-x-1/2 transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="hidden lg:block">
        <DesktopStory stages={stages} sectionIndex={sectionIndex} />
      </div>
      <div className="lg:hidden">
        <MobileStory stages={stages} />
      </div>
    </section>
  );
}

function DesktopStory({ stages, sectionIndex }: { stages: Stage[]; sectionIndex: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect = outer.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const progress = scrollable > 0 ? (-rect.top / scrollable) : 0;
        const clamped = Math.min(1, Math.max(0, progress));
        setStage(Math.min(stages.length - 1, Math.floor(clamped * stages.length)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [stages.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = wrapper.offsetWidth;
    const onResize = () => {
      width = wrapper.offsetWidth;
      globeRef.current?.update({ width: width * 2, height: width * 2 });
    };
    window.addEventListener("resize", onResize);

    let phi = -0.4;
    let lastScrollY = window.scrollY;
    const pointer = { down: false, lastX: 0, dragPhi: 0 };

    const opts: COBEOptions = {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi,
      theta: THETA,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 3.5,
      baseColor: BASE_COLOR,
      markerColor: STAGE_ACCENT[0]!.dot,
      glowColor: GLOW_COLOR,
      markers: POINTS.map((location) => ({ location, size: 0.05, color: STAGE_ACCENT[0]!.dot })),
      opacity: 0.95,
    };
    const globe = createGlobe(canvas, opts);
    globeRef.current = globe;

    // cobe@2.0.1 ships an `onRender` option in its README but never actually
    // calls it (no internal rAF loop in the bundle) — so we drive frames
    // ourselves and push `phi` to both the WebGL globe and the HTML markers.
    let frameId = 0;
    const tick = () => {
      if (!pointer.down) {
        const y = window.scrollY;
        const scrollDelta = y - lastScrollY;
        lastScrollY = y;
        if (!reduceMotion) phi += 0.0012 + scrollDelta * 0.0004;
      }
      const currentPhi = phi + pointer.dragPhi;
      globe.update({ phi: currentPhi });

      markerRefs.current.forEach((el, i) => {
        const point = POINTS[i];
        if (!el || !point) return;
        const { xPct, yPct, front } = projectMarker(point[0], point[1], currentPhi, THETA);
        el.style.left = `${xPct}%`;
        el.style.top = `${yPct}%`;
        el.style.opacity = front ? "1" : "0";
      });

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    const onPointerDown = (e: PointerEvent) => {
      pointer.down = true;
      pointer.lastX = e.clientX;
      canvas.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      pointer.down = false;
      canvas.style.cursor = "grab";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointer.down) return;
      pointer.dragPhi += (e.clientX - pointer.lastX) * 0.005;
      pointer.lastX = e.clientX;
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(frameId);
      globeRef.current = null;
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useEffect(() => {
    const accent = STAGE_ACCENT[stage] ?? STAGE_ACCENT[0]!;
    globeRef.current?.update({
      markerColor: accent.dot,
      markers: POINTS.map((location) => ({ location, size: 0.05, color: accent.dot })),
    });
  }, [stage]);

  const active = stages[stage] ?? stages[0]!;
  const accent = STAGE_ACCENT[stage] ?? STAGE_ACCENT[0]!;

  return (
    <div ref={outerRef} className="relative" style={{ height: "300vh" }}>
      <div className="bg-grid-faint sticky top-0 flex h-screen items-center overflow-hidden bg-[#0b1420]">
        <span className="absolute top-6 left-6 font-mono text-xs text-white/30">{sectionIndex}</span>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-8">
          <div ref={wrapperRef} className="relative mx-auto aspect-square w-full max-w-lg">
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab"
              style={{ contain: "layout paint size" }}
              aria-hidden="true"
            />
            {POINTS.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                className="pointer-events-none absolute flex items-center gap-2"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rotate-45 border ${accent.diamond}`} />
                <span
                  key={stage}
                  className="animate-fade-in-up rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-white/90 backdrop-blur-sm"
                  style={{ transform: `translate(${i * 10}px, ${(i - 1) * 24}px)` }}
                >
                  {active.markers[i]}
                </span>
              </div>
            ))}
          </div>
          <div key={stage} className="animate-fade-in-up text-white">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/50 uppercase">
              <span className="h-px w-6 bg-white/30" />
              {active.eyebrow}
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold lg:text-4xl">{active.heading}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{active.body}</p>
            <div className="mt-10 font-mono text-xs text-white/40">
              {String(stage + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStory({ stages }: { stages: Stage[] }) {
  return (
    <div className="bg-grid-faint space-y-8 bg-[#0b1420] px-6 py-10 sm:px-10">
      {stages.map((s, i) => (
        <div key={i} className={i > 0 ? "border-t border-white/10 pt-8" : ""}>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/50 uppercase">
            <span className="h-px w-6 bg-white/30" />
            {s.eyebrow}
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-white">{s.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {s.markers.map((m) => (
              <li
                key={m}
                className={`flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-white/80`}
              >
                <span className={`h-2 w-2 shrink-0 rotate-45 border ${STAGE_ACCENT[i]!.diamond}`} />
                {m}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
