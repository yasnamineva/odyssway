import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/**
 * The one share-card template (Open Graph / Twitter) for the site's
 * generated cards: the landing page's own vintage-globe photo, the real
 * wordmark, and the Lora serif the site's headlines use, so a shared link
 * looks like the page it opens. Assets live in apps/web/assets/og (globe.jpg
 * is a 1200×630 crop of public/images/background.jpg; Lora is OFL-licensed).
 */
export const OG_SIZE = { width: 1200, height: 630 };
/** Cards are served as JPEG: a photo card is ~1 MB as PNG, and some apps
 * (WhatsApp among them) skip previews whose image is much over 300 KB. */
export const OG_CONTENT_TYPE = "image/jpeg";

const asset = (name: string) => readFile(join(process.cwd(), "assets/og", name));

export async function ogCard({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub: string }) {
  const [globe, logo, loraBold, loraRegular] = await Promise.all([
    asset("globe.jpg"),
    asset("logo.png"),
    asset("Lora-Bold.ttf"),
    asset("Lora-Regular.ttf"),
  ]);
  const dataUrl = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString("base64")}`;

  const png = new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Lora" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img
          src={dataUrl(globe, "image/jpeg")}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630 }}
        />
        {/* Paper-coloured wash on the left, like the landing hero, so the text sits on a quiet ground. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(247,244,236,0.97) 0%, rgba(247,244,236,0.93) 42%, rgba(247,244,236,0.55) 62%, rgba(247,244,236,0) 80%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 720,
            height: "100%",
            padding: "56px 0 52px 72px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={dataUrl(logo, "image/png")} width={240} height={80} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow ? (
              <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#1f6b46" }}>
                {eyebrow}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                marginTop: eyebrow ? 16 : 0,
                fontSize: title.length > 40 ? 54 : 64,
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#0f172a",
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 27, lineHeight: 1.4, color: "#334155" }}>{sub}</div>
          </div>
          <div style={{ display: "flex", fontSize: 21, color: "#475569" }}>
            odyssway.com · every fact cited to an official source
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Lora", data: loraBold, weight: 700, style: "normal" },
        { name: "Lora", data: loraRegular, weight: 400, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": OG_CONTENT_TYPE, "Cache-Control": "public, max-age=86400, immutable" },
  });
}
