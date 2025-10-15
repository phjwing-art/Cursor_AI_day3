import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 메모장",
  description: "지능형 메모 관리 시스템",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}