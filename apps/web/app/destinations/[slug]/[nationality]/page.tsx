import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "../../../../components/BreadcrumbJsonLd";
import SourceNote from "../../../../components/SourceNote";
import { destinationPath } from "../../../../lib/destinations";
import { travelPair, travelPairPath, travelPairs, type TravelPair } from "../../../../lib/travel-pairs";

interface Params {
  slug: string;
  nationality: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return travelPairs.map((p) => ({ slug: p.destinationSlug, nationality: p.nationalitySlug }));
}

async function pairText(pair: TravelPair) {
  const t = await getTranslations("travelPair");
  const vars = { citizens: pair.nationality.citizenLabel, destination: pair.destination.name };
  const policy = pair.row.stayPolicy;
  const stay =
    policy.kind === "fixed_per_entry"
      ? t("stayFixed", { days: policy.maxDays })
      : policy.kind === "rolling_window"
        ? t("stayRolling", { maxDays: policy.maxDays, windowDays: policy.windowDays })
        : pair.row.requirement === "visa_required"
          ? t("stayVisa")
          : t("stayUnconfirmed");
  return { t, vars, answer: t(`answer.${pair.row.requirement}`, vars), stay };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, nationality } = await params;
  const pair = travelPair(slug, nationality);
  if (!pair) return {};
  const { t, vars, answer } = await pairText(pair);
  const title = t("metaTitle", vars);
  const description = t("metaDescription", { ...vars, answer, date: pair.row.verified_at ?? "" });
  return {
    title,
    description,
    alternates: { canonical: travelPairPath(pair) },
    openGraph: { title, description, images: ["/opengraph-image"] },
  };
}

export default async function TravelPairPage({ params }: { params: Promise<Params> }) {
  const { slug, nationality } = await params;
  const pair = travelPair(slug, nationality);
  if (!pair) notFound();
  const { t, vars, answer, stay } = await pairText(pair);
  const tr = await getTranslations("destinationPage.requirement");
  const tc = await getTranslations("common");
  const ts = await getTranslations("tripCheck");
  const { row } = pair;

  // The comparisons are what make each page more than its one row: the same
  // destination across passports, and the same passport across destinations.
  const sameDestination = travelPairs
    .filter(
      (p) =>
        p.destination.code === pair.destination.code &&
        p.nationality.nationality !== pair.nationality.nationality,
    )
    .sort((a, b) => a.nationality.name.localeCompare(b.nationality.name));
  const sameNationality = travelPairs
    .filter(
      (p) =>
        p.nationality.nationality === pair.nationality.nationality &&
        p.destination.code !== pair.destination.code,
    )
    .sort((a, b) => a.destination.name.localeCompare(b.destination.name));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("h1", vars),
        acceptedAnswer: { "@type": "Answer", text: [answer, stay, row.notes].filter(Boolean).join(" ") },
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbJsonLd
        trail={[
          { name: pair.destination.name, path: destinationPath(pair.destination) },
          { name: t("h1", vars), path: travelPairPath(pair) },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href={destinationPath(pair.destination)} className="hover:text-slate-900">
          {pair.destination.name}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{pair.nationality.name}</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {t("h1", vars)}
        </h1>
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t("shortAnswer")}</span>
          <br />
          <span className="font-medium text-slate-900">{answer}</span> {stay}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold text-slate-900">{t("stayTitle")}</dt>
            <dd className="mt-1">{stay}</dd>
          </div>
          {row.documentsNeeded.length > 0 && (
            <div>
              <dt className="font-semibold text-slate-900">{t("documentsTitle")}</dt>
              <dd className="mt-1">
                <ul className="list-disc space-y-1 pl-5">
                  {row.documentsNeeded.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {row.notes && (
            <div>
              <dt className="font-semibold text-slate-900">{t("notesTitle")}</dt>
              <dd className="mt-1">{row.notes}</dd>
            </div>
          )}
        </dl>
        <SourceNote
          className="mt-4"
          name={row.legal_source.name}
          url={row.legal_source.url}
          date={row.verified_at}
          sourceLabel={ts("sourceLabel")}
          checkedLabel={row.verified_at ? ts("checkedOn", { date: row.verified_at }) : undefined}
        />
      </section>

      <p className="text-sm">
        <a
          href={`/trip-check?nationality=${pair.nationality.nationality}&destination=${pair.destination.code}`}
          className="font-medium text-blue-700 underline"
        >
          {t("ctaTripCheck")}
        </a>
        <span className="mx-2 text-slate-300" aria-hidden="true">
          |
        </span>
        <a href={destinationPath(pair.destination)} className="text-blue-700 underline">
          {t("destinationGuide", vars)}
        </a>
      </p>

      {sameDestination.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{t("otherNationalities", vars)}</h2>
          <ul className="mt-3 grid gap-x-6 border-t border-slate-200 text-sm sm:grid-cols-2">
            {sameDestination.map((p) => (
              <li key={p.nationality.nationality} className="flex justify-between gap-3 border-b border-slate-200 py-2">
                <a href={travelPairPath(p)} className="text-slate-900 underline decoration-slate-300 underline-offset-2">
                  {p.nationality.name}
                </a>
                <span className="text-right text-xs text-slate-500">{tr(p.row.requirement)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sameNationality.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{t("otherDestinations", vars)}</h2>
          <ul className="mt-3 grid gap-x-6 border-t border-slate-200 text-sm sm:grid-cols-2">
            {sameNationality.map((p) => (
              <li key={p.destination.code} className="flex justify-between gap-3 border-b border-slate-200 py-2">
                <a href={travelPairPath(p)} className="text-slate-900 underline decoration-slate-300 underline-offset-2">
                  {p.destination.name}
                </a>
                <span className="text-right text-xs text-slate-500">{tr(p.row.requirement)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")}{" "}
        <a href="/changelog#dataset-entry-requirements" className="underline">
          {tc("updateHistory")}
        </a>
      </p>
    </article>
  );
}
