import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import "./globals.css";

const OFFICIAL_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
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
    <html lang="en">
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
          <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4">
            <header className="flex flex-wrap items-center justify-between gap-2 py-5">
              <a href="/" className="text-lg font-bold tracking-tight">
                {t("header.brand")}
              </a>
              <nav className="flex flex-wrap gap-x-4 gap-y-1">
                <a href="/calculator" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {t("header.nav.calculator")}
                </a>
                <a href="/rules/90-180-rule" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {t("header.nav.rule")}
                </a>
                <a href="/ees" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {t("header.nav.ees")}
                </a>
                <a href="/etias/status" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {t("header.nav.etias")}
                </a>
              </nav>
            </header>
            <main className="flex-1 pb-12">{children}</main>
            <footer className="space-y-2 border-t border-slate-200 py-6 text-xs leading-relaxed text-slate-500">
              <p>{t("footer.disclaimer")}</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <a href="/about" className="underline hover:text-slate-700">
                  {t("footer.about")}
                </a>
                <a href="/methodology" className="underline hover:text-slate-700">
                  {t("footer.methodology")}
                </a>
                <a href="/sources" className="underline hover:text-slate-700">
                  {t("footer.sources")}
                </a>
                <a
                  href={OFFICIAL_CALCULATOR_URL}
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-700"
                >
                  {t("footer.officialCalculator")}
                </a>
              </p>
              <p>{t("footer.affiliateNote")}</p>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
