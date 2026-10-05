import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  // The site used to be split across pages. Those paths now live as sections
  // of the homepage, so old links and search results land in the right place.
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/projects", destination: "/#projects", permanent: true },
      { source: "/work", destination: "/#projects", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
