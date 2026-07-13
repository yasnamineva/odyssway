import { schemas } from "@borderline/engine";
import rawEtiasFile from "../../../data/etias.json";

export interface SourceNote {
  claim: string;
  name: string;
  url: string;
  checked: string;
}

/** Schema-validated at module load: a bad data edit fails the build. */
export const etias = schemas.etiasFileSchema.parse(rawEtiasFile);

/** Per-claim citations (informational keys, not part of the Zod schema). */
export const etiasSources: SourceNote[] = (
  rawEtiasFile as { _sources?: SourceNote[] }
)._sources ?? [];
