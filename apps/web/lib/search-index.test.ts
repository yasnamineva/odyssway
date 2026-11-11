import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import { bringPairs } from "./bring-pages";
import { productPairs } from "./medication-products";
import { isIndexedBringPair, isIndexedProductPair, isIndexedTravelPair } from "./search-index";
import keep from "./search-keep-medications.json";
import { travelPairs, travelPairPath } from "./travel-pairs";

describe("search indexing rules", () => {
  it("indexes the original passports' pages and not the expansion's", () => {
    const us = travelPairs.find((p) => p.row.nationality === "US")!;
    const other = travelPairs.find((p) => !["AR", "AU", "BR", "CA", "CL", "CN", "DE", "ES", "FR", "GB", "IL", "IN", "IT", "JP", "KR", "MX", "MY", "NL", "NZ", "SG", "UA", "US"].includes(p.row.nationality))!;
    expect(isIndexedTravelPair(us)).toBe(true);
    expect(isIndexedTravelPair(other)).toBe(false);
  });

  it("keeps one indexable medicine page per country and set of rows", () => {
    const key = (p: (typeof productPairs)[number]) => `${p.destination.code}:${p.rows.map((r) => r.slug).sort().join("+")}`;
    const groups = new Set(productPairs.map(key));
    const indexedGroups = new Set(productPairs.filter(isIndexedProductPair).map(key));
    expect(indexedGroups).toEqual(groups);
  });

  it("never drops a medicine page that earned impressions", () => {
    const live = new Set(productPairs.map((p) => `/medications/${p.product.slug}/${p.destinationSlug}`));
    for (const path of keep.paths.filter((p) => live.has(p))) {
      const pair = productPairs.find((p) => `/medications/${p.product.slug}/${p.destinationSlug}` === path)!;
      expect(isIndexedProductPair(pair), path).toBe(true);
    }
  });

  it("noindexes Schengen state pages that only repeat the shared EU rule", () => {
    const austria = bringPairs.find((p) => p.itemSlug === "alcohol" && p.destinationSlug === "austria");
    if (austria) expect(isIndexedBringPair(austria)).toBe(false);
    const japan = bringPairs.find((p) => p.itemSlug === "alcohol" && p.destinationSlug === "japan")!;
    expect(isIndexedBringPair(japan)).toBe(true);
  });

  it("lists no noindex page in the sitemap", () => {
    const urls = new Set(sitemap().map((e) => e.url.replace(/^https:\/\/[^/]+/, "")));
    for (const p of travelPairs.filter((x) => !isIndexedTravelPair(x))) expect(urls.has(travelPairPath(p))).toBe(false);
    for (const p of bringPairs.filter((x) => !isIndexedBringPair(x))) expect(urls.has(`/bring/${p.itemSlug}/${p.destinationSlug}`)).toBe(false);
    for (const p of productPairs.filter((x) => !isIndexedProductPair(x)))
      expect(urls.has(`/medications/${p.product.slug}/${p.destinationSlug}`)).toBe(false);
    console.log(`sitemap URLs: ${urls.size}`);
  });
});
