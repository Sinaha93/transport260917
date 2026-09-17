import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상차 운영센터",
  description: "차량·철제 파렛트·품목 기준정보와 상차 운영을 관리합니다.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
