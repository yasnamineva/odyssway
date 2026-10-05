import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import CountUp from "../components/CountUp";
import DestinationsMap from "../components/DestinationsMapLoader";
import FaqAccordion from "../components/FaqAccordion";
import HeroQuickCheck from "../components/HeroQuickCheck";
import { ArrowRightIcon, CalendarClockIcon, MapPinRouteIcon } from "../components/icons";
import Reveal from "../components/Reveal";
import RuleRuler from "../components/RuleRuler";
import SampleAnswer from "../components/SampleAnswer";
import { blogPostsByDate } from "../lib/blog";
import { schengenCountries } from "../lib/countries";
import { coveredDestinationCount, destinations, entryRequirements, queuedDestinations } from "../lib/destinations";
import { publishedNationalities } from "../lib/nationalities";
import { SITE_URL } from "../lib/site";
import heroImage from "../public/images/background.jpg";

export const metadata: Metadata = { alternates: { canonical: "/" } };


/** Every place Trip Check or the calculator is actually live, split into
 * the two groups the globe colors differently (AGENTS.md §3: never
 * overstate coverage, so this is real verified data, not a fixed list). */
const SCHENGEN_NAMES = schengenCountries.map((c) => c.name).sort();
/** Same definition as coveredDestinationCount (a destination with at least
 * one verified entry row), so the list and the headline number always agree. */
const DESTINATION_NAMES = [
  ...new Set(
    entryRequirements
      .filter((r) => r.status === "verified")
      .map((r) => destinations.find((d) => d.code === r.destination)?.name ?? r.destination),
  ),
].sort();

/** Short name lists for the client widgets — passed as props so the
 * homepage's JavaScript doesn't carry the full rule data (Trip Check, which
 * actually resolves answers in the browser, still loads it on /trip-check). */
const VERIFIED_DESTINATIONS = destinations.filter((d) => d.status === "verified");
const QUICK_CHECK_OPTIONS = {
  nationalities: publishedNationalities.map((n) => ({ code: n.nationality, name: n.name })),
  destinations: VERIFIED_DESTINATIONS.map((d) => ({ code: d.code, name: d.name })),
  schengenStates: schengenCountries.map((c) => ({ code: c.code, name: c.name })),
  comingSoon: queuedDestinations.map((d) => ({ code: d.code, name: d.name })),
};
const MAP_DESTINATIONS = VERIFIED_DESTINATIONS.map((d) => ({ code: d.code, name: d.name, region: d.region }));
const SCHENGEN_CODES = schengenCountries.map((c) => c.code);

export default async function HomePage() {
  const t = await getTranslations();
  const [ruleStat, privacyStat] = t.raw("home.stats") as Array<{ n: string; label: string; cta: string }>;
  /** The coverage figure is computed, never typed into copy, so it's the same
   * number here as in the coverage section below (AGENTS.md §3). */
  const stats = [
    { kicker: "The rule", href: "/rules/90-180-rule", ...ruleStat! },
    {
      kicker: "Coverage",
      href: "/sources",
      n: String(coveredDestinationCount),
      label: t("home.coverageStat.label", { schengen: schengenCountries.length }),
      cta: t("home.coverageStat.cta"),
    },
    { kicker: "Privacy", href: "/methodology", ...privacyStat! },
  ];
  const tripCheckBullets = t.raw("home.tools.tripCheck.bullets") as string[];
  const calculatorBullets = t.raw("home.tools.calculator.bullets") as string[];
  const faqItems = t.raw("faqPage.items") as Array<{ q: string; a: string }>;

  const siteJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Odyssway",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Odyssway",
      url: SITE_URL,
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />

      {/* Hero — the vintage-globe close-up (background.jpg): soft, pale bokeh
          on its left, sharp map detail on its right. All hero content lives
          in one left column over that quiet side, so nothing competes with
          the globe. The photo starts below the masthead's rule, so the logo
          always sits on plain paper, never on the image. */}
      <section className="relative left-1/2 mt-4 w-screen -translate-x-1/2 overflow-hidden">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_36%] sm:object-[58%_36%]"
        />
        <div className="absolute inset-0 bg-slate-50/60 sm:bg-transparent sm:bg-gradient-to-r sm:from-slate-50/80 sm:via-slate-50/45 sm:via-40% sm:to-transparent sm:to-70%" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="relative mx-auto flex min-h-[min(86vh,800px)] max-w-6xl items-center px-4 pt-12 pb-24 sm:px-6 lg:pt-14 lg:pb-32">
          <div className="w-full max-w-xl">
            <Kicker>{t("home.hero.eyebrow")}</Kicker>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
              {t("home.hero.h1")}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-700">
              {t("home.hero.sub")}
            </p>
            {/* One primary action: the quick check. The calculator gets a
                quiet text link rather than a competing button. */}
            <div className="mt-8 rounded-md border border-slate-300 bg-[#fffdf8]/95 p-5 shadow-[0_1px_0_rgba(20,18,16,0.04),0_12px_32px_-18px_rgba(20,18,16,0.35)] backdrop-blur">
              <HeroQuickCheck options={QUICK_CHECK_OPTIONS} />
            </div>
            <a
              href="/calculator"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-800"
            >
              {t("home.quickCheck.calculatorLink")} <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Reveal className="mt-12 sm:mt-16">
        <SampleAnswer />
      </Reveal>

      {/* Stats — three ruled columns, ledger-style, rather than three
          floating cards. */}
      <Reveal className="mt-20 sm:mt-28">
        <section>
          <Kicker>{t("home.statsHeading")}</Kicker>
          <dl className="mt-5 grid border-y border-slate-300/80 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.kicker}
                className="flex flex-col border-slate-300/80 py-6 not-first:border-t sm:px-6 sm:not-first:border-t-0 sm:not-first:border-l sm:first:pl-0"
              >
                <dt className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  {s.kicker}
                </dt>
                <dd className="mt-3 font-display text-4xl font-extrabold text-slate-900 tabular-nums">
                  <CountUp value={s.n} />
                </dd>
                <dd className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.label}</dd>
                <dd className="mt-4">
                  <a
                    href={s.href}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 underline-offset-4 hover:underline"
                  >
                    {s.cta} <ArrowRightIcon className="h-3 w-3" />
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      {/* The rule itself, taught by doing: an interactive 180-day ruler
          driven by the real engine. */}
      <Reveal className="mt-20 sm:mt-28">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-14">
          <div>
            <SectionHeader kicker={t("home.rule.eyebrow")} heading={t("home.rule.heading")} sub={t("home.rule.sub")} />
            <a
              href="/calculator"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              {t("home.rule.cta")} <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
          <RuleRuler />
        </section>
      </Reveal>

      <Reveal className="mt-20 sm:mt-28">
        <section>
          <SectionHeader kicker={t("home.toolsEyebrow")} heading={t("home.toolsHeading")} />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ToolCard
              num="I"
              icon={<MapPinRouteIcon className="h-5 w-5" />}
              title={t("home.tools.tripCheck.title")}
              body={t("home.tools.tripCheck.body")}
              bullets={tripCheckBullets}
              cta={t("home.tools.tripCheck.cta")}
              href="/trip-check"
            />
            <ToolCard
              num="II"
              icon={<CalendarClockIcon className="h-5 w-5" />}
              title={t("home.tools.calculator.title")}
              body={t("home.tools.calculator.body")}
              bullets={calculatorBullets}
              cta={t("home.tools.calculator.cta")}
              href="/calculator"
            />
          </div>
        </section>
      </Reveal>

      {/* Coverage — the antique desk globe on the left; the explanation and
          a compact, running-text list of every verified place on the right.
          On phones it reads header → globe → list, so the globe isn't
          pushed below a long block of country names. */}
      <Reveal className="mt-20 sm:mt-28">
        <section className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          <div className="lg:col-start-2 lg:row-start-1 lg:self-end">
            <SectionHeader
              kicker={t("home.coverageMap.eyebrow")}
              heading={t("home.coverageMap.heading")}
              sub={t("home.coverageMap.sub")}
            />
          </div>

          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
            <DestinationsMap destinations={MAP_DESTINATIONS} schengenCodes={SCHENGEN_CODES} />
          </div>

          <div className="lg:col-start-2 lg:row-start-2">
            <a
              href="/sources"
              className="flex items-baseline gap-3 border-t border-slate-300/80 pt-5 text-slate-900 underline-offset-4 hover:underline"
            >
              <span className="font-display text-3xl font-extrabold tabular-nums">{coveredDestinationCount}</span>
              <span className="text-sm text-slate-600">
                {t("home.coverageMap.countLine", { schengen: SCHENGEN_NAMES.length })}
              </span>
            </a>

            <dl className="mt-5 space-y-4 text-[13px] leading-relaxed">
              <div>
                <dt className="font-semibold text-slate-900">{t("home.coverageMap.destinationsLabel")}</dt>
                <dd className="mt-1 text-slate-600">{DESTINATION_NAMES.join(", ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  {t("home.coverageMap.schengenLabel", { count: SCHENGEN_NAMES.length })}
                </dt>
                <dd className="mt-1 text-slate-600">{SCHENGEN_NAMES.join(", ")}</dd>
              </div>
            </dl>

            <a
              href="/sources"
              className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {t("home.coverageMap.cta")}
            </a>
          </div>
        </section>
      </Reveal>

      <Reveal className="mt-20 sm:mt-28">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              kicker={t("home.blogTeaser.eyebrow")}
              heading={t("home.blogTeaser.heading")}
              sub={t("home.blogTeaser.sub")}
            />
            <a
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              {t("home.blogTeaser.cta")}
            </a>
          </div>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPostsByDate.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-300/80 bg-white transition hover:border-slate-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
                  <img
                    src={`/blog/${post.slug}/opengraph-image`}
                    alt=""
                    width={1200}
                    height={630}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[1200/630] w-full border-b border-slate-300/80 object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] tracking-[0.12em] text-slate-500 uppercase">
                      <span className="font-semibold text-brand-700">{post.category}</span>
                      <span aria-hidden="true"> · </span>
                      <time dateTime={post.date}>{post.date}</time>
                    </p>
                    <h3 className="mt-2 flex-1 font-display text-base leading-snug font-bold text-slate-900 underline-offset-4 group-hover:underline">
                      {post.title}
                    </h3>
                    <span className="mt-4 text-xs font-semibold text-slate-700">{t("blogPage.readMore")}</span>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal className="mt-20 sm:mt-28">
        <section className="relative left-1/2 w-screen -translate-x-1/2 bg-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white lg:text-3xl">
                {t("home.ctaBanner.heading")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
                {t("home.ctaBanner.sub")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/trip-check"
                className="rounded-md bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
              >
                {t("home.hero.ctaPrimary")}
              </a>
              <a
                href="/calculator"
                className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("home.hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal className="mt-20 pb-4 sm:mt-28">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-14">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              }),
            }}
          />
          <SectionHeader kicker={t("faqPage.eyebrow")} heading={t("faqPage.h1")} sub={t("faqPage.intro")} />
          <FaqAccordion items={faqItems} />
        </section>
      </Reveal>
    </div>
  );
}

/** Small italic-serif label with a short rule — the page's one recurring
 * section marker, in the voice of a printed atlas rather than a SaaS kicker. */
function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-display text-[15px] text-brand-700 italic">
      <span className="h-px w-8 shrink-0 bg-brand-700/50" aria-hidden="true" />
      {children}
    </p>
  );
}

function SectionHeader({ kicker, heading, sub }: { kicker: string; heading: string; sub?: string }) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {heading}
      </h2>
      {sub ? <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">{sub}</p> : null}
    </div>
  );
}

function ToolCard({
  num,
  icon,
  title,
  body,
  bullets,
  cta,
  href,
}: {
  num: string;
  icon: ReactNode;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-md border border-slate-300/80 bg-white p-6 transition hover:border-slate-500 lg:p-8"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <span className="font-display text-sm text-slate-500 italic">No. {num}</span>
        <span className="text-slate-500 transition group-hover:text-brand-600">{icon}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{body}</p>
      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] text-slate-600 sm:grid-cols-2">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-brand-600" aria-hidden="true">
              —
            </span>
            {b}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline-offset-4 group-hover:underline">
        {cta} <ArrowRightIcon className="h-4 w-4" />
      </span>
    </a>
  );
}
