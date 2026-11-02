import { describe, expect, it } from "vitest";
import { destinationSlug } from "./destination-index";

describe("destinationSlug", () => {
  it("joins words with hyphens", () => {
    expect(destinationSlug("United States")).toBe("united-states");
    expect(destinationSlug("Bosnia and Herzegovina")).toBe("bosnia-and-herzegovina");
  });

  it("folds accented letters to ASCII instead of dropping them", () => {
    expect(destinationSlug("Türkiye")).toBe("turkiye");
    expect(destinationSlug("Curaçao")).toBe("curacao");
    expect(destinationSlug("Côte d'Ivoire")).toBe("cote-d-ivoire");
  });
});
