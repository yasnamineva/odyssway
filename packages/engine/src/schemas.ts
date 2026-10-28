import { z } from "zod";
import { isValidISODate } from "./date";

/**
 * Zod schemas for every /data file (AGENTS.md §5). scripts/validate-data.ts
 * runs these in CI and fails the build on violations or on unverified data in
 * production (Accuracy Policy §3).
 */

export const isoDateSchema = z
  .string()
  .refine(isValidISODate, "must be a valid YYYY-MM-DD calendar date");

export const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}$/, "must be an ISO 3166-1 alpha-2 code");

export const legalSourceSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
});

export const verificationStatusSchema = z.enum(["verified", "needs_verification"]);

/**
 * Shared verification envelope. "verified" = the value was checked against the
 * cited primary official source on `verified_at` by `verified_by` (a human
 * identifier or an agent identifier like "agent:claude"). Accuracy Policy §3.
 */
const verificationFields = {
  legal_source: legalSourceSchema,
  verified_at: isoDateSchema.nullable(),
  verified_by: z.string().min(1).nullable(),
  status: verificationStatusSchema,
};

/** `status: "verified"` requires a real verified_at + verified_by. */
function requireVerifierWhenVerified(
  rec: { status: string; verified_at: string | null; verified_by: string | null },
  ctx: z.RefinementCtx,
): void {
  if (rec.status === "verified" && (rec.verified_at === null || rec.verified_by === null)) {
    ctx.addIssue({
      code: "custom",
      message: 'status "verified" requires non-null verified_at and verified_by',
    });
  }
}

// --- §5.1 data/countries.json ---
export const countryRecordSchema = z.object({
  code: countryCodeSchema,
  name: z.string().min(1),
  schengenMember: z.boolean(),
  schengenSince: isoDateSchema.optional(),
  euMember: z.boolean(),
  etiasRequired: z.boolean(),
  notes: z.string().optional(),
});

/** File-level envelope so the whole dataset carries one source + verification stamp. */
export const countriesFileSchema = z
  .object({
    ...verificationFields,
    countries: z.array(countryRecordSchema).min(1),
  })
  .superRefine(requireVerifierWhenVerified);

// --- §5.2 data/nationality-rules.json ---
export const nationalityRuleSchema = z
  .object({
    nationality: countryCodeSchema,
    name: z.string().min(1),
    /** Adjective used in copy: "ETIAS for {citizenLabel} citizens". */
    citizenLabel: z.string().min(1),
    visaExempt: z.boolean(),
    etiasApplicable: z.boolean(),
    schengenVisaRequired: z.boolean(),
    /** EU citizen: free movement (Directive 2004/38/EC) within the EU and the
     * Schengen Area, so the third-country flags above are all false — the
     * row's legal_source is the free-movement rule, not Annex II. */
    euCitizen: z.boolean().optional(),
    /** Conditions/caveats from Annex II footnotes (e.g. biometric passports only). */
    notes: z.string().optional(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const nationalityRulesFileSchema = z.array(nationalityRuleSchema);

// --- §5.3 data/bilateral-agreements.json ---
export const bilateralAgreementSchema = z
  .object({
    id: z.string().min(1),
    nationality: countryCodeSchema,
    schengenState: countryCodeSchema,
    effect: z.enum(["additional_90_days_after_schengen_allowance", "other"]),
    conditions: z.array(z.string()),
    howToInvoke: z.string(),
    caveats: z.array(z.string()),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const bilateralAgreementsFileSchema = z.array(bilateralAgreementSchema);

// --- §5.4 data/overstay-penalties.json ---
export const overstayPenaltySchema = z
  .object({
    country: countryCodeSchema,
    fineRange: z.string().min(1),
    banRange: z.string().min(1),
    enforcementNotes: z.string(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const overstayPenaltiesFileSchema = z.array(overstayPenaltySchema);

// --- §5.5 data/ees.json ---
export const eesRecordSchema = z
  .object({
    country: countryCodeSchema,
    authority: z.string().min(1),
    /** Short display name of the authority to write to (from `authority`). */
    contactName: z.string().min(1).optional(),
    /** Its email, only when `contactChannel` publishes one for corrections. */
    contactEmail: z.email().optional(),
    contactChannel: z.string().min(1),
    formUrl: z.url().optional(),
    expectedTimeline: z.string().optional(),
    appealPath: z.string().optional(),
    languageRequirements: z.string().optional(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified)
  .refine((r) => !r.contactEmail || r.contactChannel.includes(r.contactEmail), {
    message: "contactEmail must appear in the verified contactChannel text",
    path: ["contactEmail"],
  });
export const eesFileSchema = z.array(eesRecordSchema);

// --- §5.6 data/etias.json ---
export const etiasFileSchema = z
  .object({
    launchStatus: z.enum(["announced", "live", "grace_period"]),
    feeEUR: z.number().nonnegative().nullable(),
    validityYears: z.number().positive().nullable(),
    exemptions: z.array(z.string()),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);

// --- §5.7 data/eu-items.json: SUPERSEDED by §5.11 data/customs-items.json
// (destination-keyed rather than hardcoded to the EU) — never built, schema
// intentionally removed. See AGENTS.md §5.

// --- §5.9 data/destinations.json (non-Schengen destinations only — Schengen
// members already live in countries.json, never duplicated here) ---
export const destinationRecordSchema = z
  .object({
    code: countryCodeSchema,
    name: z.string().min(1),
    region: z.string().min(1),
    /** Official government authority page — the "not yet covered" fallback link. */
    officialAuthorityUrl: z.url(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const destinationsFileSchema = z.array(destinationRecordSchema);

// --- StayPolicy (packages/engine/src/stay-policy.ts) as data ---
export const stayPolicySchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("rolling_window"),
      windowDays: z.number().int().positive(),
      maxDays: z.number().int().positive(),
      /** Only when the source also caps each single stay below the window total. */
      maxDaysPerEntry: z.number().int().positive().optional(),
    })
    .refine((p) => p.maxDaysPerEntry === undefined || p.maxDaysPerEntry < p.maxDays, {
      message: "maxDaysPerEntry must be below maxDays (otherwise leave it out)",
      path: ["maxDaysPerEntry"],
    }),
  z.object({ kind: z.literal("fixed_per_entry"), maxDays: z.number().int().positive() }),
  z.object({ kind: z.literal("visa_required") }),
]);

// --- Passport validity (packages/engine/src/passport-validity.ts) as data ---
// Structured restatement of a row's own documentsNeeded wording; only set when that
// wording names the reference date (arrival/entry or departure/end of stay).
export const passportValiditySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("min_period"),
    amount: z.number().int().positive(),
    unit: z.enum(["months", "days"]),
    from: z.enum(["arrival", "departure"]),
  }),
  z.object({ kind: z.literal("whole_stay") }),
]);

// --- Timed steps (packages/engine/src/timed-step.ts) as data ---
// Structured restatement of a documentsNeeded line tied to the arrival date.
export const timedStepSchema = z.object({
  line: z.string().min(1),
  window: z.object({
    kind: z.enum(["opens_before_arrival", "due_before_arrival", "due_after_arrival"]),
    amount: z.number().int().positive(),
    unit: z.enum(["hours", "days"]),
  }),
});

// --- §5.10 data/entry-requirements.json (nationality × non-Schengen destination) ---
export const entryRequirementSchema = z
  .object({
    nationality: countryCodeSchema,
    destination: countryCodeSchema,
    requirement: z.enum(["visa_free", "eta_required", "visa_required", "visa_on_arrival"]),
    stayPolicy: stayPolicySchema,
    documentsNeeded: z.array(z.string().min(1)).min(1),
    passportValidity: passportValiditySchema.optional(),
    timedSteps: z.array(timedStepSchema).min(1).optional(),
    notes: z.string().optional(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const entryRequirementsFileSchema = z.array(entryRequirementSchema);

// --- §5.11 data/customs-items.json (destination × item category) ---
export const customsItemCategorySchema = z.enum([
  "alcohol",
  "tobacco",
  "cash",
  "medication",
  "cbd_cannabis",
  "food_animal",
  "food_plant",
  "e_cigarettes",
  "weapons",
  "drones",
  "other",
]);

/**
 * How to get the permit or approval a row's verdict depends on (form,
 * authority, lead time, documents, steps). Carries its own sources and check
 * date, because it is often verified from a different official page than the
 * row's verdict, and on a different day.
 */
export const customsProcedureSchema = z.object({
  title: z.string().min(1),
  authority: z.string().min(1),
  applyUrl: z.url().optional(),
  leadTime: z.string().min(1).optional(),
  /** Structured restatement of `leadTime`, only when it names an amount and a reference date. */
  leadTimeRule: z
    .object({
      amount: z.number().int().positive(),
      unit: z.enum(["days", "weeks", "months", "working_days"]),
      before: z.enum(["travel", "arrival"]),
    })
    .optional(),
  processingTime: z.string().min(1).optional(),
  fee: z.string().min(1).optional(),
  documents: z.array(z.string().min(1)).min(1).optional(),
  steps: z.array(z.string().min(1)).min(2),
  atTheBorder: z.string().min(1).optional(),
  /** True when not every traveller needs this permit (optional, or only above a quantity). */
  optional: z.boolean().optional(),
  sources: z.array(legalSourceSchema).min(1),
  verified_at: isoDateSchema,
  verified_by: z.string().min(1),
});

/**
 * What the row's rule means for someone only changing planes in that country —
 * only ever set when the authority states it (GROWTH_AND_ROADMAP.md §1.5).
 * `applies`: the rule binds transit passengers too; `exempt_airside`: it doesn't
 * if you stay airside and don't clear immigration.
 */
export const customsTransitSchema = z.object({
  rule: z.enum(["applies", "exempt_airside"]),
  description: z.string().min(1),
  source: legalSourceSchema,
  verified_at: isoDateSchema,
});

/**
 * What the destination's rule says a doctor's letter or prescription must contain.
 * Each item restates the cited source; only set when the source lists it
 * (GROWTH_AND_ROADMAP.md §2.8, doctor's letter checklist).
 */
export const customsLetterSchema = z.object({
  items: z.array(z.string().min(1)).min(1),
  source: legalSourceSchema,
  verified_at: isoDateSchema,
});

export const customsItemSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    names: z.array(z.string().min(1)).min(1),
    destination: countryCodeSchema,
    category: customsItemCategorySchema,
    verdict: z.enum([
      "prohibited",
      "allowed_with_limits",
      "allowed",
      "declaration_required",
      "depends",
    ]),
    limits: z
      .object({ description: z.string().min(1), quantity: z.string().optional() })
      .optional(),
    notes: z.string().optional(),
    /** One-line restatement of the row for search snippets and hub lists — never a new claim. */
    summary: z.string().min(20).max(170).optional(),
    procedure: customsProcedureSchema.optional(),
    transit: customsTransitSchema.optional(),
    letter: customsLetterSchema.optional(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const customsItemsFileSchema = z.array(customsItemSchema);

// --- Engine input schemas (useful for validating URL-shared calculator state) ---
export const basisSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("visa_free") }),
  z.object({ kind: z.literal("c_visa") }),
  z.object({
    kind: z.literal("d_visa_or_permit"),
    issuingCountry: countryCodeSchema,
  }),
  z.object({ kind: z.literal("bilateral"), agreementId: z.string().min(1) }),
]);

export const tripSchema = z.object({
  entry: isoDateSchema,
  exit: isoDateSchema,
  country: z.string().regex(/^[A-Z]{2}$/),
  basis: basisSchema,
});
