"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Animates the leading integer of a stat string ("90/180" → counts the "90")
 * up from 0 once scrolled into view; the remainder of the string is static.
 * Falls back to the plain string immediately for values with no leading
 * integer, and (via prefers-reduced-motion) for anyone who asked for less motion.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = /^(\d+)(.*)$/.exec(value);
  const [display, setDisplay] = useState(match ? "0" + match[2] : value);

  useEffect(() => {
    if (!match) return;
    const target = Number(match[1]);
    const rest = match[2];
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / DURATION_MS);
          const current = Math.round(target * easeOutCubic(progress));
          setDisplay(`${current}${rest}`);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
