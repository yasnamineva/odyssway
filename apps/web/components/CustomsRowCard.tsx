import type { CustomsItemRecord } from "@odyssway/engine";
import { getTranslations } from "next-intl/server";
import { rowLabel } from "../lib/bring-pages";
import SourceNote from "./SourceNote";

export const VERDICT_STYLES: Record<string, string> = {
  prohibited: "bg-red-50 text-red-700 ring-red-200",
  allowed_with_limits: "bg-amber-50 text-amber-800 ring-amber-200",
  allowed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  declaration_required: "bg-blue-50 text-blue-700 ring-blue-200",
  depends: "bg-slate-100 text-slate-700 ring-slate-200",
};

/** One verified customs row: verdict, limits, notes, what else it covers, source and date. */
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
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold text-slate-900">
          {rowLabel(row.slug, destinationCode)}
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
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold">{t("alsoCovers")}</span> {row.names.slice(0, 14).join(", ")}
      </p>
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
