import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreadcrumbJsonLd from "../../components/BreadcrumbJsonLd";
import { destinationByCode } from "../../lib/destination-index";
import { authorisationPath, travelAuthorisations } from "../../lib/travel-authorisations";

/** Index of travel-authorisation guides (GROWTH_AND_ROADMAP.md §2, "Travel readiness"). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authorisations");
  return {
    title: t("indexMetaTitle"),
    description: t("indexMetaDescription"),
    alternates: { canonical: "/authorisations" },
  };
}

export default async function AuthorisationsIndexPage() {
  const t = await getTranslations("authorisations");
  const sorted = [...travelAuthorisations].sort((a, b) => a.shortName.localeCompare(b.shortName));
  return (
    <article className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd trail={[{ name: t("indexTitle"), path: "/authorisations" }]} />
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("indexTitle")}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{t("indexIntro")}</p>
      <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200" data-testid="authorisations-list">
        {sorted.map((a) => (
          <li key={a.slug}>
            <a href={authorisationPath(a)} className="block py-3 transition hover:bg-slate-50">
              <span className="block text-[15px] font-semibold text-slate-900">{a.name}</span>
              <span className="block text-sm text-slate-600">
                {t("indexLine", { country: destinationByCode(a.destination)?.name ?? a.destination, fee: a.fee.text })}
              </span>
            </a>
          </li>
        ))}
        <li>
          <a href="/etias/status" className="block py-3 transition hover:bg-slate-50">
            <span className="block text-[15px] font-semibold text-slate-900">ETIAS</span>
            <span className="block text-sm text-slate-600">{t("etiasLine")}</span>
          </a>
        </li>
      </ul>
      <p className="mt-4 text-sm text-slate-600">{t("indexMissing")}</p>
      <a href="/readiness" className="mt-6 inline-block text-sm font-semibold text-brand-700 underline underline-offset-2">
        {t("readinessCta")}
      </a>
    </article>
  );
}
