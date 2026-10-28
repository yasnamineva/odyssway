import { useTranslations } from "next-intl";
import type { TripCharge } from "../lib/trip-charges";
import SourceNote from "./SourceNote";

/** Government charges for one destination (data/trip-charges.json), each with its own source. */
export default function TripChargeList({ charges, compact = false }: { charges: TripCharge[]; compact?: boolean }) {
  const t = useTranslations("tripCharges");
  const tc = useTranslations("tripCheck");
  if (charges.length === 0) return null;
  return (
    <ul className={compact ? "mt-2 space-y-3" : "mt-4 divide-y divide-slate-200 border-y border-slate-200"} data-testid="trip-charges">
      {charges.map((c) => (
        <li key={c.id} className={compact ? "text-sm" : "py-3 text-sm"} data-testid="trip-charge">
          <p className="font-semibold text-slate-900">
            {c.title}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{t(`kind.${c.kind}`)}</span>
          </p>
          <p className="mt-0.5 font-medium text-slate-800">{c.amountText}</p>
          {c.area && <p className="text-xs font-semibold text-amber-800">{t("area", { area: c.area })}</p>}
          <p className="mt-1 text-slate-700">{c.whoPays}</p>
          {c.howToPay && <p className="mt-1 text-slate-700">{c.howToPay}</p>}
          {c.from && <p className="mt-1 text-xs text-slate-600">{t("from", { date: c.from })}</p>}
          {!compact && c.notes && <p className="mt-1 text-xs text-slate-600">{c.notes}</p>}
          <SourceNote
            className="mt-2"
            name={c.legal_source.name}
            url={c.legal_source.url}
            date={c.verified_at ?? undefined}
            sourceLabel={tc("sourceLabel")}
            checkedLabel={c.verified_at ? tc("checkedOn", { date: c.verified_at }) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
