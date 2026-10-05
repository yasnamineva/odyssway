"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./icons";

export default function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-300/70 border-y border-slate-300/70">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="group flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-display text-base font-bold text-slate-900 underline-offset-4 group-hover:underline">{item.q}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-prose pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
