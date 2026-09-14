import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import SiteNav from "../components/SiteNav";
import "./globals.css";

/** Bold geometric-sans display font — replaces the earlier rounded Baloo 2
 * (too soft/playful for a compliance product; read as generic "AI slop").
 * Self-hosted at build time by next/font (no external <link>/CSP concerns).
 * Exposed as its own variable (not `--font-display` directly) because
 * Tailwind's `@theme` in globals.css already owns that name; see the
 * `--font-display` token there, which wraps this variable with sans-serif
 * fallbacks. */
const displayFont = Poppins({
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
            <header className="relative z-30 mx-auto w-full max-w-6xl">
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
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white">
              <div className="mx-auto max-w-2xl space-y-4 px-4 py-10 text-center text-xs leading-relaxed text-slate-500">
                <p className="font-display text-lg font-bold text-slate-900">
                  {t("header.brand")}
                </p>
                <p>{t("footer.disclaimer")}</p>
                <p className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  <a href="/about" className="hover:text-slate-900 hover:underline">
                    {t("footer.about")}
                  </a>
                  <a href="/methodology" className="hover:text-slate-900 hover:underline">
                    {t("footer.methodology")}
                  </a>
                  <a href="/sources" className="hover:text-slate-900 hover:underline">
                    {t("footer.sources")}
                  </a>
                  <a href="/changelog" className="hover:text-slate-900 hover:underline">
                    {t("footer.changelog")}
                  </a>
                  <a href="/blog" className="hover:text-slate-900 hover:underline">
                    {t("footer.blog")}
                  </a>
                  <a href="/bring" className="hover:text-slate-900 hover:underline">
                    {t("footer.bring")}
                  </a>
                  <a href="/faq" className="hover:text-slate-900 hover:underline">
                    {t("footer.faq")}
                  </a>
                  <a
                    href={OFFICIAL_CALCULATOR_URL}
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 hover:underline"
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
