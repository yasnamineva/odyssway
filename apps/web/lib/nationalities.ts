import { schemas } from "@odyssway/engine";
import { z } from "zod";
import rawNationalityRules from "../../../data/nationality-rules.json";

export type NationalityRule = z.infer<typeof schemas.nationalityRuleSchema>;

/** Schema-validated at module load: a bad data edit fails the build. */
export const nationalityRules: NationalityRule[] =
  schemas.nationalityRulesFileSchema.parse(rawNationalityRules);

/** Only verified rows ship as pages (AGENTS.md §7 anti-thin-content rule). */
export const publishedNationalities: NationalityRule[] = nationalityRules.filter(
  (r) => r.status === "verified",
);

/** Nationalities that actually get an /etias/[nationality] page — visa-required
 * nationalities (e.g. CN, IN) are verified rows too, but ETIAS doesn't apply to
 * them, so listing them would publish 404s (and did, in the sitemap). */
export const etiasNationalities: NationalityRule[] = publishedNationalities.filter(
  (r) => r.visaExempt && r.etiasApplicable,
);

export function nationalityBySlug(slug: string): NationalityRule | undefined {
  return publishedNationalities.find(
    (r) => r.nationality.toLowerCase() === slug.toLowerCase(),
  );
}
