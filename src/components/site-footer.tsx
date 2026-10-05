import React from "react";
import { siteConfig } from "@/lib/site";

export const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="col site-footer__row">
          <p>Built with love by {siteConfig.name}</p>
          <div className="site-footer__links">
            {siteConfig.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
