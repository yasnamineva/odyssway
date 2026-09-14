import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BRING_CATEGORIES } from "../../lib/bring-categories";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.bring");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/bring" },
  };
}

export default async function BringIndexPage() {
  const t = await getTranslations("bringPage");

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {t("h1")}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {Object.values(BRING_CATEGORIES).map((c) => (
          <li key={c.slug}>
            <a
              href={`/bring/${c.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className="font-display text-base font-bold text-slate-900">{c.label}</span>
              <span className="text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-700">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
