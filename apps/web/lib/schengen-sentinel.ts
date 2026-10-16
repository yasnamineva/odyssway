/** Sentinel destination value for "the Schengen Area as a whole" in the
 * trip-check pickers. Its own module so client components can use it
 * without importing lib/trip-check (and with it the whole data corpus). */
export const SCHENGEN_DESTINATION = "SCHENGEN";

/** Symbolic member state used to place the map marker when "Schengen Area, unspecified" is picked. */
export const SCHENGEN_REPRESENTATIVE_CODE = "BE";

/** Always a real, mappable alpha-2 code for the destination picker's value. */
export function resolveMapDestinationCode(destination: string): string {
  const dest = destination.toUpperCase();
  return dest === SCHENGEN_DESTINATION ? SCHENGEN_REPRESENTATIVE_CODE : dest;
}
