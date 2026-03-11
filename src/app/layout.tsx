import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorker";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  title: "SIGA180 - Gestão para Personal Trainers",
  description: "Plataforma SaaS de gestão completa para Personal Trainers. Gerir clientes, treinos, nutrição e muito mais.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://siga180.pt"),
  openGraph: {
    title: "SIGA180 - Gestão para Personal Trainers",
    description: "Plataforma SaaS de gestão completa para Personal Trainers. Gerir clientes, treinos, nutrição e muito mais.",
    url: "https://siga180.pt",
    siteName: "SIGA180",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SIGA180 - Gestão para Personal Trainers",
    description: "Plataforma SaaS de gestão completa para Personal Trainers.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIGA180",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100`} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <CookieBanner />
            <ServiceWorkerRegistrar />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}