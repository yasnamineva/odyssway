import { getTranslations } from "next-intl/server";
import { customsItems, entryRequirements } from "../lib/destinations";
import { publishedNationalities } from "../lib/nationalities";
import { resolveTripCheck } from "../lib/trip-check";
import { ArrowRightIcon } from "./icons";

/** The worked example: a US passport holder flying to Japan with Sudafed —
 * a real, high-stakes question (AGENTS.md §14's medication wedge) whose
 * answer is not the one most people expect. */
const NATIONALITY = "US";
const DESTINATION = "JP";
const ITEM_QUERY = "Sudafed";

/**
 * A real Trip Check answer, rendered on the homepage at build time through
 * the same resolver the tool uses, so the page *shows* what a cited, dated
 * answer looks like instead of claiming it. Every line comes from a
 * verified data row; if any of them stops being verified (or stops
 * matching), the section renders nothing rather than a stale example.
 */
export default async function SampleAnswer() {
  const t = await getTranslations();
  const result = resolveTripCheck(NATIONALITY, DESTINATION, [ITEM_QUERY]);
  const entryRow = entryRequirements.find(
    (r) => r.nationality === NATIONALITY && r.destination === DESTINATION && r.status === "verified",
  );
  const item = result.items[0]?.match;
  const itemRow = item ? customsItems.find((c) => c.slug === item.slug && c.status === "verified") : undefined;
  const stay = result.stayPolicy;
  if (!result.covered || result.basis !== "visa_free" || !entryRow || !itemRow) return null;
  if (!stay || stay.kind !== "fixed_per_entry") return null;
  // AGENTS.md §13.2: never render a rule whose row lacks verified_at.
  const entryChecked = entryRow.verified_at;
  const itemChecked = itemRow.verified_at;
  if (!entryChecked || !itemChecked) return null;

  const nationalityName =
    publishedNationalities.find((n) => n.nationality === NATIONALITY)?.name ?? NATIONALITY;

  const rows: Array<{ label: string; answer: string; detail?: string; source: { name: string; url: string }; checked: string }> = [
    {
      label: t("tripCheck.entryCardTitle"),
      answer: t("home.sample.entryAnswer"),
      source: entryRow.legal_source,
      checked: entryChecked,
    },
    {
      label: t("tripCheck.stayCardTitle"),
      answer: t("tripCheck.stayFixedPerEntry", { maxDays: stay.maxDays }),
      source: entryRow.legal_source,
      checked: entryChecked,
    },
    {
      label: t("tripCheck.documentsCardTitle"),
      answer: result.documentsNeeded.join(" · "),
      source: entryRow.legal_source,
      checked: entryChecked,
    },
    {
      label: t("home.sample.itemLabel", { item: ITEM_QUERY }),
      answer: t(`tripCheck.verdict.${itemRow.verdict}`),
      detail: itemRow.limits?.description,
      source: itemRow.legal_source,
      checked: itemChecked,
    },
  ];

  return (
    <section>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-14">
        <div>
          <p className="flex items-center gap-3 font-display text-[15px] text-brand-700 italic">
            <span className="h-px w-8 shrink-0 bg-brand-700/50" aria-hidden="true" />
            {t("home.sample.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("home.sample.heading")}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">{t("home.sample.sub")}</p>
          <a
            href={`/trip-check?nationality=${NATIONALITY}&destination=${DESTINATION}`}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
          >
            {t("home.sample.cta")} <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <article className="rounded-md border border-slate-300 bg-[#fffdf8]">
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-300 px-5 py-4 sm:px-6">
            <p className="font-display text-lg font-bold text-slate-900">
              {t("home.sample.query", { nationality: nationalityName, destination: result.destinationName, item: ITEM_QUERY })}
            </p>
            <span className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">{t("home.sample.tag")}</span>
          </header>
          <dl className="divide-y divide-slate-200">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 sm:px-6">
                <dt className="text-[13px] font-semibold text-slate-500">{row.label}</dt>
                <dd>
                  <p className="text-sm font-semibold text-slate-900">{row.answer}</p>
                  {row.detail ? <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{row.detail}</p> : null}
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    {t("tripCheck.sourceLabel")}{" "}
                    <a href={row.source.url} className="underline decoration-slate-300 underline-offset-2 hover:text-slate-800" rel="noopener">
                      {row.source.name}
                    </a>
                    <span aria-hidden="true"> · </span>
                    {t("home.sample.checked", { date: row.checked })}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
