import { describe, expect, it } from "vitest";
import { engineContext, schengenCountries } from "./countries";
import { countDays } from "./day-counter";
import { resolveTripCheck } from "./trip-check";

const schengen = new Set(schengenCountries.map((c) => c.code));
const resolve = (n: string, d: string) => resolveTripCheck(n, d, []);

describe("countDays", () => {
  it("pools Schengen trips through the 90/180 engine and checks other countries by their own rule", () => {
    const out = countDays(
      "US",
      [
        { destination: "FR", entry: "2026-01-01", exit: "2026-02-28" },
        { destination: "IT", entry: "2026-03-10", exit: "2026-04-20" },
        { destination: "GB", entry: "2026-05-01", exit: "2026-11-16" },
        { destination: "CN", entry: "2026-12-01", exit: "2026-12-10" },
      ],
      "2026-04-20",
      resolve,
      schengen,
      engineContext,
    );
    const sch = out.find((o) => o.kind === "schengen");
    expect(sch && sch.kind === "schengen" && sch.compliant).toBe(false);
    expect(sch && sch.kind === "schengen" && sch.daysUsedOnDate).toBe(101);

    const gb = out.find((o) => o.kind === "policy" && o.destination === "GB");
    expect(gb && gb.kind === "policy" && gb.policy.kind).toBe("fixed_per_entry");
    expect(gb && gb.kind === "policy" && gb.result.stays[0]?.days).toBe(200);
    expect(gb && gb.kind === "policy" && gb.result.compliant).toBe(false);

    const cn = out.find((o) => o.kind !== "schengen" && o.destination === "CN");
    expect(cn?.kind).toBe("no_count");
  });

  it("ignores rows with missing or reversed dates", () => {
    const out = countDays("US", [{ destination: "JP", entry: "2026-02-10", exit: "2026-02-01" }], "2026-02-10", resolve, schengen, engineContext);
    expect(out).toHaveLength(0);
  });
});
