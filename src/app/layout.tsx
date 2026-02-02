import type { ReactNode } from "react";

// Root layout is minimal — actual layout lives in [locale]/layout.tsx.
// This is needed so non-locale routes (robots.ts, sitemap.ts, api/) still work.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
