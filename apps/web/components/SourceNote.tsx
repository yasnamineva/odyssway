/**
 * The one way a cited fact shows its evidence, everywhere on the site: who
 * says so (linked) and when we last checked it. Kept visually quiet — a rule
 * on the left, small type — so it sits beside a finding without competing
 * with it. Labels come in as props so this works in server and client trees.
 */
export default function SourceNote({
  name,
  url,
  date,
  sourceLabel,
  checkedLabel,
  className = "",
}: {
  name: string;
  url: string;
  date?: string | null;
  /** e.g. "Source" */
  sourceLabel: string;
  /** e.g. "Checked 2026-10-05" — already formatted by the caller's i18n. */
  checkedLabel?: string;
  className?: string;
}) {
  return (
    <p
      className={`border-l-2 border-brand-600/60 pl-3 text-xs leading-relaxed text-slate-600 ${className}`}
      data-testid="source-note"
    >
      <span className="font-semibold tracking-wide text-slate-700 uppercase">{sourceLabel}</span>{" "}
      <a
        href={url}
        rel="noopener noreferrer"
        target="_blank"
        className="break-words underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
      >
        {name}
      </a>
      {date && checkedLabel ? <span className="block text-slate-500">{checkedLabel}</span> : null}
    </p>
  );
}
