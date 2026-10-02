import { ImageResponse } from "next/og";
import { BlockMark, brand } from "@/lib/brand-image";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} — Full‑stack developer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            <div>Concept to launch,</div>
            <div style={{ color: brand.accent }}>end to end.</div>
          </div>
          <div style={{ fontSize: 30, color: brand.muted, lineHeight: 1.25 }}>
            Self‑employed full‑stack developer building end‑to‑end systems for
            clients.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: `1px solid ${brand.line}`,
            fontSize: 22,
            color: brand.muted,
          }}
        >
          <div>UI/UX → Frontend → Backend → Deployment</div>
          <div style={{ color: brand.accent }}>{siteConfig.url.host}</div>
        </div>
      </div>
    ),
    size,
  );
}
