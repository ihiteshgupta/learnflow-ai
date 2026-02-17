import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { env } from "@/lib/env";
// Validate environment variables at startup
import "@/lib/startup";

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
    default: "Dronacharya - AI that teaches like a Guru",
    template: "%s | Dronacharya",
  },
  description: "AI-powered learning platform with personalized tutoring. Master programming, data science, and AI/ML with guided learning from intelligent agents.",
  keywords: ["AI tutor", "learn programming", "data science", "machine learning", "personalized learning", "Dronacharya", "online learning", "AI education"],
  authors: [{ name: "Margadeshaka", url: "https://margadeshaka.ai" }],
  creator: "Margadeshaka",
  publisher: "Margadeshaka",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/logo.svg",
  },
  openGraph: {
    title: "Dronacharya - AI that teaches like a Guru",
    description: "Master programming, data science, and AI/ML with AI-powered personalized tutoring.",
    siteName: "Dronacharya",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/brand/logo.svg",
        width: 120,
        height: 120,
        alt: "Dronacharya Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dronacharya - AI that teaches like a Guru",
    description: "Master programming, data science, and AI/ML with AI-powered personalized tutoring.",
    creator: "@DronacharyaAI",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <TRPCProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
