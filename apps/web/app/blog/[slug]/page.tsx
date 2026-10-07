import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { blogPostBySlug, blogPosts } from "../../../lib/blog";
import { destinationByCode, destinationPath } from "../../../lib/destinations";
import { SITE_URL } from "../../../lib/site";
import { photos } from "../../../lib/photos";
import Photo from "../../../components/content/Photo";

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
  const image = {
    url: `/images/photos/${post.photo}.jpg`,
    width: photos[post.photo].width,
    height: photos[post.photo].height,
  };
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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
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
    .filter(
      (d): d is NonNullable<typeof d> =>
        d !== undefined && d.status === "verified",
    );

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.dek,
    image: `${SITE_URL}/images/photos/${post.photo}.jpg`,
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 2, name: post.title, item: postUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <a
        href="/blog"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t("backToBlog")}
      </a>

      <header>
        <p className="text-[11px] tracking-[0.12em] text-slate-500 uppercase">
          <span className="font-semibold text-brand-700">{post.category}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.date}>{post.date}</time>
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-slate-900 lg:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          {post.dek}
        </p>
      </header>

      <Photo name={post.photo} hero />

      <div className="space-y-5 text-[17px] leading-relaxed text-slate-800 [&_a]:text-brand-800 [&_a]:underline [&_a]:decoration-brand-300 [&_a]:underline-offset-2 hover:[&_a]:decoration-brand-700 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:mt-1.5 [&_li]:text-[17px] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:text-[17px] [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <PostBody />
      </div>

      {relatedDestinations.length > 0 && (
        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t("relatedDestinations")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {relatedDestinations.map((d) => (
              <li key={d.code}>
                <a
                  href={destinationPath(d)}
                  className="text-[15px] text-brand-800 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700"
                >
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        <p>
          {t("sourceLabel")}{" "}
          <a
            href={post.legalSource.url}
            rel="noopener noreferrer"
            className="underline"
          >
            {post.legalSource.name}
          </a>
        </p>
        <p>{t("verifiedLabel", { date: post.verifiedAt })}</p>
        {post.changelogDataset && (
          <p>
            <a
              href={`/changelog#dataset-${post.changelogDataset}`}
              className="underline"
            >
              {t("changelogLink")}
            </a>
          </p>
        )}
        <p className="pt-1">{t("disclaimer")}</p>
      </div>
    </article>
  );
}
