import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

const localeToOg: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://www.triptalk.me/${l}`;
  }

  return {
    metadataBase: new URL("https://www.triptalk.me"),
    title: t("title"),
    description: t("description"),
    keywords: [
      "AI travel planner",
      "AI 여행 플래너",
      "여행 일정",
      "travel itinerary",
      "TripTalk",
    ],
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale: localeToOg[locale] || "ko_KR",
      siteName: "TripTalk",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7c3aed",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={notoSansKR.variable}>
      <head>
        <Script
          src="https://tpembars.com/NDk0NjIz.js?t=494623"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${notoSansKR.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
