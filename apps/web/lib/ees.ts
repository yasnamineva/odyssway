import { schemas } from "@odyssway/engine";
import { z } from "zod";
import rawEes from "../../../data/ees.json";
import { countryName } from "./countries";

export type EesRecord = z.infer<typeof schemas.eesRecordSchema>;

/** Schema-validated at module load: a bad data edit fails the build. */
export const eesRecords: EesRecord[] = schemas.eesFileSchema.parse(rawEes);

/** Only verified rows ship as pages (AGENTS.md §7 anti-thin-content rule). */
export const publishedEesRecords: EesRecord[] = eesRecords.filter(
  (r) => r.status === "verified",
);

export function eesRecordBySlug(slug: string): EesRecord | undefined {
  return publishedEesRecords.find(
    (r) => r.country.toLowerCase() === slug.toLowerCase(),
  );
}

export function eesCountryName(code: string): string {
  return countryName(code);
}
