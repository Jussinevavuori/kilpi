import { Footer } from "@/components/Footer";
import "./globals.css";

import { Header, HeaderContent, UnauthenticatedHeaderContent } from "@/components/Header";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = { title: "Kilpi Demo" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header>
          <Suspense fallback={<UnauthenticatedHeaderContent />}>
            <HeaderContent />
          </Suspense>
        </Header>

        <div className="mx-auto flex max-w-5xl px-4 py-16">{children}</div>

        <Footer />

        <Toaster />
      </body>
    </html>
  );
}
