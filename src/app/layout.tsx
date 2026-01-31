import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripTalk - 대화하면 완성되는 여행 일정",
  description:
    "AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.",
  openGraph: {
    title: "TripTalk - 대화하면 완성되는 여행 일정",
    description:
      "AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
