import { ImageResponse } from "next/og";
import { BlockMark, brand } from "@/lib/brand-image";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} — Full‑stack developer`;
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: brand.paper,
          color: brand.ink,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BlockMark size={44} />
          <div style={{ fontSize: 30, fontWeight: 600 }}>{siteConfig.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 80,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            <div>Concept to launch,</div>
            <div style={{ color: brand.accent }}>end to end.</div>
          </div>
          <div style={{ fontSize: 28, color: brand.muted, lineHeight: 1.25 }}>
            Websites + mobile apps — end‑to‑end delivery
          </div>
        </div>

        <div
          style={{
            display: "flex",
            paddingTop: 24,
            borderTop: `1px solid ${brand.line}`,
            fontSize: 22,
            color: brand.accent,
          }}
        >
          UI/UX • Full‑stack • Deployment
        </div>
      </div>
    ),
    size,
  );
}
