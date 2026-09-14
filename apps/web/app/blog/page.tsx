import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { blogPostsByDate } from "../../lib/blog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.blog");
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: "/blog",
      types: { "application/rss+xml": "/blog/feed.xml" },
    },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function BlogIndexPage() {
  const t = await getTranslations("blogPage");

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Odyssway Blog",
    url: `${SITE_URL}/blog`,
    blogPost: blogPostsByDate.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {t("h1")}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      {blogPostsByDate.length === 0 ? (
        <p className="text-center text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2">
          {blogPostsByDate.map((post) => (
            <li key={post.slug}>
              <a
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
                <img
                  src={`/blog/${post.slug}/opengraph-image`}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full border border-slate-100 object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700 uppercase">
                      {post.category}
                    </span>
                    <time dateTime={post.date} className="text-xs text-slate-500">
                      {post.date}
                    </time>
                  </div>
                  <h2 className="mt-1 font-display text-base font-bold text-slate-900">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {post.dek}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-900 transition-all group-hover:gap-2">
                    {t("readMore")}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
