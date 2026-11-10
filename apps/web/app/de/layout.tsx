import type { Metadata } from "next";
import { GERMAN_INDEXABLE } from "../../lib/translations";

// German pages: noindex while GERMAN_INDEXABLE is off (see lib/translations.ts). Links are
// still followed, so the English pages they point to keep their signals.
export const metadata: Metadata = GERMAN_INDEXABLE ? {} : { robots: { index: false, follow: true } };

// The root layout sets <html lang="en">; mark the German content itself as German.
export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return <div lang="de">{children}</div>;
}
