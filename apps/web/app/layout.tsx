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
          <div className="flex min-h-dvh flex-col">
            <header className="border-b border-slate-200">
              <div className="mx-auto flex max-w-2xl flex-wrap items-baseline justify-between gap-2 px-4 py-5">
                <a
                  href="/"
                  className="font-display text-xl font-bold tracking-tight text-slate-900"
                >
                  {t("header.brand")}
                </a>
                <nav className="flex flex-wrap gap-x-4 gap-y-1">
                  <a href="/calculator" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">
                    {t("header.nav.calculator")}
                  </a>
                  <a href="/rules/90-180-rule" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">
                    {t("header.nav.rule")}
                  </a>
                  <a href="/ees" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">
                    {t("header.nav.ees")}
                  </a>
                  <a href="/etias/status" className="text-[13px] font-medium text-slate-600 hover:text-slate-900">
                    {t("header.nav.etias")}
                  </a>
                </nav>
              </div>
            </header>
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-12">
              {children}
            </main>
            <footer className="bg-slate-900 text-slate-300">
              <div className="mx-auto max-w-2xl space-y-3 px-4 py-8 text-xs leading-relaxed">
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
