import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import CountUp from "../components/CountUp";
import DestinationsMap from "../components/DestinationsMapLoader";
import FaqAccordion from "../components/FaqAccordion";
import GlobeStory from "../components/GlobeStory";
import HeroQuickCheck from "../components/HeroQuickCheck";
import {
  CalendarClockIcon,
  CompassIcon,
  GlobeIcon,
  MapPinRouteIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "../components/icons";
import Reveal from "../components/Reveal";
import { blogPostsByDate } from "../lib/blog";
import { coveredDestinationCount, destinations } from "../lib/destinations";
import { destinationLabelFor } from "../lib/destination-label";
import { resolveTripCheck } from "../lib/trip-check";
import heroImage from "../public/images/hero-travel.jpg";

const STAT_ICONS = [ScaleIcon, GlobeIcon, ShieldCheckIcon];

export default async function HomePage() {
  const t = await getTranslations();
  const stats = t.raw("home.stats") as Array<{ n: string; label: string }>;
  const trustBadges = t.raw("home.trustBadges") as string[];
  const tripCheckBullets = t.raw("home.tools.tripCheck.bullets") as string[];
  const calculatorBullets = t.raw("home.tools.calculator.bullets") as string[];
  const faqItems = t.raw("faqPage.items") as Array<{ q: string; a: string }>;

  // A real, precomputed example — not a mockup — so the "here's what you get"
  // preview is exactly as honest as the live tool (AGENTS.md §3).
  const example = resolveTripCheck("US", "GB", ["alcohol"]);

  const destinationsByRegion = destinations
    .filter((d) => d.status === "verified")
    .reduce<Record<string, string[]>>((acc, d) => {
      (acc[d.region] ??= []).push(d.name);
      return acc;
    }, {});

  return (
    <div className="space-y-10">
      <section className="relative -mt-4">
        <div className="relative left-1/2 h-[560px] w-screen -translate-x-1/2 overflow-hidden sm:h-[600px]">
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
          <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-center px-4 pt-16 text-center sm:pt-20">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
              <CompassIcon className="h-9 w-9 text-blue-700" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
              {t("home.hero.h1")}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 lg:text-base">
              {t("home.hero.sub")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
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
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase backdrop-blur">
              {t("home.hero.eyebrow")}
            </span>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <HeroQuickCheck />
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          {stats.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length]!;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="mt-3 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                  <CountUp value={s.n} />
                </div>
                <div className="mt-1.5 text-[11px] leading-snug text-slate-500">{s.label}</div>
              </div>
            );
          })}
        </section>
      </Reveal>

      <GlobeStory />

      <Reveal>
        <section>
          <h2 className="text-center font-display text-xl font-bold text-slate-900">
            {t("home.previewHeading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("home.previewSub")}
          </p>
          <div className="mx-auto mt-6 max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="ml-2 text-[11px] text-slate-400">
                {t("home.previewBarLabel")}
              </span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <PreviewCard
                label={t("home.previewEntry")}
                value={t(`tripCheck.basis${example.basis === "eta_required" ? "EtaRequired" : "VisaFree"}`, {
                  destination: destinationLabelFor(example.destination) ?? example.destination,
                })}
              />
              <PreviewCard
                label={t("home.previewStay")}
                value={
                  example.stayPolicy?.kind === "fixed_per_entry"
                    ? t("tripCheck.stayFixedPerEntry", { maxDays: example.stayPolicy.maxDays })
                    : ""
                }
              />
              {example.items[0]?.match ? (
                <PreviewCard
                  label={t("home.previewItem", { item: example.items[0].query })}
                  value={t(`tripCheck.verdict.${example.items[0].match.verdict}`)}
                  span
                />
              ) : null}
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">
              <a href="/trip-check" className="text-xs font-medium text-blue-700 hover:underline">
                {t("home.previewCta")}
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <h2 className="text-center font-display text-xl font-bold text-slate-900">
            {t("home.toolsHeading")}
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ToolCard
              icon={<MapPinRouteIcon className="h-6 w-6" />}
              title={t("home.tools.tripCheck.title")}
              body={t("home.tools.tripCheck.body")}
              bullets={tripCheckBullets}
              cta={t("home.tools.tripCheck.cta")}
              href="/trip-check"
              accent="blue"
            />
            <ToolCard
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
        <section className="flex flex-wrap justify-center gap-3">
          <a
            href="/sources"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <GlobeIcon className="h-3.5 w-3.5" />
            {t("home.trustBadgeCoverage", { count: coveredDestinationCount })}
          </a>
          {trustBadges.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              <CompassIcon className="h-3.5 w-3.5 text-blue-700" />
              {label}
            </span>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <h2 className="text-center font-display text-2xl font-bold text-slate-900">
            {t("home.coverageMap.heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("home.coverageMap.sub")}
          </p>
          <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <DestinationsMap />
          </div>
          <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="font-display text-sm font-bold text-slate-900">
              {t("home.coverageMap.listHeading")}
            </h3>
            <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(destinationsByRegion).map(([region, names]) => (
                <div key={region}>
                  <div className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                    {region}
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {names.map((name) => (
                      <li key={name} className="text-sm text-slate-600">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 text-center">
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
          <h2 className="text-center font-display text-2xl font-bold text-slate-900">
            {t("home.blogTeaser.heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("home.blogTeaser.sub")}
          </p>
          <ol className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogPostsByDate.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
                  <img
                    src={`/blog/${post.slug}/opengraph-image`}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-full border border-slate-100 object-cover"
                  />
                  <time dateTime={post.date} className="mt-3 text-[11px] text-slate-400">
                    {post.date}
                  </time>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-900">
                    {post.title}
                  </h3>
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
          <h2 className="text-center font-display text-xl font-bold text-slate-900">
            {t("faqPage.h1")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            {t("faqPage.intro")}
          </p>
          <div className="mt-6">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function PreviewCard({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={`rounded-xl bg-slate-50 p-3 ${span ? "sm:col-span-2" : ""}`}>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

const TOOL_CARD_ACCENTS = {
  blue: { badge: "bg-blue-50 text-blue-700", border: "hover:border-blue-200", dot: "bg-blue-400" },
  amber: { badge: "bg-amber-50 text-amber-700", border: "hover:border-amber-200", dot: "bg-amber-400" },
};

function ToolCard({
  icon,
  title,
  body,
  bullets,
  cta,
  href,
  accent,
}: {
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
      className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg lg:p-8 ${colors.border}`}
    >
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-110 ${colors.badge}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{body}</p>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span className={`h-1 w-1 shrink-0 rounded-full ${colors.dot}`} />
            {b}
          </li>
        ))}
      </ul>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition-all group-hover:gap-2.5">
        {cta} <span aria-hidden="true">→</span>
      </span>
    </a>
  );
}
