import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import CountUp from "../components/CountUp";
import DestinationsMap from "../components/DestinationsMapLoader";
import FaqAccordion from "../components/FaqAccordion";
import GlobeStory from "../components/GlobeStory";
import HeroQuickCheck from "../components/HeroQuickCheck";
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CheckIcon,
  CompassIcon,
  GlobeIcon,
  MapPinRouteIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "../components/icons";
import Reveal from "../components/Reveal";
import { blogPostsByDate } from "../lib/blog";
import { coveredDestinationCount, destinations } from "../lib/destinations";
import heroImage from "../public/images/hero-travel.jpg";

const STAT_ICONS = [ScaleIcon, GlobeIcon, ShieldCheckIcon];
const STAT_HREFS = ["/rules/90-180-rule", "/sources", "/methodology"];

/** Same region→color mapping as DestinationsMap's pin legend, so the card
 * grid below the map reads as one consistent system rather than two. */
const REGION_ACCENTS: Record<string, string> = {
  "North America": "#4e79a7",
  "South America": "#ff9da7",
  Europe: "#76b7b2",
  "Europe/Asia": "#af7aa1",
  Africa: "#59a14f",
  "Middle East": "#e15759",
  Asia: "#f28e2b",
  Oceania: "#edc949",
};

export default async function HomePage() {
  const t = await getTranslations();
  const stats = t.raw("home.stats") as Array<{ n: string; label: string; cta: string }>;
  const trustBadges = t.raw("home.trustBadges") as string[];
  const tripCheckBullets = t.raw("home.tools.tripCheck.bullets") as string[];
  const calculatorBullets = t.raw("home.tools.calculator.bullets") as string[];
  const faqItems = t.raw("faqPage.items") as Array<{ q: string; a: string }>;

  const destinationsByRegion = destinations
    .filter((d) => d.status === "verified")
    .reduce<Record<string, string[]>>((acc, d) => {
      (acc[d.region] ??= []).push(d.name);
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      <section className="relative -mt-4">
        <div className="relative left-1/2 h-[380px] w-screen -translate-x-1/2 overflow-hidden sm:h-[420px]">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Light wash, not a dark overlay — the photo itself is pale/misty
              enough for dark text, fading to the page background at the
              bottom so the hero blends straight into the next section. Kept
              non-transparent through the middle band (not just top/bottom)
              because on narrow viewports the taller text stack reaches down
              into the photo's darker mountain silhouette, where dark text
              needs the extra contrast. */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/35 to-slate-50" />
          <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-center px-4 pt-8 text-center sm:pt-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
              <CompassIcon className="h-6 w-6 text-blue-700" />
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
              {t("home.hero.h1")}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 lg:text-base">
              {t("home.hero.sub")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="/trip-check"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] hover:bg-slate-700"
              >
                {t("home.hero.ctaPrimary")}
              </a>
              <a
                href="/calculator"
                className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:scale-[1.03] hover:bg-white"
              >
                {t("home.hero.ctaSecondary")}
              </a>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase backdrop-blur">
              {t("home.hero.eyebrow")}
            </span>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <HeroQuickCheck />
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {stats.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length]!;
            return (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                  <Icon className="h-7 w-7" />
                </span>
                <div className="mt-4 font-display text-4xl font-extrabold text-slate-900 tabular-nums">
                  <CountUp value={s.n} />
                </div>
                <div className="mt-2 max-w-[22ch] text-sm leading-snug text-slate-500">{s.label}</div>
                <a
                  href={STAT_HREFS[i % STAT_HREFS.length]}
                  className="mt-5 inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {s.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            );
          })}
        </section>
      </Reveal>

      <GlobeStory />

      <Reveal>
        <section>
          <p className="text-center text-xs font-semibold tracking-wide text-blue-700 uppercase">
            {t("home.toolsEyebrow")}
          </p>
          <h2 className="mt-1 text-center font-display text-2xl font-bold text-slate-900">
            {t("home.toolsHeading")}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ToolCard
              num="01"
              icon={<MapPinRouteIcon className="h-6 w-6" />}
              title={t("home.tools.tripCheck.title")}
              body={t("home.tools.tripCheck.body")}
              bullets={tripCheckBullets}
              cta={t("home.tools.tripCheck.cta")}
              href="/trip-check"
              accent="blue"
            />
            <ToolCard
              num="02"
              icon={<CalendarClockIcon className="h-6 w-6" />}
              title={t("home.tools.calculator.title")}
              body={t("home.tools.calculator.body")}
              bullets={calculatorBullets}
              cta={t("home.tools.calculator.cta")}
              href="/calculator"
              accent="amber"
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
              <a href="/sources" className="group flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white/20">
                  <GlobeIcon className="h-5 w-5" />
                </span>
                <span className="mt-3 font-display text-2xl font-extrabold text-white tabular-nums">
                  {coveredDestinationCount}+
                </span>
                <span className="mt-1 text-xs leading-snug text-slate-400">
                  {t("home.trustBadgeCoverage", { count: coveredDestinationCount })}
                </span>
              </a>
              {trustBadges.map((label, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                    <CompassIcon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-xs leading-snug text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <p className="text-center text-xs font-semibold tracking-wide text-blue-700 uppercase">
            {t("home.coverageMap.eyebrow")}
          </p>
          <h2 className="mt-1 text-center font-display text-2xl font-bold text-slate-900">
            {t("home.coverageMap.heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("home.coverageMap.sub")}
          </p>
          <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <DestinationsMap />
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(destinationsByRegion).map(([region, names]) => (
              <div
                key={region}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="h-1.5"
                  style={{ backgroundColor: REGION_ACCENTS[region] ?? "#8298b3" }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-slate-900">{region}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {names.length}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{names.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="/sources"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {t("home.coverageMap.cta")}
            </a>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <p className="text-center text-xs font-semibold tracking-wide text-blue-700 uppercase">
            {t("home.blogTeaser.eyebrow")}
          </p>
          <h2 className="mt-1 text-center font-display text-2xl font-bold text-slate-900">
            {t("home.blogTeaser.heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("home.blogTeaser.sub")}
          </p>
          <ol className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPostsByDate.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
                  <img
                    src={`/blog/${post.slug}/opengraph-image`}
                    alt=""
                    className="aspect-[1200/630] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700 uppercase">
                        {post.category}
                      </span>
                      <time dateTime={post.date} className="text-[11px] text-slate-400">
                        {post.date}
                      </time>
                    </div>
                    <h3 className="mt-2 flex-1 font-display text-sm font-bold text-slate-900">
                      {post.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-900 transition-all group-hover:gap-1.5">
                      {t("blogPage.readMore")}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center">
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t("home.blogTeaser.cta")}
            </a>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="bg-slate-900 px-4 py-14 text-center sm:px-6">
            <h2 className="font-display text-2xl font-bold text-white lg:text-3xl">
              {t("home.ctaBanner.heading")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
              {t("home.ctaBanner.sub")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/trip-check"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:scale-[1.03]"
              >
                {t("home.hero.ctaPrimary")}
              </a>
              <a
                href="/calculator"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-white/10"
              >
                {t("home.hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
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
          <p className="text-center text-xs font-semibold tracking-wide text-blue-700 uppercase">
            {t("faqPage.eyebrow")}
          </p>
          <h2 className="mt-1 text-center font-display text-2xl font-bold text-slate-900">
            {t("faqPage.h1")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("faqPage.intro")}
          </p>
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      </Reveal>
    </div>
  );
}

const TOOL_CARD_ACCENTS = {
  blue: { badge: "bg-blue-50 text-blue-700", border: "hover:border-blue-200", check: "text-blue-600" },
  amber: { badge: "bg-amber-50 text-amber-700", border: "hover:border-amber-200", check: "text-amber-600" },
};

function ToolCard({
  num,
  icon,
  title,
  body,
  bullets,
  cta,
  href,
  accent,
}: {
  num: string;
  icon: ReactNode;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  href: string;
  accent: keyof typeof TOOL_CARD_ACCENTS;
}) {
  const colors = TOOL_CARD_ACCENTS[accent];
  return (
    <a
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg lg:p-8 ${colors.border}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 right-4 font-display text-7xl font-extrabold text-slate-100 select-none"
      >
        {num}
      </span>
      <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-110 ${colors.badge}`}>
        {icon}
      </div>
      <h3 className="relative mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-600">{body}</p>
      <ul className="relative mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <CheckIcon className={`h-3.5 w-3.5 shrink-0 ${colors.check}`} />
            {b}
          </li>
        ))}
      </ul>
      <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition-all group-hover:gap-2.5">
        {cta} <ArrowRightIcon className="h-4 w-4" />
      </span>
    </a>
  );
}
