import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";

import { DevFooter } from "@/components/app-shell/DevFooter";

import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${syne.variable} ${ibmPlexMono.variable} dark h-full`}
      style={
        {
          "--font-sans": "var(--font-display)",
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <DevFooter />
      </body>
    </html>
  );
}
