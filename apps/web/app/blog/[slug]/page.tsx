import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { blogPostBySlug, blogPosts } from "../../../lib/blog";
import { destinationByCode } from "../../../lib/destinations";
import { SITE_URL } from "../../../lib/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) return {};
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.dek;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.verifiedAt,
    },
    twitter: { title, description },
  };
}

/** MDX bodies live one per post in content/en/blog/ — the directory and extension are
 * fixed, so this template-literal import resolves statically at build time. */
async function loadPostBody(slug: string): Promise<ComponentType> {
  const mod = (await import(`../../../../../content/en/blog/${slug}.mdx`)) as {
    default: ComponentType;
  };
  return mod.default;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("blogPostPage");
  const PostBody = await loadPostBody(post.slug);

  const relatedDestinations = (post.destinationCodes ?? [])
    .map((code) => destinationByCode(code))
    .filter((d): d is NonNullable<typeof d> => d !== undefined && d.status === "verified");

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.dek,
    image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    datePublished: post.date,
    dateModified: post.verifiedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    author: { "@type": "Organization", name: "Odyssway", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Odyssway",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: postUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <a href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        {t("backToBlog")}
      </a>

      <header>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-700 uppercase">
          {post.category}
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {post.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{post.dek}</p>
        <time dateTime={post.date} className="mt-3 block text-xs text-slate-500">
          {post.date}
        </time>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element -- self-generated same-origin PNG, not a candidate for next/image optimization */}
      <img
        src={`/blog/${post.slug}/opengraph-image`}
        alt=""
        className="aspect-[1200/630] w-full rounded-2xl border border-slate-200 object-cover"
      />

      <div className="space-y-4 text-sm leading-relaxed text-slate-700 [&_a]:underline [&_a]:decoration-slate-300 [&_a]:underline-offset-2 hover:[&_a]:decoration-slate-500 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <PostBody />
      </div>

      {relatedDestinations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            {t("relatedDestinations")}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {relatedDestinations.map((d) => (
              <li key={d.code}>
                <a
                  href={`/destinations/${d.code.toLowerCase()}`}
                  className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
                >
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <p>
          {t("sourceLabel")}{" "}
          <a href={post.legalSource.url} rel="noopener noreferrer" className="underline">
            {post.legalSource.name}
          </a>
        </p>
        <p>{t("verifiedLabel", { date: post.verifiedAt })}</p>
        {post.changelogDataset && (
          <p>
            <a href={`/changelog#dataset-${post.changelogDataset}`} className="underline">
              {t("changelogLink")}
            </a>
          </p>
        )}
        <p className="pt-1">{t("disclaimer")}</p>
      </div>
    </article>
  );
}
