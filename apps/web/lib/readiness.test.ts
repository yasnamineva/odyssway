import { describe, expect, it } from "vitest";
import { planReadiness } from "./readiness";
import { resolveTripCheck } from "./trip-check";

describe("planReadiness", () => {
  it("dates India's ETA from its legal deadline and opens the e-Arrival card window 72 hours before", () => {
    const r = planReadiness(
      {
        travellers: [{ name: "Ana", nationality: "US", passportExpiry: "" }],
        stops: [{ destination: "IN", arrival: "2027-01-10", departure: "2027-01-20" }],
        leaveHome: "2027-01-09",
        bufferWeeks: 8,
      },
      "2026-11-01",
      resolveTripCheck,
    );
    const eta = r.actions.find((a) => a.kind === "authorisation");
    expect(eta?.legal).toEqual({ date: "2027-01-06", type: "due" });
    // 8 weeks before leaving home, which is earlier than the legal deadline.
    expect(eta?.recommended).toBe("2026-11-14");
    const card = r.actions.find((a) => a.kind === "form_window");
    expect(card?.legal).toEqual({ date: "2027-01-07", type: "opens" });
    expect(card?.hours).toBe(true);
    expect(r.actions.map((a) => a.kind)).toEqual(["authorisation", "form_window"]);
  });

  it("never recommends a date later than the legal deadline", () => {
    const r = planReadiness(
      {
        travellers: [{ name: "", nationality: "US", passportExpiry: "" }],
        stops: [{ destination: "IN", arrival: "2027-01-10", departure: "" }],
        leaveHome: "",
        bufferWeeks: 0,
      },
      "2026-11-01",
      resolveTripCheck,
    );
    const eta = r.actions.find((a) => a.kind === "authorisation");
    expect(eta?.recommended).toBe("2027-01-06");
    expect(eta?.traveller).toBe("#1");
  });

  it("gives an undated visa a recommended date only, and registration a date after arrival", () => {
    const r = planReadiness(
      {
        travellers: [{ name: "Ana", nationality: "US", passportExpiry: "" }],
        stops: [{ destination: "CN", arrival: "2027-03-01", departure: "2027-03-10" }],
        leaveHome: "2027-02-28",
        bufferWeeks: 4,
      },
      "2026-11-01",
      resolveTripCheck,
    );
    const visa = r.actions.find((a) => a.kind === "authorisation");
    expect(visa?.legal).toBeUndefined();
    expect(visa?.recommended).toBe("2027-01-31");
    expect(r.actions.find((a) => a.kind === "registration")?.legal).toEqual({ date: "2027-03-02", type: "due" });
  });

  it("checks each traveller's passport against each stop and flags a failing one", () => {
    const r = planReadiness(
      {
        travellers: [
          { name: "Ana", nationality: "GB", passportExpiry: "2027-05-01" },
          { name: "Ben", nationality: "GB", passportExpiry: "2030-01-01" },
        ],
        stops: [{ destination: "RS", arrival: "2027-03-01", departure: "2027-03-10" }],
        leaveHome: "",
        bufferWeeks: 8,
      },
      "2026-11-01",
      resolveTripCheck,
    );
    // Serbia: 90 days after departure (10 Mar 2027) is 8 Jun; Ana's passport ends 1 May.
    expect(r.travellers[0]?.stops[0]?.passport.kind).toBe("verdict");
    const passport = r.actions.filter((a) => a.kind === "passport");
    expect(passport.map((a) => a.traveller)).toEqual(["Ana"]);
    expect(r.actions.filter((a) => a.kind === "registration")).toHaveLength(2);
  });

  it("marks deadlines that passed, windows that are open, and actions due now", () => {
    const plan = (today: string) =>
      planReadiness(
        {
          travellers: [{ name: "", nationality: "US", passportExpiry: "" }],
          stops: [{ destination: "IN", arrival: "2027-01-10", departure: "" }],
          leaveHome: "",
          bufferWeeks: 8,
        },
        today,
        resolveTripCheck,
      ).actions;
    expect(plan("2027-01-08").map((a) => a.status)).toEqual(["passed", "now"]);
    expect(plan("2026-12-01").find((a) => a.kind === "authorisation")?.status).toBe("now");
    expect(plan("2026-11-10").find((a) => a.kind === "authorisation")?.status).toBe("soon");
  });

  it("returns nothing until a traveller and a dated stop are given", () => {
    const r = planReadiness({ travellers: [], stops: [], leaveHome: "", bufferWeeks: 8 }, "2026-11-01", resolveTripCheck);
    expect(r.actions).toEqual([]);
  });
});
