import { describe, expect, it } from "vitest";
import { reportProblemHref } from "./report-problem";

describe("reportProblemHref", () => {
  it("pre-fills the rule, page and cited source", () => {
    const href = reportProblemHref({
      rule: "tobacco-my (Malaysia)",
      path: "/bring/tobacco/malaysia",
      sourceUrl: "https://www.customs.gov.my/en/",
      verifiedAt: "2026-10-26",
    });
    expect(href.startsWith("mailto:support@odyssway.com?subject=")).toBe(true);
    const params = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    expect(params.get("subject")).toBe("Rule check: tobacco-my (Malaysia)");
    const body = params.get("body") ?? "";
    expect(body).toContain("/bring/tobacco/malaysia");
    expect(body).toContain("Our source: https://www.customs.gov.my/en/");
    expect(body).toContain("Last checked: 2026-10-26");
    expect(body).not.toMatch(/\n\n\n/);
  });

  it("leaves out the check date when there is none", () => {
    const body = new URLSearchParams(
      reportProblemHref({ rule: "x", path: "/x", sourceUrl: "https://example.org" }).split("?")[1],
    ).get("body");
    expect(body).not.toContain("Last checked");
  });
});
