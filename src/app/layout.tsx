import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  title: "SIGA180 - Gestão para Personal Trainers",
  description: "Plataforma SaaS de gestão completa para Personal Trainers. Gerir clientes, treinos, nutrição e muito mais.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIGA180",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${outfit.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}