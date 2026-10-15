import type { CustomsItemRecord } from "@odyssway/engine";
import { getTranslations } from "next-intl/server";
import { rowLabel } from "../lib/bring-pages";
import { destinationByCode } from "../lib/destinations";
import BorderCardButton from "./BorderCardButton";
import ProcedureSection from "./ProcedureSection";
import SourceNote from "./SourceNote";

export const VERDICT_STYLES: Record<string, string> = {
  prohibited: "bg-red-50 text-red-700 ring-red-200",
  allowed_with_limits: "bg-amber-50 text-amber-800 ring-amber-200",
  allowed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  declaration_required: "bg-blue-50 text-blue-700 ring-blue-200",
  depends: "bg-slate-100 text-slate-700 ring-slate-200",
};

/** One verified customs row: verdict, limits, notes, how to get any permit it needs, what else it covers, source and date. */
export default async function CustomsRowCard({
  row,
  destinationCode,
}: {
  row: CustomsItemRecord;
  destinationCode: string;
}) {
  const t = await getTranslations("bringDestinationPage");
  const tv = await getTranslations("destinationPage.verdict");
  const ts = await getTranslations("tripCheck");
  const tt = await getTranslations("transit");
  const tb = await getTranslations("borderCard");
  const destinationName = destinationByCode(destinationCode)?.name ?? destinationCode;
  const label = rowLabel(row.slug, destinationCode);
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold text-slate-900">
          {label}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[row.verdict] ?? VERDICT_STYLES.depends}`}
        >
          {tv(row.verdict)}
        </span>
      </div>
      {row.limits?.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{row.limits.description}</p>
      )}
      {row.notes && <p className="mt-2 text-sm leading-relaxed text-slate-600">{row.notes}</p>}
      {row.procedure && <ProcedureSection procedure={row.procedure} />}
      {row.transit && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3" data-testid="row-transit">
          <p className="text-sm font-semibold text-slate-800">
            {tt("heading")}{" "}
            <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {tt(row.transit.rule)}
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{row.transit.description}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tt("sourceLabel")}{" "}
            <a href={row.transit.source.url} rel="noopener noreferrer" className="underline">
              {row.transit.source.name}
            </a>
            {" · "}
            {ts("checkedOn", { date: row.transit.verified_at })}
          </p>
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold">{t("alsoCovers")}</span> {row.names.slice(0, 14).join(", ")}
      </p>
      <BorderCardButton
        row={row}
        fileName={`border-card-${row.slug}.pdf`}
        buttonLabel={tb("button")}
        labels={{
          title: tb("title", { item: label, destination: destinationName }),
          verdict: tv(row.verdict),
          rule: tb("rule"),
          quantity: tb("quantity"),
          notes: tb("notes"),
          carry: tb("carry"),
          apply: tb("apply"),
          leadTime: tb("leadTime"),
          applyUrl: tb("applyUrl"),
          atTheBorder: tb("atTheBorder"),
          transit: tb("transit"),
          transitRule: row.transit ? tt(row.transit.rule) : "",
          source: tb("source"),
          checked: row.verified_at ? ts("checkedOn", { date: row.verified_at }) : "",
          footer: tb("footer"),
        }}
      />
      <SourceNote
        className="mt-4"
        name={row.legal_source.name}
        url={row.legal_source.url}
        date={row.verified_at}
        sourceLabel={ts("sourceLabel")}
        checkedLabel={row.verified_at ? ts("checkedOn", { date: row.verified_at }) : undefined}
      />
    </li>
  );
}
