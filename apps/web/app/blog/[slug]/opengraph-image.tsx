import { ImageResponse } from "next/og";
import { blogPostBySlug } from "../../../lib/blog";
import { OgCard } from "../../../lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT_BY_CATEGORY: Record<string, string> = {
  "Regulation change": "#f59e0b",
  "Site news": "#34d399",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  const accent = (post && ACCENT_BY_CATEGORY[post.category]) || "#60a5fa";

  return new ImageResponse(
    (
      <OgCard
        eyebrow={post?.category}
        title={post?.title ?? "Odyssway Blog"}
        sub={post ? `Checked against official sources: ${post.verifiedAt}` : "odyssway"}
        accent={accent}
        badges={post ? [post.date] : undefined}
      />
    ),
    { ...size },
  );
}
