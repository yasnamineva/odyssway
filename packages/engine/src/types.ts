import type { ISODate } from "./date";

/** ISO 3166-1 alpha-2, plus the reserved user-assigned code "ZZ" meaning
 * "Schengen Area, country unspecified" — always treated as a current Schengen
 * member (no accession date). Any other code not present in a supplied
 * countries dataset fails loudly. */
export type CountryCode = string;

export type Basis =
  | { kind: "visa_free" }
  | { kind: "c_visa" }
  | { kind: "d_visa_or_permit"; issuingCountry: CountryCode }
  | { kind: "bilateral"; agreementId: string };

export interface Trip {
  entry: ISODate;
  exit: ISODate;
  country: CountryCode;
  basis: Basis;
}

/** Matches data/countries.json records (see schemas.ts / AGENTS.md §5.1). */
export interface CountryRecord {
  code: CountryCode;
  name: string;
  schengenMember: boolean;
  /** ISO date of Schengen accession — consulted per-date for historic trips. */
  schengenSince?: string;
  euMember: boolean;
  etiasRequired: boolean;
  notes?: string;
}

/** Matches data/bilateral-agreements.json records (see schemas.ts / AGENTS.md §5.3). */
export interface BilateralAgreementRecord {
  id: string;
  nationality: CountryCode;
  schengenState: CountryCode;
  effect: "additional_90_days_after_schengen_allowance" | "other";
  conditions: string[];
  howToInvoke: string;
  caveats: string[];
  legal_source: { name: string; url: string };
  verified_at: string | null;
  verified_by: string | null;
  status: "verified" | "needs_verification";
}

/**
 * Verified rule data the engine consults. Callers pass only production
 * (verified) data. When `countries` is omitted, every trip is assumed to be a
 * Schengen-area short stay — the caller's contract is then to pass only
 * Schengen trips (the official EC calculator has the same contract).
 */
export interface EngineContext {
  countries?: CountryRecord[];
  bilateralAgreements?: BilateralAgreementRecord[];
}

export type ExclusionReason =
  | "residence_permit_issuing_state"
  | "bilateral_agreement"
  | "non_schengen_country"
  | "pre_accession_days";

/** Transparency record: why days of a trip were not counted (UIs must explain this). */
export interface TripExclusion {
  trip: Trip;
  reason: ExclusionReason;
  daysExcluded: number;
}

export interface PresenceResult {
  /** Epoch days on which the traveller consumes 90/180 allowance. */
  presence: Set<number>;
  exclusions: TripExclusion[];
}

export interface StatusResult {
  onDate: ISODate;
  /** Start of the rolling window: onDate − 179 (window is inclusive on both ends). */
  windowStart: ISODate;
  daysUsed: number;
  daysRemaining: number;
  /** Days beyond 90 inside the window ending on onDate (0 when compliant). */
  overstayDays: number;
  presentOnDate: boolean;
  /** Earliest date ≥ onDate on which a 1-day stay would be compliant. */
  nextSafeEntry: ISODate;
  exclusions: TripExclusion[];
}

export interface PlanTripResult {
  entry: ISODate;
  exit: ISODate;
  tripLengthDays: number;
  compliant: boolean;
  /** First day of the planned trip that breaks the 90/180 rule (the user's actionable info). */
  firstViolationDay: ISODate | null;
  /** Last compliant day of a stay starting on `entry`; null if even the entry day is not compliant. */
  latestSafeExit: ISODate | null;
  /** Days used in the window ending on the planned exit day, planned trip included. */
  daysUsedOnExit: number;
  daysRemainingAfterTrip: number;
}

export interface MaxStayResult {
  entry: ISODate;
  /** Longest compliant consecutive stay starting on `entry` (0 = entering that day is not compliant). */
  maxDays: number;
  /** Forced exit date (last allowed day of the stay); null when maxDays is 0. */
  lastAllowedDay: ISODate | null;
}

export interface NextEntryResult {
  desiredStay: number;
  /** Earliest entry date ≥ `from` allowing `desiredStay` consecutive compliant days. */
  earliestEntry: ISODate;
  lastAllowedDay: ISODate;
}
