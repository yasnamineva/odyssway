import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RuleContent from "../../../../../content/en/rules/90-180-rule.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.rule");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/rules/90-180-rule" },
  };
}

export default async function RulePage() {
  const t = await getTranslations();
  const faq = t.raw("rulesFaq") as Array<{ q: string; a: string }>;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <article className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <RuleContent />
    </article>
  );
}
