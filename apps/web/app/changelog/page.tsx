import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import changelog from "../../../../data/changelog.json";

interface ChangelogEntry {
  commit: string;
  date: string;
  dataset: string;
  summary: string;
  verified_at: string | null;
  verified_by: string | null;
  source: { name: string; url: string } | null;
}

const entries = changelog as ChangelogEntry[];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.changelog");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/changelog" },
  };
}

export default async function ChangelogPage() {
  const t = await getTranslations("changelogPage");

  // Anchor each dataset's most recent entry so rules pages can deep-link
  // "see update history" (AGENTS.md §8).
  const firstSeen = new Set<string>();

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("h1")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      <ol className="space-y-4">
        {entries.map((entry, i) => {
          const anchor = firstSeen.has(entry.dataset)
            ? undefined
            : `dataset-${entry.dataset}`;
          firstSeen.add(entry.dataset);
          return (
            <li
              key={`${entry.commit}-${entry.dataset}-${i}`}
              id={anchor}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                  {entry.dataset}.json
                </span>
                <time dateTime={entry.date} className="text-xs text-slate-500">
                  {entry.date}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{entry.summary}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {entry.verified_at && entry.verified_by
                  ? t("verifiedLine", { date: entry.verified_at, by: entry.verified_by })
                  : t("noStamp")}
                {entry.source ? (
                  <>
                    {" · "}
                    <a
                      href={entry.source.url}
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-700"
                    >
                      {entry.source.name}
                    </a>
                  </>
                ) : null}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="text-xs leading-relaxed text-slate-500">{t("footer")}</p>
    </article>
  );
}
