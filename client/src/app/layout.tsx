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
  title: "PhysaFlow",
  description: "Stranded Capacity Index Report",
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
