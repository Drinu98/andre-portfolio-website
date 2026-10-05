import { ImageResponse } from "next/og";
import { hostOf, isExternal, projects } from "@/constants/projects";
import { BlockMark, brand } from "@/lib/brand-image";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `A project by ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A PNG card per project: the screenshots are WebP, which not every platform
// that reads Open Graph images can show.
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

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
          <div style={{ fontSize: 30, color: brand.accent }}>
            {project?.kind ?? "Selected work"}
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            {project?.title ?? siteConfig.name}
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
          <div>{project?.stack.slice(0, 4).join(" · ")}</div>
          <div style={{ color: brand.accent }}>
            {project && isExternal(project.href)
              ? hostOf(project.href)
              : siteConfig.url.host}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
