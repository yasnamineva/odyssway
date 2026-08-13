/** Shared visual template for every generated OG/share image on the site
 * (app/opengraph-image.tsx and friends) — kept in one place so every card
 * reads as the same brand instead of four hand-tuned one-offs. */
export function OgCard({
  eyebrow,
  title,
  sub,
  accent = "#60a5fa",
  badges,
}: {
  eyebrow?: string;
  title: string;
  sub: string;
  accent?: string;
  badges?: string[];
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#0b1420",
        backgroundImage:
          "linear-gradient(rgba(247,244,236,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(247,244,236,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: accent }} />
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#f7f4ec" }}>Odyssway</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 18px",
              borderRadius: 999,
              background: `${accent}26`,
              color: accent,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 46 : 58,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#f7f4ec",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9fb0c3", lineHeight: 1.4 }}>{sub}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {(badges ?? ["Cited to official sources", "Nothing stored on our servers"]).map((b) => (
          <div
            key={b}
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(247,244,236,0.25)",
              fontSize: 20,
              color: "#f7f4ec",
            }}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}
