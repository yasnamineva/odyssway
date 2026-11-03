import { describe, expect, it } from "vitest";
import { resolveAirsideTransit } from "./transit-rules";

describe("resolveAirsideTransit", () => {
  it("UK: transit visa for listed passports, landside-only visa list, and no ETA airside for others", () => {
    expect(resolveAirsideTransit("IN", "GB")?.rule.airside).toBe("transit_visa_required");
    expect(resolveAirsideTransit("IN", "GB")?.rule.visaName).toBe("Direct Airside Transit Visa");
    expect(resolveAirsideTransit("UA", "GB")?.rule.airside).toBe("no_visa");
    expect(resolveAirsideTransit("UA", "GB")?.rule.conditions?.length).toBeGreaterThan(0);
    const us = resolveAirsideTransit("US", "GB");
    expect(us?.rule.airside).toBe("no_visa");
    expect(us?.rule.others).toBe(true);
  });

  it("Schengen: national lists apply only in the states that keep them", () => {
    expect(resolveAirsideTransit("TR", "DE")?.rule.airside).toBe("transit_visa_required");
    expect(resolveAirsideTransit("TR", "IT")?.rule.airside).toBe("no_visa");
    expect(resolveAirsideTransit("IN", "CZ")?.rule.airside).toBe("transit_visa_required");
    expect(resolveAirsideTransit("IN", "DE")?.rule.airside).toBe("no_visa");
    expect(resolveAirsideTransit("RU", "FR")?.rule.airside).toBe("depends");
    expect(resolveAirsideTransit("RU", "ES")?.rule.airside).toBe("transit_visa_required");
    expect(resolveAirsideTransit("US", "NL")?.hubName).toBe("Schengen Area");
  });

  it("Singapore: no visa airside for anyone; the 96-hour transit facility is noted for its passports", () => {
    expect(resolveAirsideTransit("IN", "SG")?.rule.airside).toBe("no_visa");
    expect(resolveAirsideTransit("IN", "SG")?.rule.notes).toContain("96-hour");
    expect(resolveAirsideTransit("UA", "SG")?.rule.notes).toContain("96-hour");
    expect(resolveAirsideTransit("US", "SG")?.rule.others).toBe(true);
  });

  it("returns nothing for hubs we haven't verified", () => {
    expect(resolveAirsideTransit("US", "AE")).toBeUndefined();
  });
});
