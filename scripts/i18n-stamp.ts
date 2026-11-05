/**
 * Fills in `sourceHash` for new translations (GROWTH_AND_ROADMAP.md §5.5).
 *
 * A translator writes an entry with `"sourceHash": "pending"`; this script replaces
 * "pending" with the hash of the English row as it is now. It never touches an entry
 * that already has a hash: a stale hash must stay stale until someone retranslates the
 * row, so the site keeps showing English for it.
 *
 *   pnpm i18n:stamp          # every locale
 *   pnpm i18n:stamp de       # one locale
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { customsRowDetails, customsRowFields, detailsId, entryRowFields, entryRowId, translationSourceHash } from "../packages/engine/src/translation";

const DATA = join(import.meta.dirname, "..", "data");
const only = process.argv[2];

const english: Record<string, Map<string, ReturnType<typeof customsRowFields>>> = {
  "customs-items.json": new Map(
    (JSON.parse(readFileSync(join(DATA, "customs-items.json"), "utf8")) as Array<Record<string, any>>).flatMap((r) => {
      // A row's procedure, letter checklist and transit rule are a separate entry ("{slug}#details").
      const details = customsRowDetails(r);
      const main = [r.slug as string, customsRowFields(r)] as const;
      return details ? [main, [detailsId(r.slug as string), details] as const] : [main];
    }),
  ),
  "entry-requirements.json": new Map(
    (JSON.parse(readFileSync(join(DATA, "entry-requirements.json"), "utf8")) as Array<Record<string, any>>).map((r) => [
      entryRowId(r as { nationality: string; destination: string }),
      entryRowFields(r as { documentsNeeded: string[]; notes?: string }),
    ]),
  ),
};

const dir = join(DATA, "i18n");
for (const locale of readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory())) {
  if (only && locale !== only) continue;
  for (const name of readdirSync(join(dir, locale))) {
    const source = english[name];
    if (!source) continue;
    const file = join(dir, locale, name);
    const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{ id: string; sourceHash: string }>;
    let stamped = 0;
    for (const row of rows) {
      if (row.sourceHash !== "pending") continue;
      const fields = source.get(row.id);
      if (!fields) throw new Error(`${locale}/${name}: ${row.id} isn't an English row`);
      row.sourceHash = translationSourceHash(fields);
      stamped++;
    }
    if (stamped > 0) {
      writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
      console.log(`${locale}/${name}: stamped ${stamped} translation(s)`);
    }
  }
}
