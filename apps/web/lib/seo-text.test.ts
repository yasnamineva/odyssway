import { describe, expect, it } from "vitest";
import { checkedYear, clip, describeRule, firstSentence, multiRowLead, seoVerdictKey, titleWithAnswer, TITLE_MAX } from "./seo-text";
import { customsItems } from "./destinations";

describe("seo text", () => {
  it("takes the first sentence without splitting on abbreviations", () => {
    expect(firstSentence("Don't bring it. Australia lists kratom as a drug.")).toBe("Don't bring it. Australia lists kratom as a drug.");
    expect(firstSentence("Up to 3 months' supply is allowed for travellers. You must declare it.")).toBe(
      "Up to 3 months' supply is allowed for travellers.",
    );
    expect(firstSentence("Products like e.g. gum are covered by this rule today. Next.")).toBe(
      "Products like e.g. gum are covered by this rule today.",
    );
  });

  it("clips at a word boundary", () => {
    expect(clip("one two three four five", 12)).toBe("one two…");
    expect(clip("short", 50)).toBe("short");
  });

  it("puts the answer and year in the title only while it fits", () => {
    expect(titleWithAnswer("Can you bring Adderall to Japan?", "No, it's banned", "2026")).toBe(
      "Can you bring Adderall to Japan? No, it's banned (2026)",
    );
    const long = titleWithAnswer("Can you bring medication to the Dominican Republic?", "Only with a permit", "2026");
    expect(long.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it("says 'only with a permit' for rows that have a permit procedure", () => {
    const kr = customsItems.find((r) => r.slug === "controlled-medication-kr")!;
    expect(seoVerdictKey(kr)).toBe("permit");
    expect(checkedYear([kr])).toBe(kr.verified_at!.slice(0, 4));
  });

  it("keeps descriptions within snippet length", () => {
    const d = describeRule("x ".repeat(200), "Official source, checked 2026-10-16.");
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d.endsWith("checked 2026-10-16.")).toBe(true);
  });
});

describe("titleWithAnswer with a preferred and a fallback answer", () => {
  it("uses the limit when it fits, otherwise the plain verdict, before dropping the answer", () => {
    expect(titleWithAnswer("Can you bring alcohol to Japan?", ["Yes, limit: 1 liter", "Yes, with limits"], "2026")).toBe(
      "Can you bring alcohol to Japan? Yes, limit: 1 liter (2026)",
    );
    expect(
      titleWithAnswer("Can you bring tobacco or cigarettes to Morocco?", ["Yes, limit: 200 cigarettes / 250g", "Yes, with limits"], "2026"),
    ).toBe("Can you bring tobacco or cigarettes to Morocco? Yes, with limits");
  });
});

describe("multiRowLead", () => {
  const rows = customsItems.filter((r) => r.slug === "pisco-pe" || r.slug === "alcohol-pe");

  it("gives each row's own line under its label", () => {
    const lead = multiRowLead(rows, (r) => r.slug)!;
    for (const r of rows) expect(lead).toContain(`${r.slug}: ${r.summary!.replace(/\.$/, "")}.`);
  });

  it("leads with the allowance, not the ban", () => {
    expect(multiRowLead(rows, (r) => r.slug)!.startsWith("alcohol-pe:")).toBe(true);
  });

  it("falls back when a row has nothing to quote", () => {
    expect(multiRowLead([{ ...rows[0]!, summary: undefined, limits: undefined, notes: undefined }], (r) => r.slug)).toBeUndefined();
  });
});
