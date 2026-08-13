import { schengenCountries } from "./countries";
import { destinations, queuedDestinations } from "./destinations";
import { SCHENGEN_DESTINATION } from "./trip-check";

/** Human-readable label for a trip-check destination code — real, queued, or the Schengen sentinel. */
export function destinationLabelFor(code: string): string | undefined {
  if (!code) return undefined;
  if (code === SCHENGEN_DESTINATION) return "Schengen Area";
  return (
    destinations.find((d) => d.code === code)?.name ??
    schengenCountries.find((c) => c.code === code)?.name ??
    queuedDestinations.find((d) => d.code === code)?.name
  );
}
