"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SceneLayer } from "./scene-layer";

/**
 * The sculpture is tied to the homepage's sections, so it only mounts there.
 * It stays in the layout, outside `<main>`, because the page is layered over
 * it. Other pages also drop the state the scene leaves on `<html>`.
 */
export const HomeScene = () => {
  const home = usePathname() === "/";

  useEffect(() => {
    if (home) return;
    const { dataset } = document.documentElement;
    delete dataset.station;
    delete dataset.side;
    delete dataset.webgl;
  }, [home]);

  return home ? <SceneLayer /> : null;
};
