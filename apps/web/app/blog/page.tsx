import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { blogPostsByDate } from "../../lib/blog";
import { photos } from "../../lib/photos";

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

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid";
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
    <article className="mx-auto max-w-4xl space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {t("h1")}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          {t("intro")}
        </p>
      </header>

      {blogPostsByDate.length === 0 ? (
        <p className="text-center text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {blogPostsByDate.map((post, i) => (
            <li
              key={post.slug}
              className={i === 0 ? "sm:col-span-2" : undefined}
            >
              <a
                href={`/blog/${post.slug}`}
                className={`group block ${i === 0 ? "sm:grid sm:grid-cols-[3fr_2fr] sm:items-center sm:gap-8" : ""}`}
              >
                <Image
                  src={`/images/photos/${post.photo}.jpg`}
                  alt=""
                  width={photos[post.photo].width}
                  height={photos[post.photo].height}
                  priority={i === 0}
                  sizes={
                    i === 0
                      ? "(min-width: 640px) 540px, 100vw"
                      : "(min-width: 640px) 440px, 100vw"
                  }
                  className="aspect-[3/2] w-full rounded-xl object-cover transition group-hover:opacity-90"
                />
                <div className="mt-4 min-w-0 sm:mt-0">
                  <p
                    className={`text-[11px] tracking-[0.12em] text-slate-500 uppercase ${i === 0 ? "" : "sm:mt-4"}`}
                  >
                    <span className="font-semibold text-brand-700">
                      {post.category}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <time dateTime={post.date}>{post.date}</time>
                  </p>
                  <h2
                    className={`mt-2 font-display font-bold leading-snug text-slate-900 underline-offset-4 group-hover:underline ${i === 0 ? "text-2xl" : "text-lg"}`}
                  >
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                    {post.dek}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
