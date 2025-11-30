import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Toaster } from "sonner";
import { PerformanceInit } from "@/components/performance-init";
import { FirstVisitModal } from "@/components/auth/first-visit-modal";
import { StructuredData } from "@/components/seo/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Dazzle Jewels | Premium Jewelry Collection",
    template: "%s | Dazzle Jewels"
  },
  description: "Discover our exquisite collection of handcrafted jewelry. From diamond rings to gold necklaces, find the perfect piece for every occasion.",
  keywords: ["jewelry", "diamond rings", "gold necklaces", "handcrafted jewelry", "premium jewelry", "engagement rings", "wedding bands"],
  authors: [{ name: "Dazzle Jewels" }],
  creator: "Dazzle Jewels",
  publisher: "Dazzle Jewels",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dazzle Jewels | Premium Jewelry Collection",
    description: "Discover our exquisite collection of handcrafted jewelry.",
    url: "https://dazzlejewels.com",
    siteName: "Dazzle Jewels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dazzle Jewels Premium Jewelry Collection"
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dazzle Jewels | Premium Jewelry Collection",
    description: "Discover our exquisite collection of handcrafted jewelry.",
    images: ["/og-image.jpg"],
    creator: "@dazzlejewels",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add after setting up Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://lybgpojceogwcmvalmnl.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Canonical URL */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <StructuredData />
        <PerformanceInit />
        <FirstVisitModal />
        <Header />
        <CartSheet />
        {children}
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
