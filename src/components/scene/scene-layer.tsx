"use client";
import React, { useEffect, useRef } from "react";
import { stations, type StationId } from "@/lib/stations";
import type { Sculpture, SculptureHit } from "./sculpture";

/** The window event the contact form fires once a message is sent. */
export const PULSE_EVENT = "sculpture:pulse";

/**
 * Mounts the sculpture as a click-through layer over the page and keeps it in
 * step with the DOM. Each section has a `[data-stage]` panel; the piece docks
 * in whichever panel was scrolled to last, and flies across the page to the
 * next one. Anything carrying `data-focus` lights its blocks, and is lit back
 * when the blocks are hovered.
 */
export const SceneLayer = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const labels = labelsRef.current;
    const tooltip = tooltipRef.current;
    if (!host || !labels || !tooltip) return;

    const root = document.documentElement;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let sculpture: Sculpture | null = null;
    let cancelled = false;
    let frame = 0;
    let current: StationId = "home";
    let dragStage: HTMLElement | null = null;
    let marked = false;
    let ghostTimer = 0;

    // Three sources of focus, in priority order.
    let domFocus: string | null = null;
    let sceneFocus: string | null = null;
    let scrollFocus: string | null = null;
    const applyFocus = () =>
      sculpture?.setFocus(domFocus ?? sceneFocus ?? scrollFocus);

    const stageEl = (id: StationId) =>
      document.querySelector<HTMLElement>(`[data-stage="${id}"]`);
    const autoTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-focus-auto]"),
    );

    const measure = () => {
      frame = 0;
      const height = window.innerHeight;

      // The live piece docks in whichever visible panel is nearest the middle
      // of the screen. The current panel gets a head start so it does not
      // flicker between two that are equally close.
      let next = current;
      let nearest = Infinity;
      for (const { id } of stations) {
        const rect = stageEl(id)?.getBoundingClientRect();
        if (!rect || rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > height) continue;
        const distance =
          Math.abs(rect.top + rect.height / 2 - height / 2) -
          (id === current ? 80 : 0);
        if (distance < nearest) {
          nearest = distance;
          next = id;
        }
      }
      if (next !== current || !marked) {
        current = next;
        marked = Boolean(sculpture);
        for (const { id } of stations)
          stageEl(id)?.toggleAttribute(
            "data-live",
            Boolean(sculpture) && id === current,
          );
      }
      sculpture?.setStation(current);

      const line = height * 0.45;
      const under = autoTargets.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });
      scrollFocus = under?.dataset.focus ?? null;
      applyFocus();
      sculpture?.invalidate();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Panels keep a faint still of their formation for when the piece is away.
    const paintGhosts = () => {
      if (!sculpture) return;
      const ghosts = sculpture.renderGhosts();
      for (const { id } of stations) {
        const url = ghosts[id];
        stageEl(id)?.style.setProperty("--ghost", url ? `url(${url})` : "none");
      }
    };
    const onResize = () => {
      schedule();
      window.clearTimeout(ghostTimer);
      ghostTimer = window.setTimeout(paintGhosts, 250);
    };

    const light = (key: string | null) => {
      for (const el of document.querySelectorAll("[data-lit]"))
        el.removeAttribute("data-lit");
      if (!key) return;
      for (const el of document.querySelectorAll(`[data-focus="${key}"]`))
        el.setAttribute("data-lit", "");
    };

    const onHover = (hit: SculptureHit | null) => {
      sceneFocus = hit?.key ?? null;
      light(sceneFocus);
      applyFocus();
      root.toggleAttribute("data-scene-hit", Boolean(hit));
      tooltip.dataset.visible = hit ? "true" : "false";
      if (!hit) return;
      const [title, sub] = tooltip.children as unknown as HTMLElement[];
      title.textContent = hit.label;
      sub.textContent = hit.sub ?? "";
      const flip = hit.x > window.innerWidth - 260;
      tooltip.style.transform = `translate3d(${hit.x + (flip ? -16 : 16)}px, ${hit.y + 16}px, 0) translateX(${flip ? "-100%" : "0"})`;
    };

    const onSelect = (key: string) => {
      const target =
        document.querySelector(`[data-focus="${key}"][data-focus-auto]`) ??
        document.querySelector(`[data-focus="${key}"]`);
      target?.scrollIntoView({
        block: "center",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };

    // The canvas ignores the pointer, so its panel stands in for it.
    const activeStage = (target: EventTarget | null) => {
      const stage = (target as Element | null)?.closest?.<HTMLElement>(
        "[data-stage]",
      );
      return stage?.dataset.stage === current ? stage : null;
    };
    const focusOf = (target: EventTarget | null) =>
      (target as Element | null)?.closest?.<HTMLElement>("[data-focus]")
        ?.dataset.focus ?? null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const stage = activeStage(event.target);
      if (!stage || !sculpture) return;
      event.preventDefault();
      dragStage = stage;
      stage.setPointerCapture(event.pointerId);
      root.setAttribute("data-scene-drag", "");
      sculpture.startDrag();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !sculpture) return;
      if (dragStage) return sculpture.drag(event.movementX, event.movementY);
      if (activeStage(event.target))
        sculpture.hoverAt(event.clientX, event.clientY);
      else sculpture.hoverEnd();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragStage) return;
      if (dragStage.hasPointerCapture(event.pointerId))
        dragStage.releasePointerCapture(event.pointerId);
      dragStage = null;
      root.removeAttribute("data-scene-drag");
      sculpture?.endDrag();
    };
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      domFocus = focusOf(event.target);
      applyFocus();
    };
    const onFocusIn = (event: FocusEvent) => {
      domFocus = focusOf(event.target);
      applyFocus();
    };
    const onFocusOut = () => {
      domFocus = null;
      applyFocus();
    };
    const onPulse = () => sculpture?.pulse();

    const themeObserver = new MutationObserver(() => {
      sculpture?.setTheme();
      paintGhosts();
    });

    import("./sculpture")
      .then(({ Sculpture }) => {
        if (cancelled) return;
        sculpture = new Sculpture(host, labels, {
          count: wide ? 1200 : 700,
          maxPixelRatio: wide ? 2 : 1.5,
          reducedMotion,
          wide,
          getStage: (id) => stageEl(id)?.getBoundingClientRect() ?? null,
          onHover,
          onSelect,
        });
        root.dataset.webgl = "ok";
        paintGhosts();
        measure();
      })
      .catch(() => {
        // No WebGL: the page reads fine without the scene.
        root.dataset.webgl = "none";
      });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener(PULSE_EVENT, onPulse);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(ghostTimer);
      window.removeEventListener(PULSE_EVENT, onPulse);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      themeObserver.disconnect();
      sculpture?.dispose();
    };
  }, []);

  return (
    <>
      <div ref={hostRef} className="scene" aria-hidden="true" />
      <div ref={labelsRef} className="scene-labels" aria-hidden="true" />
      <div
        ref={tooltipRef}
        className="scene-tooltip"
        data-visible="false"
        aria-hidden="true"
      >
        <strong />
        <span />
      </div>
    </>
  );
};
