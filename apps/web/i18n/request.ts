import { getRequestConfig } from "next-intl/server";

/**
 * i18n architecture is locale-ready from day one (AGENTS.md §4): all
 * user-facing strings live in messages/{locale}.json. Locale routing
 * (/bg, /tr, /sr + hreflang) arrives in Phase 3; until then everything
 * resolves to "en".
 */
export default getRequestConfig(async () => {
  const locale = "en";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
