import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Lora } from "next/font/google";
import type { ReactNode } from "react";
import FooterLogo from "../components/FooterLogo";
import SiteNav from "../components/SiteNav";
import { SITE_URL } from "../lib/site";
import "./globals.css";

/** Lora — a warm humanist serif matching the curled, moderate-contrast
 * letterforms of the Odyssway wordmark itself (logo.png), so headlines and
 * the logo read as one typographic family instead of a sans headline next
 * to a serif logo. Self-hosted at build time by next/font (no external
 * <link>/CSP concerns). Exposed as its own variable (not `--font-display`
 * directly) because Tailwind's `@theme` in globals.css already owns that
 * name; see the `--font-display` token there, which wraps this variable
 * with serif fallbacks. */
const displayFont = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-sans",
  display: "swap",
});

const OFFICIAL_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en";

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
            <header className="relative z-30 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
              <SiteNav
                brand={t("header.brand")}
                links={[
                  { href: "/trip-check", label: t("header.nav.tripCheck") },
                  { href: "/calculator", label: t("header.nav.calculator") },
                  { href: "/rules/90-180-rule", label: t("header.nav.rule") },
                  { href: "/ees", label: t("header.nav.ees") },
                  { href: "/etias/status", label: t("header.nav.etias") },
                  { href: "/blog", label: t("footer.blog") },
                ]}
                cta={{ href: "/trip-check", label: t("home.hero.ctaPrimary") }}
              />
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-slate-800 bg-slate-900 text-white">
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xs">
                    <span className="inline-flex rounded-md bg-white px-4 py-3">
                      <FooterLogo alt={t("header.brand")} />
                    </span>
                    <p className="mt-3 text-xs leading-relaxed text-white/50">
                      {t("footer.disclaimer")}
                    </p>
                  </div>
                  <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs sm:grid-cols-3">
                    <a href="/about" className="text-white/60 transition hover:text-white">
                      {t("footer.about")}
                    </a>
                    <a href="/methodology" className="text-white/60 transition hover:text-white">
                      {t("footer.methodology")}
                    </a>
                    <a href="/sources" className="text-white/60 transition hover:text-white">
                      {t("footer.sources")}
                    </a>
                    <a href="/changelog" className="text-white/60 transition hover:text-white">
                      {t("footer.changelog")}
                    </a>
                    <a href="/blog" className="text-white/60 transition hover:text-white">
                      {t("footer.blog")}
                    </a>
                    <a href="/bring" className="text-white/60 transition hover:text-white">
                      {t("footer.bring")}
                    </a>
                    <a href="/faq" className="text-white/60 transition hover:text-white">
                      {t("footer.faq")}
                    </a>
                    <a href="/developers" className="text-white/60 transition hover:text-white">
                      {t("footer.developers")}
                    </a>
                    <a
                      href={OFFICIAL_CALCULATOR_URL}
                      rel="noopener noreferrer"
                      className="text-white/60 transition hover:text-white"
                    >
                      {t("footer.officialCalculator")}
                    </a>
                  </nav>
                </div>
                <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
                  <span>{t("footer.affiliateNote")}</span>
                  <span>90 / 180</span>
                </div>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
