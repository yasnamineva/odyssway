import { describe, expect, it } from "vitest";
import { toEpochDay } from "../src/date";
import { CannotComputeError, InvalidTripError } from "../src/errors";
import { buildPresence } from "../src/presence";
import type {
  BilateralAgreementRecord,
  CountryRecord,
  Trip,
} from "../src/types";
import { trip, trips } from "./helpers";

/** Fictional test countries — real-world membership data lives in /data and is human-verified. */
const testCountries: CountryRecord[] = [
  { code: "SA", name: "Schengenland A", schengenMember: true, euMember: true, etiasRequired: true },
  { code: "SB", name: "Schengenland B", schengenMember: true, euMember: true, etiasRequired: true },
  {
    code: "NA",
    name: "New Accessionland",
    schengenMember: true,
    schengenSince: "2025-01-01",
    euMember: true,
    etiasRequired: true,
  },
  { code: "XO", name: "Outsideland", schengenMember: false, euMember: false, etiasRequired: false },
];

const verifiedAgreement: BilateralAgreementRecord = {
  id: "test-nz-sa",
  nationality: "NZ",
  schengenState: "SA",
  effect: "additional_90_days_after_schengen_allowance",
  conditions: [],
  howToInvoke: "test fixture",
  caveats: [],
  legal_source: { name: "test", url: "https://example.org/test" },
  verified_at: "2026-01-01",
  verified_by: "test-human",
  status: "verified",
};

describe("buildPresence — basics", () => {
  it("counts entry and exit days inclusively", () => {
    const { presence } = buildPresence(trips(["2024-06-01", "2024-06-10"]));
    expect(presence.size).toBe(10);
    expect(presence.has(toEpochDay("2024-06-01"))).toBe(true);
    expect(presence.has(toEpochDay("2024-06-10"))).toBe(true);
    expect(presence.has(toEpochDay("2024-06-11"))).toBe(false);
  });

  it("counts a same-day entry/exit as one day", () => {
    const { presence } = buildPresence(trips(["2024-01-01", "2024-01-01"]));
    expect(presence.size).toBe(1);
  });

  it("merges overlapping trips — a day counts once", () => {
    const { presence } = buildPresence(
      trips(["2024-06-01", "2024-06-10"], ["2024-06-05", "2024-06-15"]),
    );
    expect(presence.size).toBe(15);
  });

  it("rejects trips with entry after exit", () => {
    expect(() => buildPresence(trips(["2024-06-10", "2024-06-01"]))).toThrow(
      InvalidTripError,
    );
  });
});

describe("buildPresence — residence permit / D visa (§6.4.1)", () => {
  it("excludes days in the issuing state", () => {
    const t: Trip = {
      entry: "2024-06-01",
      exit: "2024-06-30",
      country: "SA",
      basis: { kind: "d_visa_or_permit", issuingCountry: "SA" },
    };
    const { presence, exclusions } = buildPresence([t], { countries: testCountries });
    expect(presence.size).toBe(0);
    expect(exclusions).toEqual([
      { trip: t, reason: "residence_permit_issuing_state", daysExcluded: 30 },
    ]);
  });

  it("counts days a permit holder spends in OTHER Schengen states", () => {
    const t: Trip = {
      entry: "2024-06-01",
      exit: "2024-06-10",
      country: "SB",
      basis: { kind: "d_visa_or_permit", issuingCountry: "SA" },
    };
    const { presence, exclusions } = buildPresence([t], { countries: testCountries });
    expect(presence.size).toBe(10);
    expect(exclusions).toEqual([]);
  });
});

describe("buildPresence — bilateral agreements (§6.4.3)", () => {
  const bilateralTrip: Trip = {
    entry: "2024-09-01",
    exit: "2024-09-30",
    country: "SA",
    basis: { kind: "bilateral", agreementId: "test-nz-sa" },
  };

  it("excludes verified bilateral-agreement stays from the 90/180 count", () => {
    const { presence, exclusions } = buildPresence([bilateralTrip], {
      countries: testCountries,
      bilateralAgreements: [verifiedAgreement],
    });
    expect(presence.size).toBe(0);
    expect(exclusions[0]?.reason).toBe("bilateral_agreement");
  });

  it("refuses to compute when the agreement is missing", () => {
    expect(() => buildPresence([bilateralTrip])).toThrow(CannotComputeError);
    expect(() => buildPresence([bilateralTrip])).toThrow(/can't compute/);
  });

  it("refuses to compute when the agreement is not verified", () => {
    const unverified = { ...verifiedAgreement, status: "needs_verification" as const };
    expect(() =>
      buildPresence([bilateralTrip], { bilateralAgreements: [unverified] }),
    ).toThrow(CannotComputeError);
  });

  it("refuses to compute when the trip is in a different state than the agreement", () => {
    const wrongState: Trip = { ...bilateralTrip, country: "SB" };
    expect(() =>
      buildPresence([wrongState], { bilateralAgreements: [verifiedAgreement] }),
    ).toThrow(CannotComputeError);
  });
});

describe("buildPresence — country membership (§6.4.4, §6.4.5)", () => {
  it("never counts days in non-Schengen countries", () => {
    const { presence, exclusions } = buildPresence(
      [{ entry: "2024-06-01", exit: "2024-06-10", country: "XO", basis: { kind: "visa_free" } }],
      { countries: testCountries },
    );
    expect(presence.size).toBe(0);
    expect(exclusions[0]?.reason).toBe("non_schengen_country");
  });

  it("fails loudly on unknown country codes instead of guessing", () => {
    expect(() =>
      buildPresence(
        [{ entry: "2024-06-01", exit: "2024-06-10", country: "QQ", basis: { kind: "visa_free" } }],
        { countries: testCountries },
      ),
    ).toThrow(CannotComputeError);
  });

  it("resolves membership per-date across an accession boundary", () => {
    const straddling: Trip = {
      entry: "2024-12-25",
      exit: "2025-01-05",
      country: "NA", // joins Schengen 2025-01-01 in the fixture
      basis: { kind: "visa_free" },
    };
    const { presence, exclusions } = buildPresence([straddling], {
      countries: testCountries,
    });
    expect(presence.size).toBe(5); // only 1-5 Jan 2025 count
    expect(presence.has(toEpochDay("2024-12-31"))).toBe(false);
    expect(presence.has(toEpochDay("2025-01-01"))).toBe(true);
    expect(exclusions).toEqual([
      { trip: straddling, reason: "pre_accession_days", daysExcluded: 7 },
    ]);
  });

  it("counts everything when no countries dataset is provided (Schengen-only contract)", () => {
    const { presence } = buildPresence([trip("2024-06-01", "2024-06-10")]);
    expect(presence.size).toBe(10);
  });

  it('treats "ZZ" as an unspecified Schengen country even with a countries dataset', () => {
    const { presence, exclusions } = buildPresence(
      [{ entry: "2024-06-01", exit: "2024-06-10", country: "ZZ", basis: { kind: "visa_free" } }],
      { countries: testCountries },
    );
    expect(presence.size).toBe(10);
    expect(exclusions).toEqual([]);
  });
});
