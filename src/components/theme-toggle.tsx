"use client";
import { useTheme } from "next-themes";
import React from "react";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="icon-button"
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="theme-glyph" aria-hidden="true" />
    </button>
  );
};
