import { schemas } from "@borderline/engine";
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

export function nationalityBySlug(slug: string): NationalityRule | undefined {
  return publishedNationalities.find(
    (r) => r.nationality.toLowerCase() === slug.toLowerCase(),
  );
}
