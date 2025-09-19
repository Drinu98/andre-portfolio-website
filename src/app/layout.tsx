import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ViewTransitions } from "next-view-transitions";
import { Footer } from "@/components/navbar/footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { BackToTop } from "@/components/back-to-top";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Andre Galea's Portfolio",
  description: "Andre Galea Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class">
            <Toaster position="top-center" />
            <main
              className={`${inter.className} relative bg-neutral-100 antialiased [--pattern-fg:var(--color-neutral-950)]/5 dark:bg-neutral-950 dark:[--pattern-fg:var(--color-neutral-100)]/5`}
            >
              <Navbar />
              {children}
              <Footer />
              <BackToTop />
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
