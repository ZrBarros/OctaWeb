import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Octacore | Atlética de Computação da UFAL",
  description: "Esporte, integração e história da Atlética Octacore.",
  icons: {
    icon: "/images/logo-octacore.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={outfit.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider><SiteChrome>{children}</SiteChrome></AuthProvider>
      </body>
    </html>
  );
}
