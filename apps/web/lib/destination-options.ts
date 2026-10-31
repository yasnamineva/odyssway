export interface Place {
  code: string;
  name: string;
}

export interface OptionGroup {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * One alphabetical "going to" list for every picker: covered destinations and
 * each Schengen country side by side (marked "(Schengen)"), then the destinations
 * still being researched. Readers pick a real country; the old unspecified
 * "Schengen Area" choice is gone from the pickers (the sentinel still resolves
 * in shared links).
 */
export function destinationOptionGroups({
  destinations,
  schengenStates,
  comingSoon = [],
  exclude,
  labels,
}: {
  destinations: Place[];
  schengenStates: Place[];
  comingSoon?: Place[];
  /** A code to leave out, e.g. the traveller's own nationality. */
  exclude?: string;
  labels: { destinations: string; schengenSuffix: string; comingSoon: string; comingSoonSuffix: string };
}): OptionGroup[] {
  const covered = [
    ...destinations.map((d) => ({ value: d.code, label: d.name })),
    ...schengenStates.map((c) => ({ value: c.code, label: `${c.name} ${labels.schengenSuffix}` })),
  ]
    .filter((o) => o.value !== exclude)
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
  const groups: OptionGroup[] = [{ label: labels.destinations, options: covered }];
  const soon = comingSoon
    .filter((d) => d.code !== exclude)
    .map((d) => ({ value: d.code, label: `${d.name} ${labels.comingSoonSuffix}` }));
  if (soon.length) groups.push({ label: labels.comingSoon, options: soon });
  return groups;
}
