import { describe, expect, it } from "vitest";
import { addDays, fromEpochDay, toEpochDay } from "../src/date";
import { status } from "../src/engine";
import type { Trip } from "../src/types";
import { trip } from "./helpers";

/**
 * Property test (AGENTS.md §6.6): removing a day of presence never decreases
 * `remaining`. Deterministic seeded PRNG so failures are reproducible.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE = toEpochDay("2024-06-01");

function randomTrips(rand: () => number): Trip[] {
  const count = 1 + Math.floor(rand() * 5);
  const result: Trip[] = [];
  for (let i = 0; i < count; i++) {
    const start = BASE + Math.floor(rand() * 400) - 200;
    const length = Math.floor(rand() * 60);
    result.push(trip(fromEpochDay(start), fromEpochDay(start + length)));
  }
  return result;
}

/** Remove one presence day from a trip list by shrinking or splitting a trip. */
function removeOneDay(tripList: Trip[], rand: () => number): Trip[] {
  const idx = Math.floor(rand() * tripList.length);
  const victim = tripList[idx]!;
  const start = toEpochDay(victim.entry);
  const end = toEpochDay(victim.exit);
  const removed = start + Math.floor(rand() * (end - start + 1));
  const rest = tripList.filter((_, i) => i !== idx);
  if (removed > start) {
    rest.push(trip(victim.entry, fromEpochDay(removed - 1)));
  }
  if (removed < end) {
    rest.push(trip(fromEpochDay(removed + 1), victim.exit));
  }
  return rest;
}

describe("property: removing a presence day never decreases remaining", () => {
  it("holds over 300 random trip configurations", () => {
    const rand = mulberry32(0xb0bde5);
    for (let run = 0; run < 300; run++) {
      const tripList = randomTrips(rand);
      const smaller = removeOneDay(tripList, rand);
      const onDate = addDays("2024-06-01", Math.floor(rand() * 500) - 250);
      const before = status(tripList, onDate);
      const after = status(smaller, onDate);
      expect(
        after.daysRemaining,
        `run ${run}: onDate=${onDate} trips=${JSON.stringify(tripList)}`,
      ).toBeGreaterThanOrEqual(before.daysRemaining);
      expect(after.daysUsed).toBeLessThanOrEqual(before.daysUsed);
    }
  });
});
