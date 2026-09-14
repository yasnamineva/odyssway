import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Baloo_2 } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

/** Soft, rounded display font (misty-travel-journal reference direction) —
 * self-hosted at build time by next/font (no external <link>/CSP concerns).
 * Exposed as its own variable (not `--font-display` directly) because
 * Tailwind's `@theme` in globals.css already owns that name; see the
 * `--font-display` token there, which wraps this variable with sans-serif
 * fallbacks. */
const displayFont = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-sans",
  display: "swap",
});

const OFFICIAL_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Odyssway",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const messages = await getMessages();
  const t = await getTranslations();
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en" className={displayFont.variable}>
      <head>
        {plausibleDomain ? (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-dvh flex-col">
            <header className="px-3 pt-3 sm:px-4 sm:pt-4">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur">
                <a
                  href="/"
                  className="font-display text-lg font-extrabold tracking-tight text-slate-900"
                >
                  {t("header.brand")}
                </a>
                <nav className="hidden items-center gap-0.5 rounded-full bg-slate-100 p-1 md:flex">
                  <a href="/trip-check" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm">
                    {t("header.nav.tripCheck")}
                  </a>
                  <a href="/calculator" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm">
                    {t("header.nav.calculator")}
                  </a>
                  <a href="/rules/90-180-rule" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm">
                    {t("header.nav.rule")}
                  </a>
                  <a href="/ees" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm">
                    {t("header.nav.ees")}
                  </a>
                  <a href="/etias/status" className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm">
                    {t("header.nav.etias")}
                  </a>
                </nav>
                <a
                  href="/trip-check"
                  className="rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold whitespace-nowrap text-white transition hover:bg-slate-700"
                >
                  {t("home.hero.ctaPrimary")}
                </a>
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-12">
              {children}
            </main>
            <footer className="bg-slate-900 text-slate-300">
              <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-xs leading-relaxed">
                <p className="font-display text-base text-slate-100">
                  {t("header.brand")}
                </p>
                <p>{t("footer.disclaimer")}</p>
                <p className="flex flex-wrap gap-x-4 gap-y-1">
                  <a href="/about" className="underline hover:text-white">
                    {t("footer.about")}
                  </a>
                  <a href="/methodology" className="underline hover:text-white">
                    {t("footer.methodology")}
                  </a>
                  <a href="/sources" className="underline hover:text-white">
                    {t("footer.sources")}
                  </a>
                  <a href="/changelog" className="underline hover:text-white">
                    {t("footer.changelog")}
                  </a>
                  <a href="/blog" className="underline hover:text-white">
                    {t("footer.blog")}
                  </a>
                  <a href="/faq" className="underline hover:text-white">
                    {t("footer.faq")}
                  </a>
                  <a
                    href={OFFICIAL_CALCULATOR_URL}
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    {t("footer.officialCalculator")}
                  </a>
                </p>
                <p className="text-slate-400">{t("footer.affiliateNote")}</p>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
