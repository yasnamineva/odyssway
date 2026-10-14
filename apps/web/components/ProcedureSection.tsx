import type { CustomsProcedure } from "@odyssway/engine";
import { getTranslations } from "next-intl/server";
import SourceNote from "./SourceNote";

/**
 * "How to get permission" for a customs row whose verdict depends on a permit:
 * the authority, lead time, documents and numbered steps, with the procedure's
 * own sources and check date (it is often verified from a different official
 * page than the verdict). Emits HowTo structured data (AGENTS.md §7).
 */
export default async function ProcedureSection({ procedure }: { procedure: CustomsProcedure }) {
  const t = await getTranslations("procedure");
  const ts = await getTranslations("tripCheck");

  const facts: Array<[string, string]> = [
    [t("authority"), procedure.authority],
    ...(procedure.leadTime ? [[t("leadTime"), procedure.leadTime] as [string, string]] : []),
    ...(procedure.processingTime ? [[t("processingTime"), procedure.processingTime] as [string, string]] : []),
    ...(procedure.fee ? [[t("fee"), procedure.fee] as [string, string]] : []),
  ];

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: procedure.title,
    ...(procedure.documents ? { supply: procedure.documents.map((d) => ({ "@type": "HowToSupply", name: d })) } : {}),
    step: procedure.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
  };

  return (
    <section className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200" aria-label={procedure.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <h3 className="font-display text-sm font-bold text-slate-900">{procedure.title}</h3>
      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[max-content_1fr]">
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-semibold text-slate-700">{label}</dt>
            <dd className="text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
      {procedure.documents && (
        <>
          <h4 className="mt-4 text-sm font-semibold text-slate-800">{t("documents")}</h4>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
            {procedure.documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </>
      )}
      <h4 className="mt-4 text-sm font-semibold text-slate-800">{t("steps")}</h4>
      <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
        {procedure.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {procedure.atTheBorder && (
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-800">{t("atTheBorder")}</span> {procedure.atTheBorder}
        </p>
      )}
      {procedure.transit && (
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-800">{t("transit")}</span> {procedure.transit}
        </p>
      )}
      {procedure.applyUrl && (
        <a
          href={procedure.applyUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-4 inline-block text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          {t("applyLink")}
        </a>
      )}
      <div className="mt-4 space-y-2">
        {procedure.sources.map((s, i) => (
          <SourceNote
            key={s.url}
            name={s.name}
            url={s.url}
            date={i === procedure.sources.length - 1 ? procedure.verified_at : null}
            sourceLabel={ts("sourceLabel")}
            checkedLabel={t("checkedOn", { date: procedure.verified_at })}
          />
        ))}
      </div>
    </section>
  );
}
