import { ImageResponse } from "next/og";
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
              "radial-gradient(820px 420px at 25% 40%, rgba(59, 130, 246, 0.35), transparent 60%), radial-gradient(700px 440px at 80% 40%, rgba(168, 85, 247, 0.30), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -1 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 28, opacity: 0.92, lineHeight: 1.2 }}>
            Websites + mobile apps — end‑to‑end delivery
          </div>
          <div style={{ fontSize: 20, opacity: 0.82, lineHeight: 1.3 }}>
            UI/UX • Full‑stack • Deployment
          </div>
        </div>
      </div>
    ),
    size,
  );
}

