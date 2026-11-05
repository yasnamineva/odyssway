"use client";

import { createTranslator } from "next-intl";
import { usePathname } from "next/navigation";
import deMessages from "../messages/de.json";
import enMessages from "../messages/en.json";

const de = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const en = (key: keyof typeof enMessages.notFoundPage) => enMessages.notFoundPage[key];

/**
 * Site-wide 404 (the status stays 404). German pages are withdrawn while their
 * English rule is newer than the translation (lib/translations.ts), so on a /de
 * address the reader gets the English version of the same page instead.
 */
export default function NotFound() {
  const path = usePathname() ?? "/";
  if (path === "/de" || path.startsWith("/de/")) {
    const english = path.replace(/^\/de(?=\/|$)/, "") || "/";
    return (
      <article lang="de" className="mx-auto max-w-2xl space-y-4 py-10" data-testid="de-not-found">
        <h1 className="font-display text-2xl font-bold text-slate-900">{de("notFoundTitle")}</h1>
        <p className="text-sm text-slate-600">{de("notFoundText")}</p>
        <p className="flex flex-wrap gap-4 text-sm">
          <a href={english} hrefLang="en" lang="en" className="font-medium text-blue-700 underline">
            {de("notFoundEnglish")}
          </a>
          <a href="/de/bring" className="text-blue-700 underline">
            {de("notFoundIndex")}
          </a>
        </p>
      </article>
    );
  }
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-10" data-testid="not-found">
      <h1 className="font-display text-2xl font-bold text-slate-900">{en("title")}</h1>
      <p className="text-sm text-slate-600">{en("text")}</p>
      <p className="flex flex-wrap gap-4 text-sm">
        <a href="/" className="font-medium text-blue-700 underline">
          {en("home")}
        </a>
        <a href="/bring" className="text-blue-700 underline">
          {en("sources")}
        </a>
      </p>
    </article>
  );
}
