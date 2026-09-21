import { describe, expect, it } from "vitest";
import { COUNTRY_GEO_IDS } from "./country-geo-ids";
import { destinations } from "./destinations";
import { countryFeature, MICRO_STATE_COORDS } from "./world-map-data";

describe("coverage map geometry", () => {
  it("draws every verified destination — a polygon or a marker, never nothing", () => {
    const invisible = destinations
      .filter((d) => d.status === "verified")
      .filter((d) => !countryFeature(d.code) && !MICRO_STATE_COORDS[d.code])
      .map((d) => d.code);
    expect(invisible).toEqual([]);
  });

  it("maps each atlas id to exactly one country code", () => {
    const ids = Object.values(COUNTRY_GEO_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the codes that were previously mis-assigned or missing", () => {
    // ICU also names obsolete codes (YU/CS for Serbia, SU for Russia, TP for East
    // Timor) which once overwrote the real ones; CN/VN/ID/PH/SA were never mapped.
    const expected: Record<string, string> = {
      RS: "688", RU: "643", TL: "626", CN: "156", VN: "704", ID: "360", PH: "608", SA: "682", FR: "250", GB: "826",
    };
    for (const [code, id] of Object.entries(expected)) expect(COUNTRY_GEO_IDS[code]).toBe(id);
    for (const obsolete of ["YU", "CS", "SU", "TP", "FX", "UK", "DY"]) expect(COUNTRY_GEO_IDS[obsolete]).toBeUndefined();
  });
});
