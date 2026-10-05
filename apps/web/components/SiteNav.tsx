"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import logo from "../public/images/logo.png";

export interface SiteNavLink {
  href: string;
  label: string;
}

/**
 * A plain masthead: logo, text links, one CTA, closed by a hairline rule
 * so the logo always sits on the page's own paper — never on top of a
 * hero photo. Collapses the links to a toggle + dropdown under lg, since
 * six real destinations don't fit at phone width.
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
    <div ref={rootRef} className="relative flex items-center justify-between gap-6 border-b border-slate-300/70 pb-3">
      <a href="/" className="shrink-0">
        <Image src={logo} alt={brand} className="h-11 w-auto sm:h-14" sizes="(min-width: 640px) 200px, 160px" priority />
      </a>

      <nav className="hidden items-center gap-7 lg:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[14px] text-slate-600 underline-offset-[6px] transition hover:text-slate-900 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href={cta.href}
          className="hidden rounded-md bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-600 lg:inline-block"
        >
          {cta.label}
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-50 lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="site-nav-menu"
          className="absolute top-full right-0 z-30 mt-2 w-56 overflow-hidden rounded-md border border-slate-300 bg-white p-2 shadow-lg lg:hidden"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={cta.href}
            className="mt-1 block rounded bg-brand-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            {cta.label}
          </a>
        </div>
      )}
    </div>
  );
}
