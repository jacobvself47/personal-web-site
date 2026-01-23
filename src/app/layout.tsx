import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jake | Security & GRC Engineering for AI Systems",
    template: "%s | Jake",
  },
  description:
    "Security and GRC engineering focused on what controls AI service providers need. Building in public and sharing the journey.",
  keywords: [
    "Security engineering for AI systems",
    "Kubernetes RBAC security",
    "AI agent security architecture",
    "SOC 2 compliance for AI",
    "AI-assisted development",
    "GRC engineering",
  ],
  authors: [{ name: "Jake" }],
  openGraph: {
    title: "Jake | Security & GRC Engineering for AI Systems",
    description:
      "Security and GRC engineering focused on what controls AI service providers need.",
    url: "https://jakeself.dev",
    siteName: "Jake",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jake | Security & GRC Engineering for AI Systems",
    description:
      "Security and GRC engineering focused on what controls AI service providers need.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
