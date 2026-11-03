import { describe, expect, it } from "vitest";
import { decodeTripShare, encodeTripShare } from "./trip-share";

describe("trip share links", () => {
  it("round-trips a multi-stop trip with items, including awkward characters", () => {
    const state = { nationality: "US", destination: "JP", legs: ["KR", "TH"], transit: "QA", legTransits: ["", ""], items: ["adderall", "vitamin B12, D3", "CBD oil & gummies"] };
    const hash = encodeTripShare(state);
    expect(hash).toBe("n=US&d=JP&l=KR,TH&s=QA&i=adderall,vitamin%20B12%2C%20D3,CBD%20oil%20%26%20gummies");
    expect(decodeTripShare(`#${hash}`)).toEqual(state);
  });

  it("keeps a stopover per stop, and reads older single-stopover links", () => {
    const state = { nationality: "BG", destination: "AM", legs: ["US"], transit: "", legTransits: ["CA"], items: [] };
    const hash = encodeTripShare(state);
    expect(hash).toBe("n=BG&d=AM&l=US&s=,CA");
    expect(decodeTripShare(`#${hash}`)).toEqual(state);
    expect(decodeTripShare("#n=BG&d=AM&l=US&s=TR")).toMatchObject({ transit: "TR", legTransits: [""] });
  });

  it("accepts the Schengen sentinel as a destination but not as a passport", () => {
    expect(decodeTripShare("#n=GB&d=SCHENGEN")?.destination).toBe("SCHENGEN");
    expect(decodeTripShare("#n=SCHENGEN&d=JP")).toBeNull();
  });

  it("rejects malformed codes and drops bad legs", () => {
    expect(decodeTripShare("#n=usa&d=JP")).toBeNull();
    expect(decodeTripShare("#n=US&d=JP&l=KR,<script>,TH")?.legs).toEqual(["KR", "TH"]);
    expect(decodeTripShare("")).toBeNull();
  });
});
