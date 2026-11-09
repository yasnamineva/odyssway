import type { CustomsItemRecord, TranslatableFields } from "@odyssway/engine";
import { createTranslator } from "next-intl";
import deMessages from "../messages/de.json";

const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });

/**
 * A row's permit how-to, doctor's-letter checklist and transit rule on a German page,
 * from its "{slug}#details" translation. Authority names, links and sources stay as
 * published (in English); everything a reader acts on is in German.
 */
export default function GermanRowDetails({
  row,
  details,
  country,
  formatDate,
}: {
  row: CustomsItemRecord;
  details: TranslatableFields;
  country: string;
  formatDate: (iso: string) => string;
}) {
  const p = row.procedure;
  const facts: Array<[string, string, boolean]> = p
    ? [
        [t("procedure.authority"), p.authority, true],
        ...(details.procedureLeadTime ? [[t("procedure.leadTime"), details.procedureLeadTime, false] as [string, string, boolean]] : []),
        ...(details.procedureProcessingTime
          ? [[t("procedure.processingTime"), details.procedureProcessingTime, false] as [string, string, boolean]]
          : []),
        ...(details.procedureFee ? [[t("procedure.fee"), details.procedureFee, false] as [string, string, boolean]] : []),
      ]
    : [];

  return (
    <>
      {p && details.procedureTitle && details.procedureSteps && (
        <section className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200" data-testid="de-procedure">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                inLanguage: "de",
                name: details.procedureTitle,
                ...(details.procedureDocuments
                  ? { supply: details.procedureDocuments.map((d) => ({ "@type": "HowToSupply", name: d })) }
                  : {}),
                step: details.procedureSteps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
              }),
            }}
          />
          <h4 className="text-sm font-bold text-slate-900">{details.procedureTitle}</h4>
          <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[max-content_1fr]">
            {facts.map(([label, value, english]) => (
              <div key={label} className="contents">
                <dt className="font-semibold text-slate-700">{label}</dt>
                <dd className="text-slate-700" lang={english ? "en" : undefined}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {details.procedureDocuments && (
            <>
              <h5 className="mt-4 text-sm font-semibold text-slate-800">{t("procedure.documents")}</h5>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                {details.procedureDocuments.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </>
          )}
          <h5 className="mt-4 text-sm font-semibold text-slate-800">{t("procedure.steps")}</h5>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
            {details.procedureSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {details.procedureAtTheBorder && (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-800">{t("procedure.atTheBorder")}</span> {details.procedureAtTheBorder}
            </p>
          )}
          {p.applyUrl && (
            <a
              href={p.applyUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="mt-4 inline-block text-sm font-semibold text-blue-700 underline underline-offset-2"
            >
              {t("procedure.applyLink")}
            </a>
          )}
          <p className="mt-3 text-xs text-slate-500">
            <span className="font-semibold">{t("source")}: </span>
            {p.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && "; "}
                <a href={s.url} lang="en" className="underline" rel="noopener">
                  {s.name}
                </a>
              </span>
            ))}
            {" · "}
            {t("procedure.checkedOn", { date: formatDate(p.verified_at) })}
          </p>
        </section>
      )}

      {row.letter && details.letterItems && (
        <section className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-3" data-testid="de-letter-checklist">
          <h4 className="text-sm font-semibold text-slate-900">{t("letter.title")}</h4>
          <p className="mt-0.5 text-xs text-slate-600">{t("letter.hint", { country })}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-snug text-slate-800">
            {details.letterItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-semibold">{t("source")}: </span>
            <a href={row.letter.source.url} lang="en" className="underline" rel="noopener">
              {row.letter.source.name}
            </a>
            {" · "}
            {t("letter.checkedOn", { date: formatDate(row.letter.verified_at) })}
          </p>
        </section>
      )}

      {row.transit && details.transitDescription && (
        <section className="mt-4 rounded-xl bg-slate-50 p-3" data-testid="de-transit">
          <h4 className="text-sm font-semibold text-slate-900">
            {t("transit.heading")}: <span className="font-medium">{t(`transit.${row.transit.rule}`)}</span>
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{details.transitDescription}</p>
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-semibold">{t("source")}: </span>
            <a href={row.transit.source.url} lang="en" className="underline" rel="noopener">
              {row.transit.source.name}
            </a>
            {" · "}
            {t("transit.checkedOn", { date: formatDate(row.transit.verified_at) })}
          </p>
        </section>
      )}
    </>
  );
}
