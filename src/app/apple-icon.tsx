import { ImageResponse } from "next/og";
import { BlockMark, brand } from "@/lib/brand-image";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.paper,
        }}
      >
        <BlockMark size={92} />
      </div>
    ),
    size,
  );
}
