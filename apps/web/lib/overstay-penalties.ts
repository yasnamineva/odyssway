import { schemas } from "@odyssway/engine";
import { z } from "zod";
import rawOverstayPenalties from "../../../data/overstay-penalties.json";
import { countryName } from "./countries";

export type OverstayPenalty = z.infer<typeof schemas.overstayPenaltySchema>;

/** Schema-validated at module load: a bad data edit fails the build. */
export const overstayPenalties: OverstayPenalty[] =
  schemas.overstayPenaltiesFileSchema.parse(rawOverstayPenalties);

/** Only verified rows ship as pages (AGENTS.md §7 anti-thin-content rule). */
export const publishedOverstayPenalties: OverstayPenalty[] = overstayPenalties.filter(
  (r) => r.status === "verified",
);

export function overstayPenaltyBySlug(slug: string): OverstayPenalty | undefined {
  return publishedOverstayPenalties.find(
    (r) => r.country.toLowerCase() === slug.toLowerCase(),
  );
}

export function overstayCountryName(code: string): string {
  return countryName(code);
}
