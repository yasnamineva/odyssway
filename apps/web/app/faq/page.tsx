import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.faq");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faqPage");
  const items = t.raw("items") as Array<{ q: string; a: string }>;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {t("h1")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      <dl className="space-y-3">
        {items.map((item) => (
          <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="font-display text-base font-bold text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-700">{item.a}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
