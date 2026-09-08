import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { personJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name + " — " + SITE.role,
    template: "%s — " + SITE.name,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    title: SITE.name + " — " + SITE.role,
    description: SITE.description,
    url: SITE.url,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
};

/**
 * Runs before first paint: sets the theme class and the density attribute from
 * storage, falling back to the OS preference. Without this the page paints once
 * in the wrong theme and then corrects itself.
 */
const BOOT_SCRIPT = `(function(){try{var e=document.documentElement,t=localStorage.getItem("portfolio:theme"),d=localStorage.getItem("portfolio:density"),m=window.matchMedia("(prefers-color-scheme: dark)").matches,k=t==="dark"||(t!=="light"&&m);e.classList.toggle("dark",k);e.style.colorScheme=k?"dark":"light";e.dataset.density=d==="list"?"list":"grid"}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </head>
      <body className="bg-canvas text-ink antialiased">
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:ring-1 focus:ring-line"
        >
          Skip to projects
        </a>
        {children}
      </body>
    </html>
  );
}
