import { describe, expect, it } from "vitest";
import { decodeShareState, encodeShareState, type ShareState } from "./share";

const KNOWN = new Set(["FR", "IE", "BG", "ES"]);

describe("encodeShareState / decodeShareState", () => {
  it("round-trips full state including countries and permit flags", () => {
    const state: ShareState = {
      trips: [
        { entry: "2026-01-01", exit: "2026-01-10", country: "", permit: false },
        { entry: "2026-02-01", exit: "2026-02-20", country: "FR", permit: false },
        { entry: "2026-03-01", exit: "2026-05-30", country: "ES", permit: true },
      ],
      refDate: "2026-06-01",
      planEntry: "2026-08-01",
      planExit: "2026-08-15",
    };
    const decoded = decodeShareState(`?${encodeShareState(state)}`, KNOWN);
    expect(decoded.trips).toEqual(state.trips);
    expect(decoded.refDate).toBe("2026-06-01");
    expect(decoded.planEntry).toBe("2026-08-01");
    expect(decoded.planExit).toBe("2026-08-15");
  });

  it("decodes legacy links without country segments", () => {
    const decoded = decodeShareState("?t=2026-01-01.2026-01-10&d=2026-06-01", KNOWN);
    expect(decoded.trips).toEqual([
      { entry: "2026-01-01", exit: "2026-01-10", country: "", permit: false },
    ]);
  });

  it("drops trips with malformed or nonexistent dates", () => {
    const decoded = decodeShareState(
      "?t=2026-01-01.2026-01-10~2026-02-30.2026-03-01~garbage&d=2026-06-01",
      KNOWN,
    );
    expect(decoded.trips).toHaveLength(1);
  });

  it("ignores unknown country codes but keeps the trip", () => {
    const decoded = decodeShareState("?t=2026-01-01.2026-01-10.QQ&d=2026-06-01", KNOWN);
    expect(decoded.trips).toEqual([
      { entry: "2026-01-01", exit: "2026-01-10", country: "", permit: false },
    ]);
  });

  it("never sets a permit flag without a valid country", () => {
    const decoded = decodeShareState("?t=2026-01-01.2026-01-10.QQ.p&d=2026-06-01", KNOWN);
    expect(decoded.trips?.[0]?.permit).toBe(false);
  });

  it("rejects invalid reference/plan dates instead of propagating them", () => {
    const decoded = decodeShareState("?d=2026-13-01&pe=nope&px=2026-08-15", KNOWN);
    expect(decoded.refDate).toBeNull();
    expect(decoded.planEntry).toBeNull();
    expect(decoded.planExit).toBe("2026-08-15");
  });

  it("omits empty trips and plan fields from the encoded string", () => {
    const query = encodeShareState({
      trips: [],
      refDate: "2026-06-01",
      planEntry: "",
      planExit: "",
    });
    expect(query).toBe("d=2026-06-01");
  });
});
