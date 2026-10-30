import { OPERATOR } from "./legal";
import { SITE_URL } from "./site";

/**
 * A pre-filled email for reporting a wrong or outdated rule: names the rule,
 * the page and the source we cite, so the report can be checked against that
 * source straight away. Opens the reader's own mail app; nothing is sent
 * through the site (privacy policy §4 covers emails sent to us).
 */
export function reportProblemHref({
  rule,
  path,
  sourceUrl,
  verifiedAt,
}: {
  /** Human-readable rule id, e.g. "tobacco-my (Malaysia)". */
  rule: string;
  /** Site path of the page, e.g. "/bring/tobacco/malaysia". */
  path: string;
  sourceUrl: string;
  verifiedAt?: string | null;
}): string {
  const subject = `Rule check: ${rule}`;
  const body = [
    `Page: ${SITE_URL}${path}`,
    `Rule: ${rule}`,
    `Our source: ${sourceUrl}`,
    verifiedAt ? `Last checked: ${verifiedAt}` : "",
    "",
    "What's wrong or out of date:",
    "",
    "Official source that says otherwise (link):",
    "",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
  return `mailto:${OPERATOR.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
