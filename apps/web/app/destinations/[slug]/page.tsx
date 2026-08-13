import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { customsItems, destinationByCode, destinations, entryRequirements } from "../../../lib/destinations";
import { nationalityRules } from "../../../lib/nationalities";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return destinations
    .filter((d) => d.status === "verified")
    .map((d) => ({ slug: d.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const dest = destinationByCode((await params).slug);
  if (!dest) return {};
  const t = await getTranslations("destinationPage");
  return {
    title: t("metaTitle", { destination: dest.name }),
    description: t("metaDescription", { destination: dest.name }),
    alternates: { canonical: `/destinations/${dest.code.toLowerCase()}` },
  };
}

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const dest = destinationByCode((await params).slug);
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

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("h1", { destination: dest.name })}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          <a href="/" className="underline">
            {t("checkYourTripCta")}
          </a>
        </p>
      </header>

      {nationalityRows.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{t("entryTitle")}</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm text-slate-700">
            {nationalityRows.map(({ row, name }) => (
              <li key={row.nationality} className="py-2">
                <span className="font-medium text-slate-900">{name}: </span>
                {t(`requirement.${row.requirement}`)}
                {row.stayPolicy.kind === "fixed_per_entry" && (
                  <span> — {t("upToDays", { days: row.stayPolicy.maxDays })}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {items.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{t("itemsTitle")}</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm text-slate-700">
            {items.map((item) => (
              <li key={item.slug} className="py-2">
                <span className="font-medium text-slate-900">{item.names[0]}: </span>
                {t(`verdict.${item.verdict}`)}
                {item.limits && <span className="text-slate-500"> — {item.limits.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
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
