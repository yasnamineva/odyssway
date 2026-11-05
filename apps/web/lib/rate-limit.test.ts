import { beforeEach, describe, expect, it } from "vitest";
import { bodySizeOk, resetBudgets, retryAfterSeconds, withinBudget } from "./rate-limit";

const budget = { limit: 3, windowMs: 60_000 };

describe("withinBudget", () => {
  beforeEach(() => resetBudgets());

  it("allows requests up to the limit, then refuses until the window ends", () => {
    const t = 1_000_000;
    expect([1, 2, 3].map(() => withinBudget("r", budget, t))).toEqual([true, true, true]);
    expect(withinBudget("r", budget, t + 10)).toBe(false);
    expect(retryAfterSeconds("r", budget, t + 10)).toBe(60);
    expect(withinBudget("r", budget, t + 60_000)).toBe(true);
  });

  it("keeps a separate budget per route", () => {
    const t = 5_000;
    for (let i = 0; i < 3; i++) withinBudget("a", budget, t);
    expect(withinBudget("a", budget, t)).toBe(false);
    expect(withinBudget("b", budget, t)).toBe(true);
  });
});

describe("bodySizeOk", () => {
  const req = (len?: string) =>
    new Request("https://x.test/api", { method: "POST", headers: len === undefined ? {} : { "content-length": len } });

  it("accepts small or undeclared bodies and refuses large or invalid ones", () => {
    expect(bodySizeOk(req("120"))).toBe(true);
    expect(bodySizeOk(req())).toBe(true);
    expect(bodySizeOk(req("5000"))).toBe(false);
    expect(bodySizeOk(req("abc"))).toBe(false);
  });
});
