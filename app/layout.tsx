import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DevFooter } from "@/components/app-shell/DevFooter";

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
  title: "Backtesting Lab",
  description: "Keyboard-first forex replay and backtesting workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <DevFooter />
      </body>
    </html>
  );
}
