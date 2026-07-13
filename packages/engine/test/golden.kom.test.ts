import { describe, expect, it } from "vitest";
import { maxStay, planTrip, status } from "../src/engine";
import { trip } from "./helpers";
import kom from "./fixtures/kom-cases.json";

/**
 * Golden tests (AGENTS.md §6.6): the worked examples from the European
 * Commission's official short-stay calculator user manual. The engine must
 * match the official calculator on every one of them.
 * Source: see fixtures/kom-cases.json _provenance.
 */

describe("KOM example 1 — visa-exempt traveller", () => {
  const tripList = kom.example1.trips.map((t) => trip(t.entry, t.exit));

  for (const c of kom.example1.statusCases) {
    it(`${c.id}: status on ${c.onDate}`, () => {
      const result = status(tripList, c.onDate);
      expect(result.windowStart).toBe(c.expected.windowStart);
      expect(result.daysUsed).toBe(c.expected.daysUsed);
      expect(result.overstayDays).toBe(c.expected.overstayDays);
    });
  }

  it(`${kom.example1.planCase.id}: staying 1 Jun - 20 Sep 2024 overstays from 30 Aug`, () => {
    const c = kom.example1.planCase;
    const prior = c.priorTrips.map((t) => trip(t.entry, t.exit));
    const result = planTrip(prior, c.plannedEntry, c.plannedExit);
    expect(result.compliant).toBe(c.expected.compliant);
    expect(result.firstViolationDay).toBe(c.expected.firstViolationDay);
    expect(result.latestSafeExit).toBe(c.expected.latestSafeExit);
  });
});

describe("KOM example 2 — visa holder planning re-entry", () => {
  const tripList = kom.example2.trips.map((t) => trip(t.entry, t.exit));

  for (const c of kom.example2.maxStayCases) {
    it(`${c.id}: max stay entering ${c.entry} is ${c.expected.maxDays} days`, () => {
      const result = maxStay(tripList, c.entry);
      expect(result.maxDays).toBe(c.expected.maxDays);
      expect(result.lastAllowedDay).toBe(c.expected.lastAllowedDay);
    });
  }
});
