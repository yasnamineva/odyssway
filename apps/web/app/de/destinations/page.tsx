import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import deMessages from "../../../messages/de.json";
import { germanDestinations } from "../../../lib/german-destinations";

/** German index of country pages (customs only, GROWTH_AND_ROADMAP.md §5.5). */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const td = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.destinations" });

export function generateMetadata(): Metadata {
  const title = td("indexTitle");
  const description = td("indexIntro", { count: germanDestinations().length });
  return { title, description, alternates: { canonical: "/de/destinations" }, openGraph: { title, description, locale: "de_DE" } };
}

export default function GermanDestinationsIndex() {
  const all = germanDestinations();
  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{td("indexTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600">{td("indexIntro", { count: all.length })}</p>
      </header>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-testid="de-destinations-list">
        {all.map((d) => (
          <li key={d.slug}>
            <a href={`/de/destinations/${d.slug}`} className="text-sm text-blue-700 underline">
              {d.country}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href="/de/bring" className="text-blue-700 underline">
          {t("indexMetaTitle")} →
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
    </article>
  );
}
