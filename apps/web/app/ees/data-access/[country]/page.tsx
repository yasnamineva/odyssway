import type { Metadata } from "next";
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
    <details className="group rounded-xl border border-slate-200 bg-slate-50 open:bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-800">
        {label}
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
  const country = eesCountryName(record.country);
  const localLetter = lettersByCountry[record.country];

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("h1", { country })}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t("intro", { country })}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("authorityTitle")}</h2>
        <p className="mt-2">{record.authority}</p>
        <p className="mt-2">
          {record.contactChannel}{" "}
          {record.formUrl ? (
            <a href={record.formUrl} rel="noopener noreferrer" className="underline">
              {t("authorityWebsite")}
            </a>
          ) : null}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("stepsTitle")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>{t("step3", { country })}</li>
          <li>{t("step4")}</li>
        </ol>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {record.expectedTimeline ? (
            <div className="rounded-xl bg-blue-50 p-3">
              <dt className="text-xs font-semibold text-slate-800">{t("timelineLabel")}</dt>
              <dd className="mt-1 text-xs leading-relaxed">{record.expectedTimeline}</dd>
            </div>
          ) : null}
          {record.appealPath ? (
            <div className="rounded-xl bg-blue-50 p-3">
              <dt className="text-xs font-semibold text-slate-800">{t("appealLabel")}</dt>
              <dd className="mt-1 text-xs leading-relaxed">{record.appealPath}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          {t("lettersTitle")}
        </h2>
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
        {record.languageRequirements ? (
          <p className="text-xs leading-relaxed text-slate-500">
            {record.languageRequirements}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <p>
          {t("sourceLine")}{" "}
          <a href={record.legal_source.url} rel="noopener noreferrer" className="underline">
            {record.legal_source.name}
          </a>
        </p>
        {record.verified_at ? (
          <p className="mt-1">{t("checkedOn", { date: record.verified_at })}</p>
        ) : null}
        <p className="mt-1">
          <a href="/changelog#dataset-ees" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
        <p className="mt-2">
          <a href="/ees/dispute-overstay" className="underline">
            {t("disputeLink")}
          </a>
        </p>
      </section>
    </article>
  );
}
