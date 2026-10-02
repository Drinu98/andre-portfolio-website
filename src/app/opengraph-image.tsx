import { ImageResponse } from "next/og";
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
          justifyContent: "center",
          padding: 72,
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 400px at 20% 30%, rgba(59, 130, 246, 0.35), transparent 60%), radial-gradient(700px 420px at 75% 35%, rgba(168, 85, 247, 0.30), transparent 60%), radial-gradient(600px 420px at 40% 80%, rgba(34, 197, 94, 0.18), transparent 65%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 30, opacity: 0.92, lineHeight: 1.2 }}>
            Self‑employed full‑stack developer building end‑to‑end systems for
            clients.
          </div>
          <div style={{ fontSize: 22, opacity: 0.82, lineHeight: 1.3 }}>
            Websites + mobile apps — UI/UX → backend → deployment
          </div>
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 18,
            opacity: 0.75,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
            }}
          />
          <div>{siteConfig.url.host}</div>
        </div>
      </div>
    ),
    size,
  );
}

