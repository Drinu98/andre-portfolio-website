import React from "react";

/** Palette for generated images, matching the dark tokens in globals.css. */
export const brand = {
  paper: "#0e0f0d",
  ink: "#ede8db",
  muted: "#aaa595",
  line: "#2b2c26",
  accent: "#ff5a24",
} as const;

/** The four-square mark from the site header, sized for `next/og` images. */
export const BlockMark = ({ size }: { size: number }) => {
  const gap = Math.round(size * 0.14);
  const cell = (size - gap) / 2;
  const square = (lit: boolean) => (
    <div
      style={{
        width: cell,
        height: cell,
        background: lit ? brand.accent : brand.ink,
      }}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      <div style={{ display: "flex", gap }}>
        {square(false)}
        {square(true)}
      </div>
      <div style={{ display: "flex", gap }}>
        {square(false)}
        {square(false)}
      </div>
    </div>
  );
};
