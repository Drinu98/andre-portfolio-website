"use client";
import React, { useEffect, useRef, useState } from "react";
import { hostOf, isExternal, projects } from "@/constants/projects";
import {
  figureNumber,
  focusKey,
  stations,
  type StationId,
} from "@/lib/stations";
import type { CardFace, Sculpture, SculptureHit } from "./sculpture";

const DESKTOP = "(min-width: 960px)";
/** A phone on its side: too short to stack the piece above the hero copy. */
const SHORT_LANDSCAPE =
  "(max-width: 959px) and (orientation: landscape) and (max-height: 540px)";

/** The window event the contact form fires once a message is sent. */
export const PULSE_EVENT = "sculpture:pulse";

/** What each project's card on the reel says. */
const cardFaces: Record<string, CardFace> = Object.fromEntries(
  projects.map((project, index) => [
    focusKey.project(project.title),
    {
      index: String(index + 1).padStart(2, "0"),
      title: project.title,
      kind: project.kind,
      place: isExternal(project.href)
        ? hostOf(project.href)
        : "Internal system",
      note: `${project.stack.length} tools`,
    },
  ]),
);

/** How far down the viewport an entry has to be to take the scroll focus. */
const FOCUS_LINE = 0.42;

/** Room kept clear at the bottom of the viewport for the figure caption. */
const CAPTION_SPACE = 118;

/**
 * Mounts the sculpture behind the page and keeps it in step with the DOM:
 * scroll position picks the formation, and anything carrying `data-focus`
 * lights its blocks (and is lit back when the blocks are hovered).
 *
 * The hero holds the piece in the middle of the sheet. After that the text
 * column alternates sides, and the piece takes whichever side is free.
 */
export const SceneLayer = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [station, setStation] = useState<StationId>("home");
  const [interactive, setInteractive] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const labels = labelsRef.current;
    const tooltip = tooltipRef.current;
    if (!host || !labels || !tooltip) return;

    const root = document.documentElement;
    const desktop = window.matchMedia(DESKTOP);
    const shortLandscape = window.matchMedia(SHORT_LANDSCAPE);
    const home = document.getElementById("home");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let sculpture: Sculpture | null = null;
    let cancelled = false;
    let frame = 0;
    let current: StationId = "home";

    // Three sources of focus, in priority order.
    let domFocus: string | null = null;
    let sceneFocus: string | null = null;
    let scrollFocus: string | null = null;
    const applyFocus = () =>
      sculpture?.setFocus(domFocus ?? sceneFocus ?? scrollFocus);

    const sections = stations.map(({ id }) => ({
      id,
      el: document.getElementById(id),
    }));
    const autoTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-focus-auto]"),
    );

    const measure = () => {
      frame = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;

      let next: StationId = "home";
      for (const { id, el } of sections)
        if (el && el.getBoundingClientRect().top <= height * 0.5) next = id;
      if (next !== current) {
        current = next;
        root.dataset.station = next;
        setStation(next);
      }
      sculpture?.setStation(current);

      const line = height * FOCUS_LINE;
      const under = autoTargets.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });
      scrollFocus = under?.dataset.focus ?? null;
      applyFocus();

      if (desktop.matches) {
        const section = sections.find((s) => s.id === current)?.el;
        const column = section?.querySelector<HTMLElement>(".col");
        const header =
          parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) ||
          76;

        // The piece stays inside the part of its own section that is on
        // screen, so it never ends up behind the next section's text.
        const rect = section?.getBoundingClientRect();
        const top = Math.max(header, rect?.top ?? 0);
        const bottom = Math.max(
          top + 160,
          Math.min(height - CAPTION_SPACE, rect?.bottom ?? height),
        );

        let side: "center" | "left" | "right" = "center";
        let left = width * 0.28;
        let right = width * 0.72;
        if (column) {
          const text = column.getBoundingClientRect();
          side = text.left + text.width / 2 < width / 2 ? "right" : "left";
          left = side === "right" ? text.right + 56 : 48;
          right = side === "right" ? width - 48 : text.left - 56;
        }
        root.dataset.side = side;
        sculpture?.setFrame({
          centerX: (left + right) / 2,
          centerY: (top + bottom) / 2,
          fitWidth: right - left,
          fitHeight: (bottom - top) * (side === "center" ? 0.74 : 0.86),
        });
        host.style.removeProperty("--scene-fade");
      } else {
        // On small screens the piece leads the hero, then fades back so the
        // text that scrolls over it stays readable.
        const lead = current === "home";
        const beside = shortLandscape.matches;
        // Stacked, the piece starts to fade as soon as the copy scrolls up
        // into it. Beside the copy it can wait until the hero is leaving.
        const progress = beside
          ? Math.min(
              1,
              Math.max(
                0,
                (height - (home?.getBoundingClientRect().bottom ?? 0)) /
                  (height * 0.5),
              ),
            )
          : Math.min(1, window.scrollY / (height * 0.34));
        sculpture?.setFrame(
          lead && beside
            ? {
                centerX: width * 0.77,
                centerY: height * 0.57,
                fitWidth: width * 0.4,
                fitHeight: height * 0.7,
              }
            : {
                centerX: width / 2,
                centerY: lead ? height * 0.3 : height * 0.5,
                fitWidth: width * 0.94,
                fitHeight: lead ? height * 0.4 : height * 0.62,
              },
        );
        host.style.setProperty("--scene-fade", String(1 - progress * 0.88));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const light = (key: string | null) => {
      for (const el of document.querySelectorAll("[data-lit]"))
        el.removeAttribute("data-lit");
      if (!key) return;
      for (const el of document.querySelectorAll(`[data-focus="${key}"]`))
        el.setAttribute("data-lit", "");
    };

    const onHover = (hit: SculptureHit | null) => {
      sceneFocus = hit && !hit.passive ? hit.key : null;
      light(sceneFocus);
      applyFocus();
      tooltip.dataset.visible = hit ? "true" : "false";
      if (!hit) return;
      const [title, sub] = tooltip.children as unknown as HTMLElement[];
      title.textContent = hit.label;
      sub.textContent = hit.sub ?? "";
      const flip = hit.x > window.innerWidth - 300;
      tooltip.style.transform = `translate3d(${hit.x + (flip ? -18 : 18)}px, ${hit.y + 18}px, 0) translateX(${flip ? "-100%" : "0"})`;
    };

    // Clicking part of the piece scrolls its entry onto the line the scroll
    // focus reads from, so the entry takes the focus once it arrives.
    const onSelect = (key: string) => {
      const target =
        document.querySelector(`[data-focus="${key}"][data-focus-auto]`) ??
        document.querySelector(`[data-focus="${key}"]`);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      window.scrollTo({
        top:
          window.scrollY +
          rect.top +
          rect.height / 2 -
          window.innerHeight * FOCUS_LINE,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };

    const focusOf = (target: EventTarget | null) =>
      (target as Element | null)?.closest?.<HTMLElement>("[data-focus]")
        ?.dataset.focus ?? null;
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

    const themeObserver = new MutationObserver(() => sculpture?.setTheme());

    import("./sculpture")
      .then(({ Sculpture }) => {
        if (cancelled) return;
        const wide = desktop.matches;
        sculpture = new Sculpture(host, labels, {
          count: wide ? 1400 : 800,
          maxPixelRatio: wide ? 2 : 1.5,
          reducedMotion,
          interactive: wide,
          quietFocus: !wide,
          // Small screens keep the scene as a faint backdrop, where cards
          // would fight the text, so they get the frames without the faces.
          cardFaces: wide ? cardFaces : undefined,
          onHover,
          onSelect,
        });
        root.dataset.webgl = "ok";
        setInteractive(wide);
        setTouch(window.matchMedia("(hover: none)").matches);
        measure();
      })
      .catch(() => {
        // No WebGL: the page reads fine without the scene.
        root.dataset.webgl = "none";
      });

    root.dataset.station = current;
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(PULSE_EVENT, onPulse);
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
      window.removeEventListener("resize", schedule);
      window.removeEventListener(PULSE_EVENT, onPulse);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      themeObserver.disconnect();
      sculpture?.dispose();
    };
  }, []);

  const index = stations.findIndex((s) => s.id === station);
  const active = stations[index];

  return (
    <>
      <div ref={hostRef} className="scene" aria-hidden="true" />
      <div ref={labelsRef} className="scene-labels" aria-hidden="true" />
      <div className="marks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      {/* The caption follows the piece from side to side; the pips under it
          are the six arrangements, and double as section links. */}
      <div className="figure">
        <div key={active.id} className="figure__text" aria-hidden="true">
          <span className="mono figure__number">
            Fig. {figureNumber(index)}
          </span>
          <span className="figure__name">{active.figure}</span>
          <span className="figure__caption">{active.caption}</span>
        </div>
        <nav className="pips" aria-label="Sections">
          {stations.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-label={s.nav}
              aria-current={s.id === station ? "true" : undefined}
            >
              <span className="mono" aria-hidden="true">
                {s.figure}
              </span>
            </a>
          ))}
        </nav>
        {interactive && (
          <span className="mono figure__hint" aria-hidden="true">
            Drag to turn · {touch ? "Tap" : "Hover"} to inspect
          </span>
        )}
      </div>

      <div
        ref={tooltipRef}
        className="tooltip mono"
        data-visible="false"
        aria-hidden="true"
      >
        <strong />
        <span />
        <span>Click to open</span>
      </div>
    </>
  );
};
