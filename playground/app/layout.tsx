import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Scalyn 分析台",
  description: "输入文本，调用 Scalyn 生成综合分析报告",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
