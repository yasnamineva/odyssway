"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper so app/page.tsx (a Server Component) can lazy-load
 * DestinationsMap with `ssr: false` — required because `next/dynamic`'s
 * `ssr: false` option only works from inside a Client Component boundary,
 * and is required here (not just a bundle-size nicety) because d3-geo's
 * generated SVG path data isn't guaranteed byte-identical between the
 * server and browser, which produced a real hydration mismatch when this
 * was briefly SSR'd. Same reasoning as Trip Check's WorldMap.
 */
const DestinationsMap = dynamic(() => import("./DestinationsMap"), {
  ssr: false,
  loading: () => <div className="aspect-[960/460] w-full animate-pulse rounded-2xl bg-slate-100" />,
});

export default DestinationsMap;
