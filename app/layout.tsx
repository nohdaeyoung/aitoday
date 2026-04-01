import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Today - 오늘의 AI 뉴스",
  description: "글로벌 AI 뉴스, 커뮤니티 핫 아티클, GitHub 트렌딩을 한국어로 매일 큐레이션합니다.",
  metadataBase: new URL("https://aitoday.324.ing"),
  openGraph: {
    title: "AI Today - 오늘의 AI 뉴스",
    description: "글로벌 AI 뉴스, 커뮤니티 핫 아티클, GitHub 트렌딩을 한국어로 매일 큐레이션합니다.",
    url: "https://aitoday.324.ing",
    siteName: "AI Today",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Today - 오늘의 AI 뉴스",
    description: "글로벌 AI 뉴스를 한국어로 매일 큐레이션",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        {children}
      </body>
    </html>
  );
}
