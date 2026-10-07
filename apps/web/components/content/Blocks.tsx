import type { ReactNode } from "react";
import { ChevronDownIcon } from "../icons";

/**
 * Building blocks for guide pages (MDX and TSX). The aim: the answer and the
 * shape of a page are visible at a glance; detail is always one tap away
 * (More, InfoTip) instead of in the reader's way.
 */

/** The answer-first summary every guide opens with (AGENTS.md §8). */
export function InShort({ children, label = "In short" }: { children: ReactNode; label?: string }) {
  return (
    <div className="mt-6 border-l-4 border-brand-600 pl-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-700 uppercase">{label}</p>
      <div className="mt-1 text-lg leading-relaxed text-slate-800 [&_p]:mt-0 [&_p]:text-lg [&_strong]:text-slate-900">
        {children}
      </div>
    </div>
  );
}

/** A row of big numbers — deadlines, counts — each with a short label. */
export function KeyNumbers({ items }: { items: Array<{ value: string; label: string }> }) {
  // Phones: one compact row per number. Wider: side-by-side tiles.
  return (
    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <span className="block font-display text-2xl font-bold text-slate-900 tabular-nums">{item.value}</span>
            <span className="block text-xs leading-snug text-slate-600">{item.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FactGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return <div className={`mt-4 grid gap-x-8 gap-y-4 ${cols}`}>{children}</div>;
}

/** One idea: a short bold title and a line or two of text. */
export function Fact({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      {children ? <div className="mt-0.5 text-[15px] leading-relaxed text-slate-600 [&_p]:mt-0">{children}</div> : null}
    </div>
  );
}

/** Numbered steps on a vertical rail. */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="mt-5 space-y-0 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <li className="relative pb-6 pl-12 [counter-increment:step] last:pb-0 before:absolute before:top-0 before:left-0 before:flex before:h-8 before:w-8 before:items-center before:justify-center before:rounded-full before:bg-slate-900 before:text-sm before:font-semibold before:text-white before:content-[counter(step)] after:absolute after:top-9 after:bottom-1 after:left-4 after:w-px after:bg-slate-300 last:after:hidden">
      <p className="pt-1 text-[15px] font-semibold text-slate-900">{title}</p>
      {children ? (
        <div className="mt-1 text-[15px] leading-relaxed text-slate-600 [&_p]:mt-1 [&_ul]:mt-1">{children}</div>
      ) : null}
    </li>
  );
}

/** Optional depth, closed by default. `subtle` renders as a small text
 * toggle — for use inside steps or cards, where a full box is too heavy. */
export function More({ summary, children, subtle = false }: { summary: string; children: ReactNode; subtle?: boolean }) {
  if (subtle) {
    return (
      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-brand-700 select-none hover:text-brand-800 [&::-webkit-details-marker]:hidden">
          {summary}
          <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 border-l-2 border-slate-200 pl-3 text-[13px] leading-relaxed text-slate-600 [&_p]:mt-1 [&_p]:text-[13px]">
          {children}
        </div>
      </details>
    );
  }
  return (
    <details className="group mt-5 border-y border-slate-200">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[15px] font-medium text-slate-800 select-none hover:text-slate-950 [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-slate-700 [&>*:first-child]:mt-0 [&_li]:text-sm [&_p]:text-sm">
        {children}
      </div>
    </details>
  );
}

/** A short list of related links — plain text, one per line. */
export function LinkCards({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-3">{children}</ul>;
}

export function LinkCard({ href, title, children }: { href: string; title: string; children?: ReactNode }) {
  return (
    <li className="text-[15px] leading-relaxed">
      <a
        href={href}
        className="font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
      >
        {title}
      </a>
      {children ? <span className="text-slate-600"> — {children}</span> : null}
    </li>
  );
}

/** A deadline track: day markers in order with what happens on each — a
 * vertical rail on phones, a horizontal one on wider screens. Points are
 * evenly spaced (the day numbers carry the timing) so labels never collide. */
export function DeadlineTrack({ points }: { points: Array<{ day: number; label: string }> }) {
  return (
    <ol className="mt-6 flex flex-col sm:flex-row">
      {points.map((p, i) => {
        const last = i === points.length - 1;
        return (
          <li key={p.label} className="flex flex-1 gap-3 sm:flex-col sm:gap-2">
            <span aria-hidden="true" className="flex flex-col items-center sm:flex-row">
              <span className="h-3 w-3 shrink-0 rounded-full bg-brand-700" />
              <span className={`w-0.5 flex-1 sm:h-0.5 sm:w-auto ${last ? "invisible" : "bg-brand-600/50"}`} />
            </span>
            <span className={`block min-w-0 sm:pr-4 ${last ? "" : "pb-4 sm:pb-0"}`}>
              <span className="-mt-1 block font-display text-base font-bold text-slate-900 tabular-nums sm:mt-0">
                Day {p.day}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-slate-600">{p.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** The quiet sources footer every guide ends with. */
export function Sources({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500 [&_a]:text-slate-600 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-slate-500 [&_strong]:text-slate-600">
      {children}
    </div>
  );
}

/** A warning or notable exception that must not be missed. */
export function Callout({ title, children, tone = "warning" }: { title: string; children: ReactNode; tone?: "warning" | "info" }) {
  const styles =
    tone === "warning"
      ? "border-amber-500 text-slate-800 [&_strong]:text-slate-900"
      : "border-slate-300 text-slate-800";
  return (
    <div className={`mt-6 border-l-4 pl-4 ${styles}`} role={tone === "warning" ? "note" : undefined}>
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <div className="mt-1 text-[15px] leading-relaxed [&_p]:mt-0 [&_p]:text-[15px] [&_p]:text-inherit">{children}</div>
    </div>
  );
}

/** Two side-by-side lists: what's in vs. what's out. */
export function Compare({
  yesTitle,
  noTitle,
  yes,
  no,
}: {
  yesTitle: string;
  noTitle: string;
  yes: ReactNode[];
  no: ReactNode[];
}) {
  const list = (items: ReactNode[], mark: string, markClass: string) => (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
          <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${markClass}`}>
            {mark}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
      <div>
        <p className="text-[15px] font-semibold text-brand-800">{yesTitle}</p>
        {list(yes, "✓", "bg-brand-100 text-brand-800")}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-slate-700">{noTitle}</p>
        {list(no, "✕", "bg-slate-100 text-slate-600")}
      </div>
    </div>
  );
}
