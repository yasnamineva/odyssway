import { describe, expect, it } from "vitest";
import { planMedications } from "./medication-planner";
import { resolveTripCheck } from "./trip-check";

describe("planMedications", () => {
  it("dates each permit from its own lead time and reference date, earliest first", () => {
    const r = planMedications(
      {
        nationality: "US",
        leaveHome: "2026-12-09",
        stops: [
          { destination: "TH", arrival: "2026-12-20" },
          { destination: "SG", arrival: "2026-12-10" },
        ],
        medicines: ["xanax"],
      },
      "2026-11-01",
      resolveTripCheck,
    );
    const th = r.stops.find((s) => s.destination === "TH")?.medicines[0];
    const sg = r.stops.find((s) => s.destination === "SG")?.medicines[0];
    expect(th?.match?.slug).toBe("controlled-medication-th");
    expect(sg?.match?.slug).toBe("controlled-medication-sg");
    // Thailand: 15 days before you travel (leave home 9 Dec). Singapore: 2 weeks before you arrive (10 Dec).
    expect(th?.applyBy).toBe("2026-11-24");
    expect(sg?.applyBy).toBe("2026-11-26");
    expect(r.deadlines.map((d) => d.applyBy)).toEqual(["2026-11-24", "2026-11-26"]);
    expect(r.deadlines.every((d) => d.status === "ok")).toBe(true);
  });

  it("flags deadlines that have passed or are close", () => {
    const r = planMedications(
      { nationality: "US", leaveHome: "", stops: [{ destination: "TH", arrival: "2026-11-20" }], medicines: ["xanax"] },
      "2026-11-10",
      resolveTripCheck,
    );
    // No leave-home date: the first arrival is used, so 15 days before 20 Nov is 5 Nov — already passed.
    expect(r.deadlines[0]?.applyBy).toBe("2026-11-05");
    expect(r.deadlines[0]?.status).toBe("passed");
  });

  it("returns nothing until there is a passport, a medicine and a dated stop", () => {
    expect(planMedications({ nationality: "US", leaveHome: "", stops: [{ destination: "TH", arrival: "" }], medicines: ["x"] }, "2026-11-10", resolveTripCheck).stops).toEqual([]);
  });
});
