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
    visaExempt: z.boolean(),
    etiasApplicable: z.boolean(),
    schengenVisaRequired: z.boolean(),
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
    contactChannel: z.string().min(1),
    formUrl: z.url().optional(),
    expectedTimeline: z.string().optional(),
    appealPath: z.string().optional(),
    languageRequirements: z.string().optional(),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
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

// --- §5.7 data/eu-items.json ---
export const euItemSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    names: z.array(z.string().min(1)).min(1),
    category: z.enum([
      "food_animal_origin",
      "food_plant",
      "cash",
      "alcohol",
      "tobacco",
      "medication",
      "pets",
      "other",
    ]),
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
    exceptions: z.array(z.string()).optional(),
    appliesTo: z.literal("entering_EU_from_non_EU"),
    ...verificationFields,
  })
  .superRefine(requireVerifierWhenVerified);
export const euItemsFileSchema = z.array(euItemSchema);

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
