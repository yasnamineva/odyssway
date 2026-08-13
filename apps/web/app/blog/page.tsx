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
    alternates: { canonical: "/blog" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function BlogIndexPage() {
  const t = await getTranslations("blogPage");

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {t("h1")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      {blogPostsByDate.length === 0 ? (
        <p className="text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <ol className="space-y-5">
          {blogPostsByDate.map((post) => (
            <li key={post.slug}>
              <a
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
                <img
                  src={`/blog/${post.slug}/opengraph-image`}
                  alt=""
                  className="aspect-[1200/630] w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-blue-700 uppercase">
                      {post.category}
                    </span>
                    <time dateTime={post.date} className="text-xs text-slate-500">
                      {post.date}
                    </time>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold text-slate-900">
                    {post.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{post.dek}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition-all group-hover:gap-2.5">
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
