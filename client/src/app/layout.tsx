import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from 'next/font/google'
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/language-context";



const sans = Inter_Tight({
  subsets: ['latin'], weight: ['400','500','600'], variable: '--font-sans',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'], weight: ['400','500'], variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL("https://physaflow-t10.vercel.app"),
  title: {
    default: "PhysaFlow — Stranded Capacity Index",
    template: "%s | PhysaFlow",
  },
  description:
    "Stranded Capacity Index — installed, energized and paid for, yet unable to do work.",
  openGraph: {
    title: "PhysaFlow — Stranded Capacity Index",
    description:
      "Stranded Capacity Index — installed, energized and paid for, yet unable to do work.",
    url: "https://physaflow-t10.vercel.app",
    siteName: "PhysaFlow",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "PhysaFlow — Stranded Capacity Index",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhysaFlow — Stranded Capacity Index",
    description:
      "Stranded Capacity Index — installed, energized and paid for, yet unable to do work.",
    images: ["/og-banner.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        `${sans.variable} ${mono.variable}`,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
