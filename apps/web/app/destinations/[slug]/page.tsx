import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { blogPosts } from "../../../lib/blog";
import { BRING_CATEGORIES, type BringCategory } from "../../../lib/bring-categories";
import { destinationSlug, rowLabel } from "../../../lib/bring-pages";
import {
  customsItems,
  destinationBySlug,
  destinationPath,
  destinations,
  entryRequirements,
} from "../../../lib/destinations";
import { nationalityRules } from "../../../lib/nationalities";
import { SITE_URL } from "../../../lib/site";
import { travelPairPath } from "../../../lib/travel-pairs";
import { InShort } from "../../../components/content/Blocks";
import { VERDICT_STYLES } from "../../../components/CustomsRowCard";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return destinations
    .filter((d) => d.status === "verified")
    .map((d) => ({ slug: destinationSlug(d.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const dest = destinationBySlug((await params).slug);
  if (!dest) return {};
  const t = await getTranslations("destinationPage");
  return {
    title: t("metaTitle", { destination: dest.name }),
    description: t("metaDescription", { destination: dest.name }),
    alternates: { canonical: destinationPath(dest) },
  };
}

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const dest = destinationBySlug((await params).slug);
  if (!dest || dest.status !== "verified") notFound();

  const t = await getTranslations("destinationPage");
  const tc = await getTranslations("common");

  const nationalityRows = entryRequirements
    .filter((r) => r.destination === dest.code && r.status === "verified")
    .map((r) => ({
      row: r,
      name: nationalityRules.find((n) => n.nationality === r.nationality)?.name ?? r.nationality,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const items = customsItems
    .filter((i) => i.destination === dest.code && i.status === "verified")
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const relatedPosts = blogPosts.filter((p) => p.destinationCodes?.includes(dest.code));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Odyssway", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: t("h1", { destination: dest.name }),
        item: `${SITE_URL}${destinationPath(dest)}`,
      },
    ],
  };

  // Passports grouped by what they need — scanning for your own is faster
  // than reading a line per nationality.
  const REQUIREMENT_ORDER = ["visa_free", "eta_required", "visa_on_arrival", "visa_required"] as const;
  const groups = new Map<string, { requirement: string; days: number | null; rows: typeof nationalityRows }>();
  for (const entry of nationalityRows) {
    const days = entry.row.stayPolicy.kind === "fixed_per_entry" ? entry.row.stayPolicy.maxDays : null;
    const key = `${entry.row.requirement}|${days ?? ""}`;
    if (!groups.has(key)) groups.set(key, { requirement: entry.row.requirement, days, rows: [] });
    groups.get(key)!.rows.push(entry);
  }
  const groupList = [...groups.values()].sort(
    (a, b) =>
      REQUIREMENT_ORDER.indexOf(a.requirement as (typeof REQUIREMENT_ORDER)[number]) -
        REQUIREMENT_ORDER.indexOf(b.requirement as (typeof REQUIREMENT_ORDER)[number]) || (b.days ?? 0) - (a.days ?? 0),
  );
  const visaFreeCount = nationalityRows.filter((r) => r.row.requirement === "visa_free").length;
  const GROUP_STYLE: Record<string, string> = {
    visa_free: "border-brand-200 bg-brand-50/60",
    eta_required: "border-blue-200 bg-blue-50/60",
    visa_on_arrival: "border-amber-200 bg-amber-50/60",
    visa_required: "border-slate-200 bg-slate-50",
  };

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
        {t("h1", { destination: dest.name })}
      </h1>

      {nationalityRows.length > 0 && (
        <InShort>
          {t("summary", { free: visaFreeCount, total: nationalityRows.length, destination: dest.name })}
        </InShort>
      )}
      <a
        href={`/trip-check?destination=${dest.code}`}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        {t("checkYourTripCta")}
      </a>

      {nationalityRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">{t("entryTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("entryHint")}</p>
          <div className="mt-4 space-y-3">
            {groupList.map((g) => (
              <div key={`${g.requirement}${g.days}`} className={`rounded-xl border p-4 ${GROUP_STYLE[g.requirement] ?? ""}`}>
                <p className="text-sm font-semibold text-slate-900 first-letter:uppercase">
                  {t(`requirement.${g.requirement}`)}
                  {g.days ? <span className="font-normal text-slate-600"> · {t("upToDays", { days: g.days })}</span> : null}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.rows.map(({ row, name }) => (
                    <li key={row.nationality}>
                      <a
                        href={travelPairPath({ destinationSlug: destinationSlug(dest.name), nationalitySlug: destinationSlug(name) })}
                        className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900"
                      >
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">{t("itemsTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("itemsHint")}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {items.map((item) => {
              const category = item.category in BRING_CATEGORIES ? BRING_CATEGORIES[item.category as BringCategory] : null;
              const inner = (
                <>
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">{rowLabel(item.slug, dest.code)}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${VERDICT_STYLES[item.verdict] ?? VERDICT_STYLES.depends}`}
                    >
                      {t(`verdict.${item.verdict}`)}
                    </span>
                  </span>
                  {item.limits ? (
                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {item.limits.description}
                    </span>
                  ) : null}
                </>
              );
              return (
                <li key={item.slug}>
                  {category ? (
                    <a
                      href={`/bring/${category.slug}/${destinationSlug(dest.name)}`}
                      className="block h-full rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-900"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="h-full rounded-xl border border-slate-200 bg-white p-3.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{t("relatedPostsTitle")}</h2>
          <ul className="mt-3 space-y-2">
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <a href={`/blog/${p.slug}`} className="text-sm font-medium text-blue-700 underline hover:text-blue-800">
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <p>
          {t("verifiedLine", { date: dest.verified_at ?? "" })}{" "}
          <a href={dest.officialAuthorityUrl} rel="noopener noreferrer" className="underline">
            {t("officialSourceLink")}
          </a>
        </p>
        <p className="mt-1">
          <a href="/changelog#dataset-destinations" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
      </section>
    </article>
  );
}
