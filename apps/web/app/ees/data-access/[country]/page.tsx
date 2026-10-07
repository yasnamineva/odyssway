import type { Metadata } from "next";
import BreadcrumbJsonLd from "../../../../components/BreadcrumbJsonLd";
import { InShort, LinkCard, LinkCards, More, Step, Steps } from "../../../../components/content/Blocks";
import { ChevronDownIcon, LetterIcon } from "../../../../components/icons";
import Photo from "../../../../components/content/Photo";
import SourceNote from "../../../../components/SourceNote";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { eesCountryName, eesRecordBySlug, publishedEesRecords } from "../../../../lib/ees";
import { letterEnglish, lettersByCountry, type LetterTemplate } from "../../../../lib/ees-letters";

interface Params {
  country: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedEesRecords.map((r) => ({ country: r.country.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const record = eesRecordBySlug((await params).country);
  if (!record) return {};
  const t = await getTranslations("eesAccess");
  const country = eesCountryName(record.country);
  return {
    title: t("metaTitle", { country }),
    description: t("metaDescription", { country }),
    alternates: { canonical: `/ees/data-access/${record.country.toLowerCase()}` },
  };
}

function Letter({
  letter,
  label,
  country,
  downloadLabel,
}: {
  letter: LetterTemplate;
  label: string;
  country: string;
  downloadLabel: string;
}) {
  const text = `${letter.subject}\n\n${letter.body}\n`;
  const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  const filename = `ees-rectification-${country.toLowerCase()}-${letter.lang}.txt`;
  return (
    <details className="group rounded-xl border border-slate-200 bg-white open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-slate-800 select-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <LetterIcon className="h-4 w-4 text-slate-500" />
          {label}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-700">{letter.subject}</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700">
          {letter.body}
        </pre>
        <a
          href={dataUrl}
          download={filename}
          className="mt-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {downloadLabel}
        </a>
      </div>
    </details>
  );
}

export default async function EesDataAccessPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const record = eesRecordBySlug((await params).country);
  if (!record) notFound();
  const t = await getTranslations("eesAccess");
  const tc = await getTranslations("common");
  const ts = await getTranslations("tripCheck");
  const country = eesCountryName(record.country);
  const localLetter = lettersByCountry[record.country];

  return (
    <article className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd
        trail={[
          { name: "EES", path: "/ees" },
          { name: t("h1", { country }), path: `/ees/data-access/${record.country.toLowerCase()}` },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/ees" className="hover:text-slate-900">
          EES
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{country}</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
        {t("h1", { country })}
      </h1>

      <Photo name="ees-envelope" hero />

      <InShort>{t("intro", { country })}</InShort>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">{t("authorityTitle")}</h2>
        <div className="mt-3">
          <p className="text-base font-semibold break-words text-slate-900">{record.contactName ?? record.authority}</p>
          <p className="mt-0.5 text-[15px] text-slate-600">{t("authorityRole")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {record.contactEmail ? (
              <a
                href={`mailto:${record.contactEmail}`}
                className="inline-flex max-w-full items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                <LetterIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{record.contactEmail}</span>
              </a>
            ) : null}
            {record.formUrl ? (
              <a
                href={record.formUrl}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("authorityWebsite")}
              </a>
            ) : null}
          </div>
          {!record.contactEmail ? (
            <p className="mt-3 text-[15px] text-slate-700">{t("noEmail")}</p>
          ) : null}
          <More summary={t("fullContact")}>
            <p>{record.authority}</p>
            <p className="mt-2">{record.contactChannel}</p>
            {record.languageRequirements ? <p className="mt-2 text-slate-500">{record.languageRequirements}</p> : null}
          </More>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">{t("stepsTitle")}</h2>
        <Steps>
          <Step title={t("step1Title")}>{t("step1")}</Step>
          <Step title={t("step2Title")}>{t("step2")}</Step>
          <Step title={t("step3Title")}>{t("step3", { country })}</Step>
          <Step title={t("step4Title")}>{t("step4")}</Step>
        </Steps>
        {record.appealPath ? (
          <More summary={t("appealLabel")}>
            <p>{record.appealPath}</p>
          </More>
        ) : null}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{t("lettersTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{t("lettersIntro")}</p>
        {localLetter ? (
          <Letter
            letter={localLetter}
            label={t("letterLabel", { language: localLetter.languageName })}
            country={record.country}
            downloadLabel={t("downloadLabel")}
          />
        ) : null}
        <Letter
          letter={letterEnglish}
          label={t("letterLabel", { language: "English" })}
          country={record.country}
          downloadLabel={t("downloadLabel")}
        />
      </section>

      <LinkCards>
        <LinkCard href="/ees/missing-exit-record" title={t("linkMissingExit")} />
        <LinkCard href="/ees/dispute-overstay" title={t("disputeLink")} />
      </LinkCards>

      <div className="mt-10">
        <SourceNote
          name={record.legal_source.name}
          url={record.legal_source.url}
          date={record.verified_at}
          sourceLabel={ts("sourceLabel")}
          checkedLabel={record.verified_at ? ts("checkedOn", { date: record.verified_at }) : undefined}
        />
        <p className="mt-3 text-xs text-slate-500">
          <a href="/changelog#dataset-ees" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
      </div>
    </article>
  );
}
