import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pol-UX - Plateforme Collaborative Écologique",
  description: "Découvrez et participez aux initiatives écologiques partout en France",
  keywords: "écologie, environnement, initiatives, France, développement durable",
  authors: [{ name: "Pol-UX Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Pol-UX - Plateforme Collaborative Écologique",
    description: "Découvrez et participez aux initiatives écologiques partout en France",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
