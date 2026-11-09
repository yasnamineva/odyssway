import type { CustomsItemRecord } from "@odyssway/engine";
import { createTranslator } from "next-intl";
import deMessages from "../messages/de.json";
import { germanDate, translatedCustomsDetails, translatedCustomsRow } from "../lib/translations";
import GermanRowDetails from "./GermanRowDetails";

const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });

/**
 * One verified customs row on a German page: verdict, limits, notes, permit how-to,
 * letter checklist, transit rule, sources and check date. Callers only render rows
 * that `germanRowsReady` accepted, so the translation is fresh and complete.
 */
export default function GermanCustomsRowCard({ row, heading, country }: { row: CustomsItemRecord; heading: string; country: string }) {
  const tr = translatedCustomsRow(row, "de")!;
  const details = translatedCustomsDetails(row, "de");
  const sources = [row.legal_source, ...((row as { _sources?: Array<{ name: string; url: string }> })._sources ?? [])].filter(
    (s, i, all) => s && all.findIndex((x) => x?.url === s.url) === i,
  );
  return (
    <li id={row.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{heading}</h3>
      <p className="mt-1 text-sm font-medium text-slate-800">{t(`verdict.${row.verdict}`)}</p>
      {tr.limitsDescription && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          <span className="font-semibold">{t("limit")}: </span>
          {tr.limitsDescription}
          {tr.limitsQuantity && <span className="text-slate-600"> ({tr.limitsQuantity})</span>}
        </p>
      )}
      {tr.notes && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          <span className="font-semibold">{t("details")}: </span>
          {tr.notes}
        </p>
      )}
      {details ? <GermanRowDetails row={row} details={details} country={country} formatDate={germanDate} /> : null}
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>
          <span className="font-semibold">{t("source")}: </span>
          {sources.map((s, i) => (
            <span key={s!.url}>
              {i > 0 && "; "}
              <a href={s!.url} lang="en" className="underline" rel="noopener">
                {s!.name}
              </a>
            </span>
          ))}
        </p>
        {row.verified_at && <p className="mt-1">{t("checked", { date: germanDate(row.verified_at) })}</p>}
      </div>
    </li>
  );
}
