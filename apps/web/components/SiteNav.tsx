"use client";

import { useEffect, useRef, useState } from "react";

export interface SiteNavLink {
  href: string;
  label: string;
}

/**
 * Minimal floating nav — logo + a single menu toggle, no boxed pill bar.
 * Matches the misty-travel-journal reference's ultra-light top bar (logo
 * left, icon-only controls right) while staying a real, fully-navigable
 * menu rather than the reference's decorative icons — this is a working
 * product with real pages, not a one-page personal site.
 */
export default function SiteNav({
  brand,
  links,
  cta,
}: {
  brand: string;
  links: SiteNavLink[];
  cta: SiteNavLink;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex items-center justify-between px-4 py-4 sm:px-6">
      <a href="/" className="font-display text-lg font-extrabold tracking-tight text-slate-900">
        {brand}
      </a>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4.5 w-4.5">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="site-nav-menu"
          className="absolute top-full right-4 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:right-6"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={cta.href}
            className="mt-1 block rounded-xl bg-slate-900 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {cta.label}
          </a>
        </div>
      )}
    </div>
  );
}
