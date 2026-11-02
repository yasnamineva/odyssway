"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { suggestSourceHref } from "../lib/report-problem";

const TOPICS = ["entry", "customs", "medicine", "other"] as const;

/**
 * "Suggest an official source": builds a pre-filled email in the reader's mail app
 * (country, topic, official link, exact quote). Nothing is stored or sent by the site.
 */
export default function SuggestSource() {
  const t = useTranslations("suggestSource");
  const id = useId();
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("entry");
  const [link, setLink] = useState("");
  const [quote, setQuote] = useState("");
  const ready = country.trim() !== "" && /^https?:\/\/\S+\.\S+/.test(link.trim()) && quote.trim().length >= 10;
  const field = "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

  return (
    <form
      className="space-y-3"
      data-testid="suggest-source"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        window.location.href = suggestSourceHref({
          country: country.trim(),
          topic: t(`topic.${topic}`),
          link: link.trim(),
          quote: quote.trim(),
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-800" htmlFor={`${id}-country`}>
          {t("country")}
          <input id={`${id}-country`} className={field} value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <label className="block text-sm font-medium text-slate-800" htmlFor={`${id}-topic`}>
          {t("topicLabel")}
          <select
            id={`${id}-topic`}
            className={field}
            value={topic}
            onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
          >
            {TOPICS.map((k) => (
              <option key={k} value={k}>
                {t(`topic.${k}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-800" htmlFor={`${id}-link`}>
        {t("link")}
        <input
          id={`${id}-link`}
          type="url"
          inputMode="url"
          placeholder="https://"
          className={field}
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-slate-800" htmlFor={`${id}-quote`}>
        {t("quote")}
        <textarea id={`${id}-quote`} rows={3} className={field} value={quote} onChange={(e) => setQuote(e.target.value)} />
      </label>
      <p className="text-xs text-slate-500">{t("privacy")}</p>
      <button
        type="submit"
        disabled={!ready}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("submit")}
      </button>
    </form>
  );
}
