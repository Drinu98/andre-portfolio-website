"use client";
import React, { useEffect, useState } from "react";
import { figureNumber, stations } from "@/lib/stations";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

const links = stations
  .map((station, index) => ({ ...station, index }))
  .filter((station) => station.id !== "home");

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const desktop = window.matchMedia("(min-width: 960px)");
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", close);
    };
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled} data-open={open}>
      <div className="wrap site-header__bar">
        <a
          className="brand"
          href="#home"
          aria-label={`${siteConfig.name} home`}
          onClick={() => setOpen(false)}
        >
          <span className="brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {siteConfig.name}
        </a>

        <nav id="site-nav" className="site-nav" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-nav={link.id}
              onClick={() => setOpen(false)}
            >
              <span className="mono">{figureNumber(link.index)}</span>
              {link.nav}
            </a>
          ))}
        </nav>

        <div className="site-header__tools">
          <ThemeToggle />
          <a className="button button--small" href="#contact">
            Get in touch
          </a>
          <button
            type="button"
            className="menu-toggle mono"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
};
