import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Octacore | Atlética de Computação da UFAL",
  description: "Esporte, integração e história da Atlética Octacore.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
