import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  title: "TripTalk - 대화하면 완성되는 여행 일정",
  description:
    "AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.",
  openGraph: {
    title: "TripTalk - 대화하면 완성되는 여행 일정",
    description:
      "AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
