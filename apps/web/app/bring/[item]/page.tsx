import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BRING_CATEGORIES, bringCategoryBySlug } from "../../../lib/bring-categories";
import { customsItems, destinationByCode } from "../../../lib/destinations";

interface Params {
  item: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.values(BRING_CATEGORIES).map((c) => ({ item: c.slug }));
}

function rowsForCategory(slug: string) {
  const category = bringCategoryBySlug(slug);
  if (!category) return null;

  const rows = customsItems
    .filter((i) => i.category === category && i.status === "verified")
    .map((i) => ({ item: i, destination: destinationByCode(i.destination) }))
    .filter((r) => r.destination?.status === "verified")
    .sort((a, b) => a.destination!.name.localeCompare(b.destination!.name));

  return { category, meta: BRING_CATEGORIES[category], rows };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { item } = await params;
  const found = rowsForCategory(item);
  if (!found) return {};
  const t = await getTranslations("bringPage");
  const title = t("metaTitle", { item: found.meta.label });
  return {
    title,
    description: t("metaDescription", { item: found.meta.searchLabel }),
    alternates: { canonical: `/bring/${found.meta.slug}` },
    openGraph: { title, description: t("metaDescription", { item: found.meta.searchLabel }) },
  };
}

export default async function BringItemPage({ params }: { params: Promise<Params> }) {
  const { item } = await params;
  const found = rowsForCategory(item);
  // Anti-thin-content (AGENTS.md §7): a category page ships only if it has
  // real verified rows to show — never a placeholder.
  if (!found || found.rows.length === 0) notFound();
  const { meta, rows } = found;

  const t = await getTranslations("bringPage");
  const tc = await getTranslations("destinationPage.verdict");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rows.map(({ item: i, destination: d }) => ({
      "@type": "Question",
      name: t("faqQuestion", { item: meta.searchLabel, destination: d!.name }),
      acceptedAnswer: {
        "@type": "Answer",
        text: [tc(i.verdict), i.limits?.description, i.notes].filter(Boolean).join(" "),
      },
    })),
  };

  // Group by destination — a category can carry more than one row per
  // destination (e.g. general medication + controlled-medication), each
  // with its own verdict; never merge them into a single claim.
  const byDestination = new Map<string, { name: string; code: string; items: typeof rows }>();
  for (const r of rows) {
    const key = r.destination!.code;
    if (!byDestination.has(key)) {
      byDestination.set(key, { name: r.destination!.name, code: key, items: [] });
    }
    byDestination.get(key)!.items.push(r);
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/bring" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        {t("backToIndex")}
      </a>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {t("h1item", { item: meta.label })}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t("introItem", { item: meta.searchLabel })}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <a href="/trip-check" className="underline">
            {t("checkYourTripCta")}
          </a>
        </p>
      </header>

      <ul className="space-y-3">
        {[...byDestination.values()].map((d) => (
          <li key={d.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <a
              href={`/destinations/${d.code.toLowerCase()}`}
              className="font-display text-base font-bold text-slate-900 hover:underline"
            >
              {d.name}
            </a>
            <ul className="mt-2 divide-y divide-slate-100 text-sm text-slate-700">
              {d.items.map(({ item: i }) => (
                <li key={i.slug} className="py-2">
                  {d.items.length > 1 && (
                    <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      {i.names[0]}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-slate-900">{tc(i.verdict)}</span>
                    {i.limits?.description && <span> — {i.limits.description}</span>}
                  </div>
                  {i.notes && <p className="mt-1 text-xs leading-relaxed text-slate-500">{i.notes}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {t("verifiedLine", { date: i.verified_at ?? "" })}{" "}
                    <a href={i.legal_source.url} rel="noopener noreferrer" className="underline">
                      {i.legal_source.name}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </article>
  );
}
