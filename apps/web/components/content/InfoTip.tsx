"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { InfoIcon } from "../icons";

/**
 * An (i) button that opens a short explanation next to it — for a definition
 * or a legal reference the reader may want, but shouldn't have to wade
 * through. Tap/click to open; tap outside or press Escape to close.
 */
export default function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    // Keep the panel inside the viewport on narrow screens.
    const panel = panelRef.current;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      const margin = 12;
      if (rect.right > window.innerWidth - margin) setShift(window.innerWidth - margin - rect.right);
      else if (rect.left < margin) setShift(margin - rect.left);
    }
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setShift(0);
          setOpen((o) => !o);
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        <InfoIcon className="h-4 w-4" />
      </button>
      {/* Always in the HTML (crawlable, works without JS), hidden until opened. */}
      <span
        ref={panelRef}
        id={id}
        role="note"
        hidden={!open}
        style={{ transform: `translateX(${shift}px)` }}
        className="absolute top-full left-1/2 z-40 mt-2 block w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 text-left text-[13px] leading-relaxed font-normal text-slate-700 shadow-lg [&_a]:underline"
      >
        {children}
      </span>
    </span>
  );
}
