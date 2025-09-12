import "./globals.css";

import { Footer } from "@/components/Footer";
import { Header, Header_Unauthenticated } from "@/components/Header";
import { KilpiClientCacheRefresh } from "@/components/KilpiClientCacheRefresh";
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

export const metadata: Metadata = {
  title: "Kilpi News — Next RSC Demo",
  description: "Kilpi demo application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={<Header_Unauthenticated />}>
          <Header />
        </Suspense>

        <div className="mx-auto flex max-w-5xl px-4 py-16">{children}</div>

        <Footer />

        <Toaster />

        <Suspense fallback={null}>
          <KilpiClientCacheRefresh />
        </Suspense>
      </body>
    </html>
  );
}
