import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "CRM Portal — Build Better Customer Relationships",
    template: "%s | CRM Portal",
  },
  description:
    "The all-in-one CRM platform designed to help you close deals faster, track leads effortlessly, and manage your entire sales pipeline.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "CRM Portal — Build Better Customer Relationships",
    description:
      "The all-in-one CRM platform designed to help you close deals faster, track leads effortlessly, and manage your entire sales pipeline.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRM Portal",
    description: "Build Better Customer Relationships.",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
