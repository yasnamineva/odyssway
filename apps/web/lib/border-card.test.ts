import { describe, expect, it } from "vitest";
import { buildBorderCardLines, toPdfText, type BorderCardLabels } from "./border-card";
import { customsItems } from "./destinations";

const labels: BorderCardLabels = {
  title: "Border card: Controlled medication, South Korea",
  verdict: "Depends",
  rule: "The rule",
  quantity: "How much:",
  notes: "Good to know",
  carry: "What to carry",
  apply: "Who to contact",
  leadTime: "When to apply:",
  applyUrl: "Apply at:",
  atTheBorder: "At the border:",
  transit: "If you're only changing planes here",
  transitRule: "Not if you stay airside",
  source: "Official source",
  checked: "Checked against the source on 2026-10-14",
  footer: "From odyssway.com.",
};

describe("border card", () => {
  it("lists a row's documents as tick boxes, then the authority, transit rule and source", () => {
    const row = customsItems.find((r) => r.slug === "controlled-medication-kr")!;
    const lines = buildBorderCardLines(row, labels);
    const checks = lines.filter((l) => l.kind === "check");
    expect(checks).toHaveLength(row.procedure!.documents!.length);
    const text = lines.map((l) => ("text" in l ? l.text : "")).join("\n");
    expect(text).toContain(row.procedure!.authority);
    expect(text).toContain(row.transit!.description);
    expect(text).toContain(row.legal_source.url);
    expect(lines.at(-1)).toEqual({ kind: "small", text: "From odyssway.com." });
  });

  it("leaves out sections a row doesn't have", () => {
    const row = customsItems.find((r) => r.slug === "kava-au")!;
    const kinds = buildBorderCardLines(row, labels).map((l) => ("text" in l ? l.text : l.kind));
    expect(kinds).not.toContain("What to carry");
    expect(kinds).not.toContain("Who to contact");
  });

  it("keeps text printable by the PDF's built-in fonts", () => {
    expect(toPdfText("Apply → now, ≤ 3 months — “quoted” €5 café")).toBe(
      "Apply -> now, <= 3 months — “quoted” €5 café",
    );
    expect(toPdfText("General Administration of Customs (海关总署) notice")).toBe(
      "General Administration of Customs notice",
    );
    expect(toPdfText('say "a" "b" and “海关”')).toBe('say "a" "b" and');
    expect(toPdfText("Gümrük İdaresi, Uprava carina Crne Gore (Đ, č, ž)")).toBe(
      "Gümrük Idaresi, Uprava carina Crne Gore (D, c, z)",
    );
  });
});
