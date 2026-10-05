import type { Metadata } from "next";
import { siteConfig } from "./site";

type PageMetadata = {
  title: string;
  /** Skips the `%s | Site name` template in the root layout. */
  absoluteTitle?: boolean;
  description: string;
  /** The page's own path. Becomes its canonical and `og:url`. */
  path: string;
};

/**
 * Metadata for one page. Next replaces `openGraph` and `twitter` wholesale
 * rather than merging them with the layout's, so the shared fields are
 * restated here. The canonical lives here too: set in the layout, every page
 * would inherit the homepage's. Images are left to each route's
 * `opengraph-image` file.
 */
export const pageMetadata = ({
  title,
  absoluteTitle,
  description,
  path,
}: PageMetadata): Metadata => ({
  title: absoluteTitle ? { absolute: title } : title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.title,
    url: path,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: siteConfig.twitterHandle,
  },
});
