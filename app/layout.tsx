import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PhootSuite - AI Social Media Command Center",
    template: "%s | PhootSuite",
  },
  description:
    "Schedule, analyze, and manage six social platforms with AI-powered workflows built for agencies and SMB teams.",
  openGraph: {
    title: "PhootSuite - AI Social Media Command Center",
    description:
      "Schedule, analyze, and manage six social platforms with AI-powered workflows built for agencies and SMB teams.",
    url: appUrl,
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
