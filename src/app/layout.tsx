import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

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
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <Script
          src="https://tpembars.com/NDk0NjIz.js?t=494623"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${notoSansKR.className} antialiased`}>
        <TooltipProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </TooltipProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
