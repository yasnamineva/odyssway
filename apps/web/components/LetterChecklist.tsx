"use client";

import type { CustomsLetter } from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SourceNote from "./SourceNote";

/**
 * Doctor's letter checklist (GROWTH_AND_ROADMAP.md §2.8): only what this
 * destination's verified rule says the letter or prescription must contain.
 * Ticks stay in the page; nothing is stored or sent.
 */
export default function LetterChecklist({
  letter,
  destinationName,
}: {
  letter: CustomsLetter;
  destinationName: string;
}) {
  const t = useTranslations("letter");
  const [done, setDone] = useState<boolean[]>(() => letter.items.map(() => false));
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = [t("copyHeading", { destination: destinationName }), ...letter.items.map((i) => `- ${i}`), "", `${t("sourceLabel")}: ${letter.source.name} (${letter.source.url})`].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-3" data-testid="letter-checklist">
      <p className="text-sm font-semibold text-slate-900">{t("title")}</p>
      <p className="mt-0.5 text-xs text-slate-600">{t("hint", { destination: destinationName })}</p>
      <ul className="mt-2 space-y-1.5">
        {letter.items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug text-slate-800">
              <input
                type="checkbox"
                checked={done[i]}
                onChange={() => setDone((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-700"
              />
              <span className={done[i] ? "text-slate-500 line-through" : undefined}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        data-testid="letter-copy"
      >
        {copied ? t("copied") : t("copy")}
      </button>
      <SourceNote
        className="mt-3"
        name={letter.source.name}
        url={letter.source.url}
        date={letter.verified_at}
        sourceLabel={t("sourceLabel")}
        checkedLabel={t("checkedOn", { date: letter.verified_at })}
      />
    </div>
  );
}
